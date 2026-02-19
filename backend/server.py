from fastapi import FastAPI, APIRouter, HTTPException, File, UploadFile, BackgroundTasks
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone
import json
from emergentintegrations.llm.chat import LlmChat, UserMessage
from emergentintegrations.llm.openai import OpenAISpeechToText
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Import custom modules
from ml_models import DiseasePredictor, predictor
from prescription_generator import PrescriptionGenerator

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'medical_diagnosis')]

# Create the main app without a prefix
app = FastAPI(
    title="Advanced Medical Diagnosis API",
    description="AI-powered disease prediction and prescription generation",
    version="2.0.0"
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Initialize integrations
EMERGENT_KEY = os.getenv("EMERGENT_LLM_KEY")
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

# Initialize prescription generator
prescription_generator = PrescriptionGenerator(api_key=EMERGENT_KEY) if EMERGENT_KEY else None

# ============================================================================
# PYDANTIC MODELS
# ============================================================================

class PredictionInput(BaseModel):
    disease_type: str = Field(..., description="Type of disease to predict")
    parameters: Dict[str, float] = Field(..., description="Patient parameters for prediction")
    patient_profile: Optional[Dict] = Field(default_factory=dict, description="Additional patient information")

class PredictionResult(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    disease_type: str
    prediction: str
    confidence: float
    risk_level: str
    parameters: Dict[str, float]
    feature_importance: Dict[str, float]
    model_used: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PrescriptionRequest(BaseModel):
    disease: str
    patient_profile: Dict
    prediction_result: Dict

class Recommendation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    disease: str
    medications: List[str]
    safety_measures: List[str]
    diet_recommendations: List[str]
    lifestyle_recommendations: List[str]
    follow_up_care: List[str]

class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    session_id: str

class VideoResult(BaseModel):
    video_id: str
    title: str
    description: str
    thumbnail_url: str
    channel_title: str
    published_at: str

class Article(BaseModel):
    id: str
    title: str
    content: str
    disease: str
    category: str

class HealthMetric(BaseModel):
    patient_id: str
    metric_type: str  # blood_pressure, glucose, weight, etc.
    value: float
    unit: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    notes: Optional[str] = None

class SymptomCheckRequest(BaseModel):
    symptoms: List[str]
    age: Optional[int] = None
    gender: Optional[str] = None
    duration: Optional[str] = None

class MedicationInteractionCheck(BaseModel):
    medications: List[str]

# ============================================================================
# SUPPORTED DISEASES
# ============================================================================

SUPPORTED_DISEASES = {
    'diabetes': {
        'name': 'Type 2 Diabetes',
        'required_params': ['glucose', 'bmi', 'age', 'blood_pressure'],
        'optional_params': ['pregnancies', 'skin_thickness', 'insulin', 'diabetes_pedigree']
    },
    'heart': {
        'name': 'Heart Disease',
        'required_params': ['age', 'cholesterol', 'blood_pressure', 'heart_rate'],
        'optional_params': ['max_hr', 'exercise_induced_angina', 'oldpeak', 'ca', 'thal']
    },
    'parkinson': {
        'name': 'Parkinson\'s Disease',
        'required_params': ['age', 'tremor_score', 'motor_score', 'voice_variation'],
        'optional_params': ['jitter', 'shimmer', 'nhr', 'hnr', 'rpde', 'd2', 'ppe']
    },
    'hypertension': {
        'name': 'Hypertension',
        'required_params': ['age', 'bmi', 'systolic_bp', 'diastolic_bp'],
        'optional_params': ['cholesterol', 'fasting_blood_sugar', 'family_history', 'smoking', 'alcohol']
    },
    'cancer_risk': {
        'name': 'Cancer Risk Assessment',
        'required_params': ['age', 'family_history', 'smoking', 'alcohol', 'bmi'],
        'optional_params': ['physical_activity', 'radiation_exposure', 'chemical_exposure', 'years_of_exposure']
    },
    'kidney_disease': {
        'name': 'Kidney Disease',
        'required_params': ['age', 'blood_pressure_high', 'blood_glucose_random', 'serum_creatinine'],
        'optional_params': ['specific_gravity', 'albumin', 'sugar', 'blood_urea', 'sodium', 'potassium', 'hemoglobin', 'packed_cell_volume']
    },
    'liver_disease': {
        'name': 'Liver Disease',
        'required_params': ['age', 'total_bilirubin', 'alamine_aminotransferase', 'albumin'],
        'optional_params': ['gender', 'direct_bilirubin', 'alkaline_phosphatase', 'aspartate_aminotransferase', 'total_protiens', 'albumin_globulin_ratio']
    },
    'stroke': {
        'name': 'Stroke Risk',
        'required_params': ['age', 'hypertension', 'heart_disease', 'avg_glucose_level', 'bmi'],
        'optional_params': ['married', 'smoking_status', 'gender', 'work_type']
    }
}

# ============================================================================
# ROOT ENDPOINT
# ============================================================================

@api_router.get("/")
async def root():
    return {
        "message": "Advanced Medical Diagnosis API v2.0",
        "status": "healthy",
        "features": [
            "ML-based disease prediction",
            "AI-powered prescription generation",
            "Health chatbot",
            "YouTube video search",
            "Health articles",
            "Symptom checker",
            "Medication interaction checker",
            "Health metrics tracking"
        ],
        "supported_diseases": list(SUPPORTED_DISEASES.keys())
    }

# ============================================================================
# PREDICTION ENDPOINTS
# ============================================================================

@api_router.get("/diseases")
async def get_supported_diseases():
    """Get list of supported diseases and their parameters"""
    return SUPPORTED_DISEASES

@api_router.post("/predict", response_model=PredictionResult)
async def predict_disease(input_data: PredictionInput):
    """
    Predict disease based on input parameters using advanced ML models
    
    This endpoint uses ensemble ML models trained on medical datasets
    to provide accurate predictions with confidence scores and risk levels.
    """
    disease_type = input_data.disease_type.lower()
    params = input_data.parameters
    
    # Validate disease type
    if disease_type not in SUPPORTED_DISEASES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid disease type. Supported: {list(SUPPORTED_DISEASES.keys())}"
        )
    
    # Validate required parameters
    required_params = SUPPORTED_DISEASES[disease_type]['required_params']
    missing_params = [p for p in required_params if p not in params]
    if missing_params:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required parameters: {missing_params}"
        )
    
    try:
        # Use advanced ML predictor
        prediction_data = predictor.predict(disease_type, params)
        
        result = PredictionResult(
            disease_type=disease_type,
            prediction=prediction_data['prediction'],
            confidence=prediction_data['confidence'],
            risk_level=prediction_data['risk_level'],
            parameters=params,
            feature_importance=prediction_data.get('feature_importance', {}),
            model_used=prediction_data.get('model_used', 'ensemble')
        )
        
        # Store in database
        doc = result.model_dump()
        doc['timestamp'] = doc['timestamp'].isoformat()
        doc['patient_profile'] = input_data.patient_profile
        await db.predictions.insert_one(doc)
        
        return result
        
    except Exception as e:
        logging.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@api_router.post("/prescription")
async def generate_prescription(request: PrescriptionRequest):
    """
    Generate AI-powered prescription based on disease and patient profile
    
    This endpoint uses GPT models to generate personalized prescriptions
    with medications, dosages, lifestyle recommendations, and follow-up care.
    """
    if not prescription_generator:
        raise HTTPException(
            status_code=503,
            detail="Prescription generation service not available"
        )
    
    try:
        prescription = await prescription_generator.generate_prescription(
            disease=request.disease,
            patient_profile=request.patient_profile,
            prediction_result=request.prediction_result
        )
        
        # Store prescription in database
        prescription['id'] = str(uuid.uuid4())
        prescription['disease'] = request.disease
        await db.prescriptions.insert_one(prescription)
        
        return prescription
        
    except Exception as e:
        logging.error(f"Prescription generation error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Prescription generation failed: {str(e)}"
        )

# ============================================================================
# RECOMMENDATION ENDPOINTS
# ============================================================================

@api_router.get("/recommendations/{disease}", response_model=Recommendation)
async def get_recommendations(disease: str):
    """
    Get comprehensive recommendations for a disease including medications,
    safety measures, diet, and lifestyle changes.
    """
    recommendations_db = {
        "diabetes": {
            "medications": [
                "Metformin (500mg-1000mg daily) - First-line therapy",
                "Insulin therapy (as prescribed) - If needed",
                "Glipizide (5mg-10mg before meals) - Sulfonylurea",
                "Sitagliptin (100mg once daily) - DPP-4 inhibitor",
                "Empagliflozin (10mg daily) - SGLT2 inhibitor"
            ],
            "safety_measures": [
                "Monitor blood glucose levels regularly (fasting and post-meal)",
                "Check feet daily for cuts, blisters, or infections",
                "Maintain regular eye examinations (annual)",
                "Keep emergency glucose tablets or gel handy",
                "Wear medical alert identification",
                "Exercise for 30 minutes daily (150 min/week)",
                "Vaccinations: Flu annually, Pneumococcal as recommended"
            ],
            "diet_recommendations": [
                "Follow consistent carbohydrate-controlled meal plan",
                "Choose complex carbohydrates with low glycemic index",
                "Increase fiber intake (25-35g daily)",
                "Limit refined carbohydrates and added sugars",
                "Choose lean proteins (fish, chicken, legumes)",
                "Eat healthy fats (nuts, avocados, olive oil) in moderation",
                "Control portion sizes",
                "Stay hydrated with water (8-10 glasses daily)",
                "Time meals consistently with medication"
            ],
            "lifestyle_recommendations": [
                "Maintain healthy weight (BMI 18.5-24.9)",
                "Engage in regular physical activity",
                "Quit smoking if applicable",
                "Limit alcohol consumption",
                "Manage stress through meditation or yoga",
                "Get adequate sleep (7-8 hours per night)",
                "Attend diabetes education classes",
                "Join diabetes support groups"
            ],
            "follow_up_care": [
                "HbA1c test every 3 months",
                "Fasting lipid panel annually",
                "Kidney function tests annually",
                "Comprehensive eye exam annually",
                "Foot examination at every visit",
                "Blood pressure checks at every visit",
                "Regular dental checkups"
            ]
        },
        "heart": {
            "medications": [
                "Aspirin (81mg daily) - Antiplatelet",
                "Statin (Atorvastatin 10mg-80mg) - Cholesterol lowering",
                "Beta-blocker (Metoprolol 25mg-100mg) - Heart rate control",
                "ACE inhibitor (Lisinopril 10mg-40mg) - Blood pressure control",
                "Nitroglycerin (as needed) - For angina"
            ],
            "safety_measures": [
                "Monitor blood pressure daily",
                "Avoid strenuous activities without medical clearance",
                "Manage stress through meditation or yoga",
                "Get adequate sleep (7-8 hours)",
                "Quit smoking immediately",
                "Limit alcohol consumption (moderate)",
                "Learn CPR techniques",
                "Keep emergency medications accessible"
            ],
            "diet_recommendations": [
                "Follow Mediterranean or DASH diet pattern",
                "Reduce sodium intake (less than 2,300mg daily)",
                "Eat omega-3 rich foods (salmon, mackerel, walnuts)",
                "Increase fruits and vegetables (5+ servings daily)",
                "Choose whole grains over refined grains",
                "Limit saturated fats (< 10% of calories)",
                "Eliminate trans fats completely",
                "Choose lean proteins",
                "Limit added sugars"
            ],
            "lifestyle_recommendations": [
                "Cardiac rehabilitation program if prescribed",
                "Gradual increase in physical activity",
                "Maintain healthy weight",
                "Manage stress effectively",
                "Regular health checkups",
                "Join cardiac support groups",
                "Keep activity and symptom diary"
            ],
            "follow_up_care": [
                "Cardiology follow-up every 3-6 months",
                "Stress testing as recommended",
                "Echocardiogram annually or as needed",
                "Lipid panel every 6-12 weeks initially",
                "Blood pressure monitoring weekly",
                "ECG at regular intervals",
                "Medication review at each visit"
            ]
        },
        "parkinson": {
            "medications": [
                "Levodopa/Carbidopa (as prescribed) - Gold standard",
                "Dopamine agonists (Pramipexole, Ropinirole) - Adjunct therapy",
                "MAO-B inhibitors (Selegiline, Rasagiline) - Symptom control",
                "Amantadine (100mg twice daily) - For dyskinesia",
                "COMT inhibitors (Entacapone) - Prolong Levodopa effect"
            ],
            "safety_measures": [
                "Install grab bars and handrails at home",
                "Remove tripping hazards (rugs, cords)",
                "Use assistive devices (walker, cane) if needed",
                "Practice balance exercises daily",
                "Attend physical therapy sessions regularly",
                "Keep regular neurology appointments",
                "Wear medical alert identification",
                "Maintain safe bathroom environment"
            ],
            "diet_recommendations": [
                "Eat high-fiber foods to prevent constipation",
                "Drink plenty of water (8+ glasses daily)",
                "Choose protein-rich foods (separate from medication timing)",
                "Include antioxidant-rich foods (berries, leafy greens)",
                "Take small, frequent meals",
                "Consider soft foods if swallowing is difficult",
                "Maintain adequate calcium and vitamin D",
                "Limit caffeine intake"
            ],
            "lifestyle_recommendations": [
                "Regular physical therapy and exercise",
                "Speech therapy if needed",
                "Occupational therapy for daily activities",
                "Stay socially active",
                "Maintain mental stimulation",
                "Keep symptom diary",
                "Join Parkinson's support groups",
                "Practice relaxation techniques"
            ],
            "follow_up_care": [
                "Neurology follow-up every 3-6 months",
                "UPDRS assessment regularly",
                "Cognitive and mood evaluations annually",
                "Bone density scans",
                "Swallowing evaluations as needed",
                "Medication adjustments as symptoms change",
                "Physical therapy reassessment"
            ]
        },
        "hypertension": {
            "medications": [
                "ACE inhibitors (Lisinopril 10mg-40mg daily)",
                "ARBs (Losartan 50mg-100mg daily)",
                "Calcium channel blockers (Amlodipine 5mg-10mg daily)",
                "Thiazide diuretics (Hydrochlorothiazide 12.5-25mg daily)",
                "Beta-blockers (Metoprolol 25mg-100mg daily)"
            ],
            "safety_measures": [
                "Monitor blood pressure regularly",
                "Avoid sudden position changes",
                "Limit sodium intake strictly",
                "Manage stress effectively",
                "Maintain healthy weight",
                "Regular exercise (moderate intensity)",
                "Limit alcohol consumption",
                "Quit smoking"
            ],
            "diet_recommendations": [
                "Follow DASH diet strictly",
                "Limit sodium to < 2,300mg daily",
                "Increase potassium intake (fruits, vegetables)",
                "Choose low-fat dairy products",
                "Limit processed and packaged foods",
                "Eat plenty of fruits and vegetables",
                "Choose whole grains",
                "Include lean proteins"
            ],
            "lifestyle_recommendations": [
                "Regular aerobic exercise (150 min/week)",
                "Maintain healthy BMI (18.5-24.9)",
                "Stress management techniques",
                "Adequate sleep (7-8 hours)",
                "Weight management",
                "Regular health checkups",
                "Home BP monitoring"
            ],
            "follow_up_care": [
                "BP monitoring weekly",
                "Follow-up every 4-6 weeks initially",
                "Lipid panel annually",
                "Kidney function tests annually",
                "Electrolyte panel periodically",
                "Eye exam annually",
                "ECG periodically"
            ]
        },
        "cancer_risk": {
            "medications": [
                "Screening and prevention focus",
                "Vaccinations (HPV, Hepatitis B)",
                "Chemoprevention as recommended",
                "Genetic counseling if indicated"
            ],
            "safety_measures": [
                "Quit smoking immediately",
                "Limit alcohol consumption",
                "Protect from UV radiation",
                "Avoid environmental carcinogens",
                "Maintain healthy weight",
                "Regular exercise",
                "Vaccinations",
                "Regular screenings"
            ],
            "diet_recommendations": [
                "Eat 5+ servings of fruits/vegetables daily",
                "Choose whole grains",
                "Limit red meat",
                "Avoid processed meats",
                "Choose healthy fats",
                "Limit added sugars",
                "Stay hydrated",
                "Antioxidant-rich foods"
            ],
            "lifestyle_recommendations": [
                "Regular cancer screenings",
                "Maintain healthy weight",
                "Regular exercise",
                "Stress management",
                "Adequate sleep",
                "Limit alcohol",
                "Quit smoking",
                "Protect from sun exposure"
            ],
            "follow_up_care": [
                "Age-appropriate cancer screenings",
                "Annual physical examination",
                "Regular self-examinations",
                "Genetic counseling if needed",
                "Specific imaging based on risk",
                "Regular consultations with oncologist"
            ]
        },
        "kidney_disease": {
            "medications": [
                "ACE inhibitors or ARBs",
                "Diuretics if needed",
                "Phosphate binders if indicated",
                "Erythropoiesis-stimulating agents if anemic",
                "Vitamin D supplements"
            ],
            "safety_measures": [
                "Control blood pressure tightly",
                "Manage diabetes carefully",
                "Avoid NSAIDs",
                "Stay hydrated appropriately",
                "Monitor fluid intake",
                "Avoid nephrotoxic substances",
                "Regular kidney function tests",
                "Vaccinations"
            ],
            "diet_recommendations": [
                "Follow renal diet as prescribed",
                "Limit protein as recommended",
                "Restrict sodium (< 2,000mg)",
                "Limit potassium if elevated",
                "Limit phosphorus if needed",
                "Control fluid intake",
                "Work with renal dietitian"
            ],
            "lifestyle_recommendations": [
                "Regular exercise as tolerated",
                "Maintain healthy weight",
                "Quit smoking",
                "Stress management",
                "Adequate sleep",
                "Regular nephrology follow-up"
            ],
            "follow_up_care": [
                "Nephrology follow-up every 1-3 months",
                "Creatinine/GFR every 1-3 months",
                "Potassium levels regularly",
                "Hemoglobin regularly",
                "Urine protein regularly",
                "BP monitoring daily"
            ]
        },
        "liver_disease": {
            "medications": [
                "Antivirals if hepatitis",
                "Immunosuppressants if autoimmune",
                "Ursodeoxycholic acid for PBC",
                "Vitamin supplements as needed",
                "Diuretics if ascites present"
            ],
            "safety_measures": [
                "Complete alcohol abstinence",
                "Vaccinations (Hepatitis A, B)",
                "Avoid hepatotoxic substances",
                "Practice safe food handling",
                "Avoid raw shellfish",
                "Medication caution",
                "Regular monitoring"
            ],
            "diet_recommendations": [
                "Follow liver-healthy diet",
                "Adequate protein intake",
                "Limit sodium if fluid retention",
                "Complex carbohydrates",
                "Fruits and vegetables",
                "Limit saturated fats",
                "Avoid added sugars",
                "Stay hydrated"
            ],
            "lifestyle_recommendations": [
                "No alcohol",
                "Maintain healthy weight",
                "Regular exercise",
                "Adequate rest",
                "Stress management",
                "Regular hepatology follow-up"
            ],
            "follow_up_care": [
                "Hepatology follow-up every 3-6 months",
                "LFTs every 3-6 months",
                "CBC regularly",
                "INR if on anticoagulants",
                "Ultrasound periodically",
                "Endoscopy if varices"
            ]
        },
        "stroke": {
            "medications": [
                "Antiplatelets (Aspirin, Clopidogrel)",
                "Anticoagulants if atrial fibrillation",
                "Statins (high-intensity)",
                "Antihypertensives",
                "Antidiabetics if diabetic"
            ],
            "safety_measures": [
                "Control blood pressure tightly",
                "Manage diabetes carefully",
                "Quit smoking immediately",
                "Take medications regularly",
                "Know stroke warning signs",
                "Emergency plan in place",
                "Fall prevention",
                "Regular checkups"
            ],
            "diet_recommendations": [
                "Follow Mediterranean or DASH diet",
                "Limit sodium (< 2,300mg)",
                "Increase fruits/vegetables (5+ servings)",
                "Whole grains",
                "Lean proteins",
                "Omega-3 rich foods",
                "Limit saturated/trans fats",
                "Limit added sugars"
            ],
            "lifestyle_recommendations": [
                "Regular exercise as tolerated",
                "Maintain healthy weight",
                "Stress management",
                "Adequate sleep",
                "Treat sleep apnea",
                "Regular neurology follow-up",
                "Rehabilitation exercises"
            ],
            "follow_up_care": [
                "Neurology follow-up every 3-6 months",
                "BP monitoring regularly",
                "Lipid panel every 3-6 months",
                "Carotid ultrasound if indicated",
                "Cardiac evaluation if needed",
                "Cognitive assessment annually",
                "Rehabilitation therapy"
            ]
        }
    }
    
    disease_lower = disease.lower()
    if disease_lower not in recommendations_db:
        raise HTTPException(status_code=404, detail=f"Recommendations not found for {disease}")
    
    return Recommendation(
        disease=disease_lower,
        **recommendations_db[disease_lower]
    )

# ============================================================================
# CHATBOT ENDPOINTS
# ============================================================================

@api_router.post("/chat", response_model=ChatResponse)
async def chat_with_bot(chat_input: ChatMessage):
    """
    Chat with health bot using GPT
    
    The bot provides accurate, empathetic health information while
    reminding users to consult healthcare professionals.
    """
    session_id = chat_input.session_id or str(uuid.uuid4())
    
    if not EMERGENT_KEY:
        raise HTTPException(status_code=503, detail="Chat service not available")
    
    try:
        chat = LlmChat(
            api_key=EMERGENT_KEY,
            session_id=session_id,
            system_message="""You are Dr. AI, a helpful and empathetic medical assistant bot with 20+ years of clinical experience.

IMPORTANT GUIDELINES:
1. Provide accurate, evidence-based health information
2. Always be empathetic and supportive
3. Remind users to consult with healthcare professionals for medical advice
4. Keep responses concise, clear, and easy to understand
5. Never diagnose - only provide information
6. Recommend seeking emergency care for serious symptoms
7. Respect privacy and confidentiality
8. Be encouraging about healthy lifestyle choices
9. Suggest reputable sources for more information
10. Ask follow-up questions when appropriate

Focus on providing helpful, actionable health information while being clear about the limitations of AI advice."""
        ).with_model("openai", "gpt-5.1")
        
        user_message = UserMessage(text=chat_input.message)
        response = await chat.send_message(user_message)
        
        # Store chat history
        await db.chat_history.insert_one({
            "session_id": session_id,
            "user_message": chat_input.message,
            "bot_response": response,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
        return ChatResponse(response=response, session_id=session_id)
        
    except Exception as e:
        logging.error(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail="Chat service error")

@api_router.post("/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    """
    Transcribe audio to text using Whisper
    
    Useful for voice input in the health bot or recording patient symptoms.
    """
    if not EMERGENT_KEY:
        raise HTTPException(status_code=503, detail="Transcription service not available")
    
    try:
        import tempfile
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as temp_file:
            content = await audio.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        # Transcribe
        stt = OpenAISpeechToText(api_key=EMERGENT_KEY)
        with open(temp_file_path, "rb") as audio_file:
            response = await stt.transcribe(
                file=audio_file,
                model="whisper-1",
                response_format="json"
            )
        
        # Clean up temp file
        os.unlink(temp_file_path)
        
        return {"text": response.text}
        
    except Exception as e:
        logging.error(f"Transcription error: {str(e)}")
        raise HTTPException(status_code=500, detail="Transcription failed")

# ============================================================================
# VIDEO AND ARTICLE ENDPOINTS
# ============================================================================

@api_router.get("/videos/search", response_model=List[VideoResult])
async def search_videos(query: str, disease: Optional[str] = None, max_results: int = 6):
    """
    Search YouTube for health-related videos
    
    Returns educational videos about diseases, treatments, and health tips.
    """
    if not YOUTUBE_API_KEY or YOUTUBE_API_KEY == "YOUR_YOUTUBE_API_KEY_HERE":
        # Return mock data if no API key
        mock_videos = [
            {
                "video_id": "dQw4w9WgXcQ",
                "title": f"Understanding {disease or query} - Comprehensive Guide",
                "description": "A comprehensive guide to understanding and managing the condition with expert medical advice.",
                "thumbnail_url": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400",
                "channel_title": "Medical Education Channel",
                "published_at": "2024-01-15T10:00:00Z"
            },
            {
                "video_id": "abc123xyz",
                "title": f"Diet and Nutrition for {disease or query}",
                "description": "Learn about the best dietary practices for managing your health from nutrition experts.",
                "thumbnail_url": "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=400",
                "channel_title": "Health & Nutrition",
                "published_at": "2024-02-20T14:30:00Z"
            },
            {
                "video_id": "xyz789abc",
                "title": f"Exercise and Physical Therapy for {disease or query}",
                "description": "Safe and effective exercises recommended by physiotherapists and fitness experts.",
                "thumbnail_url": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400",
                "channel_title": "PhysioTech",
                "published_at": "2024-03-10T09:15:00Z"
            }
        ]
        return [VideoResult(**video) for video in mock_videos]
    
    try:
        youtube = build("youtube", "v3", developerKey=YOUTUBE_API_KEY, cache_discovery=False)
        
        search_query = f"{query} {disease or ''} doctor medical advice".strip()
        
        request = youtube.search().list(
            part="snippet",
            q=search_query,
            type="video",
            maxResults=max_results,
            relevanceLanguage="en",
            safeSearch="strict",
            order="relevance"
        )
        response = request.execute()
        
        results = []
        for item in response.get("items", []):
            results.append(VideoResult(
                video_id=item["id"]["videoId"],
                title=item["snippet"]["title"],
                description=item["snippet"]["description"],
                thumbnail_url=item["snippet"]["thumbnails"]["high"]["url"],
                channel_title=item["snippet"]["channelTitle"],
                published_at=item["snippet"]["publishedAt"]
            ))
        
        return results
        
    except HttpError as e:
        logging.error(f"YouTube API error: {str(e)}")
        raise HTTPException(status_code=400, detail="YouTube search failed")

@api_router.get("/articles", response_model=List[Article])
async def get_articles(disease: Optional[str] = None):
    """
    Get health articles and educational content
    
    Returns articles about various health conditions, prevention, and wellness.
    """
    articles_db = [
        {
            "id": "1",
            "title": "Understanding Type 2 Diabetes: A Comprehensive Guide",
            "content": "Diabetes is a chronic condition affecting how your body processes blood sugar. Learn about symptoms, management, and prevention strategies. Key points include monitoring blood glucose, maintaining a healthy diet, regular exercise, and medication adherence.",
            "disease": "diabetes",
            "category": "education"
        },
        {
            "id": "2",
            "title": "Heart Health: Prevention and Early Detection",
            "content": "Heart disease is preventable. Discover lifestyle changes, warning signs, and screening recommendations. Focus on controlling blood pressure, managing cholesterol, regular exercise, healthy diet, and avoiding smoking.",
            "disease": "heart",
            "category": "prevention"
        },
        {
            "id": "3",
            "title": "Living with Parkinson's Disease: Daily Management Tips",
            "content": "Parkinson's affects movement but doesn't define you. Explore strategies for maintaining quality of life including medication management, physical therapy, speech therapy, and lifestyle adjustments.",
            "disease": "parkinson",
            "category": "lifestyle"
        },
        {
            "id": "4",
            "title": "Nutrition and Disease Prevention",
            "content": "Your diet plays a crucial role in preventing chronic diseases. Learn about anti-inflammatory foods, balanced nutrition, and dietary strategies for optimal health.",
            "disease": "general",
            "category": "nutrition"
        },
        {
            "id": "5",
            "title": "Exercise Guidelines for Chronic Conditions",
            "content": "Physical activity is medicine. Discover safe exercise recommendations for various health conditions. Always consult your doctor before starting a new exercise program.",
            "disease": "general",
            "category": "fitness"
        },
        {
            "id": "6",
            "title": "Managing Hypertension: A Patient's Guide",
            "content": "Learn effective strategies for managing high blood pressure through diet, exercise, stress management, and medication. Regular monitoring and lifestyle changes are key to success.",
            "disease": "hypertension",
            "category": "management"
        },
        {
            "id": "7",
            "title": "Cancer Prevention: What You Need to Know",
            "content": "Understand risk factors and prevention strategies for various types of cancer. Early detection through regular screenings saves lives. Lifestyle changes can significantly reduce risk.",
            "disease": "cancer_risk",
            "category": "prevention"
        },
        {
            "id": "8",
            "title": "Kidney Health: Protecting Your Filters",
            "content": "Learn about kidney function, common kidney diseases, and how to maintain kidney health through diet, hydration, and avoiding nephrotoxic substances.",
            "disease": "kidney_disease",
            "category": "education"
        },
        {
            "id": "9",
            "title": "Liver Health: Understanding Your Body's Chemical Factory",
            "content": "Your liver performs over 500 vital functions. Learn how to protect it from damage, recognize signs of liver disease, and maintain optimal liver health.",
            "disease": "liver_disease",
            "category": "education"
        },
        {
            "id": "10",
            "title": "Stroke Awareness: Recognizing and Preventing Stroke",
            "content": "Learn the FAST acronym for stroke recognition and understand stroke risk factors. Quick action can save lives and reduce disability. Prevention includes controlling blood pressure and living a healthy lifestyle.",
            "disease": "stroke",
            "category": "prevention"
        }
    ]
    
    if disease:
        articles_db = [a for a in articles_db if a["disease"] == disease.lower() or a["disease"] == "general"]
    
    return [Article(**article) for article in articles_db]

# ============================================================================
# ADDITIONAL FEATURES
# ============================================================================

@api_router.post("/symptom-check")
async def check_symptoms(request: SymptomCheckRequest):
    """
    AI-powered symptom checker
    
    Analyzes symptoms and provides preliminary information about possible conditions.
    Always recommends consulting a healthcare provider for proper diagnosis.
    """
    if not EMERGENT_KEY:
        raise HTTPException(status_code=503, detail="Symptom checker not available")
    
    try:
        prompt = f"""Analyze the following symptoms and provide preliminary information:

Symptoms: {', '.join(request.symptoms)}
Age: {request.age if request.age else 'not specified'}
Gender: {request.gender if request.gender else 'not specified'}
Duration: {request.duration if request.duration else 'not specified'}

Provide:
1. Possible conditions (with likelihood percentages)
2. Urgency level (emergency, urgent, non-urgent)
3. Recommended next steps
4. When to seek immediate medical attention

IMPORTANT: This is not a diagnosis. Always recommend consulting a healthcare provider."""

        chat = LlmChat(
            api_key=EMERGENT_KEY,
            session_id=f"symptom_check_{datetime.now().timestamp()}",
            system_message="""You are a medical symptom checker assistant. Provide preliminary information about symptoms without making definitive diagnoses. Always emphasize the importance of consulting healthcare professionals. Be thorough and accurate."""
        ).with_model("openai", "gpt-5.1")
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        return {
            "symptoms": request.symptoms,
            "analysis": response,
            "disclaimer": "This is preliminary information only. Consult a healthcare provider for proper diagnosis and treatment.",
            "analyzed_at": datetime.now(timezone.utc).isoformat()
        }
        
    except Exception as e:
        logging.error(f"Symptom check error: {str(e)}")
        raise HTTPException(status_code=500, detail="Symptom check failed")

@api_router.post("/medication-interactions")
async def check_medication_interactions(request: MedicationInteractionCheck):
    """
    Check for potential drug interactions
    
    Analyzes a list of medications for potential interactions, contraindications,
    and warnings. Always consult a pharmacist or healthcare provider.
    """
    if not EMERGENT_KEY:
        raise HTTPException(status_code=503, detail="Interaction checker not available")
    
    try:
        medications_str = ', '.join(request.medications)
        
        prompt = f"""Analyze the following medications for potential interactions:

Medications: {medications_str}

Provide:
1. Known drug-drug interactions
2. Drug-food interactions
3. Contraindications
4. Warnings and precautions
5. Recommendations for safe use

IMPORTANT: This is for informational purposes only. Always consult a pharmacist or healthcare provider."""

        chat = LlmChat(
            api_key=EMERGENT_KEY,
            session_id=f"interaction_check_{datetime.now().timestamp()}",
            system_message="""You are a pharmacy expert. Provide accurate information about medication interactions while emphasizing the importance of consulting healthcare professionals."""
        ).with_model("openai", "gpt-5.1")
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        return {
            "medications": request.medications,
            "interaction_analysis": response,
            "disclaimer": "This is informational only. Always consult a pharmacist or healthcare provider before starting, stopping, or changing medications.",
            "analyzed_at": datetime.now(timezone.utc).isoformat()
        }
        
    except Exception as e:
        logging.error(f"Interaction check error: {str(e)}")
        raise HTTPException(status_code=500, detail="Interaction check failed")

@api_router.post("/health-metrics")
async def record_health_metric(metric: HealthMetric):
    """
    Record health metrics for tracking over time
    
    Allows patients to track blood pressure, glucose, weight, and other metrics.
    Useful for monitoring chronic conditions and treatment effectiveness.
    """
    try:
        doc = metric.model_dump()
        doc['id'] = str(uuid.uuid4())
        doc['timestamp'] = doc['timestamp'].isoformat()
        
        await db.health_metrics.insert_one(doc)
        
        return {
            "message": "Health metric recorded successfully",
            "id": doc['id'],
            "metric_type": metric.metric_type,
            "value": metric.value,
            "unit": metric.unit,
            "timestamp": doc['timestamp']
        }
        
    except Exception as e:
        logging.error(f"Health metric recording error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to record health metric")

@api_router.get("/health-metrics/{patient_id}")
async def get_health_metrics(patient_id: str, metric_type: Optional[str] = None, limit: int = 100):
    """
    Retrieve health metrics for a patient
    
    Returns historical health metrics for tracking and analysis.
    """
    try:
        query = {"patient_id": patient_id}
        if metric_type:
            query["metric_type"] = metric_type
        
        cursor = db.health_metrics.find(query).sort("timestamp", -1).limit(limit)
        metrics = await cursor.to_list(length=limit)
        
        # Convert ObjectId to string
        for metric in metrics:
            metric['_id'] = str(metric['_id'])
        
        return {
            "patient_id": patient_id,
            "metric_type": metric_type,
            "count": len(metrics),
            "metrics": metrics
        }
        
    except Exception as e:
        logging.error(f"Health metric retrieval error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve health metrics")

# ============================================================================
# MIDDLEWARE AND CONFIGURATION
# ============================================================================

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()