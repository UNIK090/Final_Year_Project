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
import random
import tempfile

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Initialize integrations
EMERGENT_KEY = os.getenv("EMERGENT_LLM_KEY")
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

# Models
class PredictionInput(BaseModel):
    disease_type: str  # "diabetes", "heart", "parkinson"
    parameters: Dict[str, float]

class PredictionResult(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    disease_type: str
    prediction: str  # "positive" or "negative"
    confidence: float
    risk_level: str  # "low", "medium", "high"
    parameters: Dict[str, float]
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Recommendation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    disease: str
    medications: List[str]
    safety_measures: List[str]
    diet_recommendations: List[str]

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

# Mock ML Prediction Functions
def predict_diabetes(params: Dict[str, float]) -> tuple:
    """
    Mock diabetes prediction based on glucose, BMI, age, blood_pressure
    """
    glucose = params.get('glucose', 100)
    bmi = params.get('bmi', 25)
    age = params.get('age', 30)
    blood_pressure = params.get('blood_pressure', 80)
    
    # Simple rule-based mock
    score = 0
    if glucose > 140: score += 30
    elif glucose > 100: score += 15
    
    if bmi > 30: score += 25
    elif bmi > 25: score += 10
    
    if age > 45: score += 20
    elif age > 35: score += 10
    
    if blood_pressure > 90: score += 25
    elif blood_pressure > 80: score += 10
    
    confidence = min(95, 60 + random.randint(-10, 10))
    
    if score >= 60:
        return "positive", confidence / 100, "high"
    elif score >= 35:
        return "positive", confidence / 100, "medium"
    else:
        return "negative", confidence / 100, "low"

def predict_heart_disease(params: Dict[str, float]) -> tuple:
    """
    Mock heart disease prediction
    """
    age = params.get('age', 30)
    cholesterol = params.get('cholesterol', 200)
    blood_pressure = params.get('blood_pressure', 120)
    heart_rate = params.get('heart_rate', 70)
    
    score = 0
    if age > 55: score += 25
    elif age > 45: score += 15
    
    if cholesterol > 240: score += 30
    elif cholesterol > 200: score += 15
    
    if blood_pressure > 140: score += 30
    elif blood_pressure > 120: score += 15
    
    if heart_rate > 100: score += 15
    elif heart_rate < 60: score += 10
    
    confidence = min(95, 65 + random.randint(-10, 10))
    
    if score >= 65:
        return "positive", confidence / 100, "high"
    elif score >= 40:
        return "positive", confidence / 100, "medium"
    else:
        return "negative", confidence / 100, "low"

def predict_parkinsons(params: Dict[str, float]) -> tuple:
    """
    Mock Parkinson's prediction
    """
    age = params.get('age', 30)
    tremor_score = params.get('tremor_score', 0)
    motor_score = params.get('motor_score', 0)
    voice_variation = params.get('voice_variation', 0)
    
    score = 0
    if age > 60: score += 20
    elif age > 50: score += 10
    
    if tremor_score > 7: score += 30
    elif tremor_score > 4: score += 15
    
    if motor_score > 25: score += 25
    elif motor_score > 15: score += 12
    
    if voice_variation < 2: score += 25
    elif voice_variation < 4: score += 12
    
    confidence = min(95, 70 + random.randint(-10, 10))
    
    if score >= 60:
        return "positive", confidence / 100, "high"
    elif score >= 35:
        return "positive", confidence / 100, "medium"
    else:
        return "negative", confidence / 100, "low"

# Routes
@api_router.get("/")
async def root():
    return {"message": "Medical Diagnosis API is running", "status": "healthy"}

@api_router.post("/predict", response_model=PredictionResult)
async def predict_disease(input_data: PredictionInput):
    """
    Predict disease based on input parameters
    """
    disease_type = input_data.disease_type.lower()
    params = input_data.parameters
    
    if disease_type == "diabetes":
        prediction, confidence, risk_level = predict_diabetes(params)
    elif disease_type == "heart":
        prediction, confidence, risk_level = predict_heart_disease(params)
    elif disease_type == "parkinson":
        prediction, confidence, risk_level = predict_parkinsons(params)
    else:
        raise HTTPException(status_code=400, detail="Invalid disease type")
    
    result = PredictionResult(
        disease_type=disease_type,
        prediction=prediction,
        confidence=confidence,
        risk_level=risk_level,
        parameters=params
    )
    
    # Store in database
    doc = result.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.predictions.insert_one(doc)
    
    return result

@api_router.get("/recommendations/{disease}", response_model=Recommendation)
async def get_recommendations(disease: str):
    """
    Get medication, safety, and diet recommendations for a disease
    """
    recommendations_db = {
        "diabetes": {
            "medications": [
                "Metformin (500mg-1000mg daily)",
                "Insulin therapy (as prescribed)",
                "Glipizide (5mg-10mg before meals)",
                "Sitagliptin (100mg once daily)"
            ],
            "safety_measures": [
                "Monitor blood glucose levels regularly (fasting and post-meal)",
                "Check feet daily for cuts, blisters, or infections",
                "Maintain regular eye examinations",
                "Keep emergency glucose tablets handy",
                "Wear medical alert identification",
                "Exercise for 30 minutes daily"
            ],
            "diet_recommendations": [
                "Focus on high-fiber foods (whole grains, vegetables)",
                "Limit refined carbohydrates and sugars",
                "Choose lean proteins (fish, chicken, legumes)",
                "Eat healthy fats (nuts, avocados, olive oil)",
                "Control portion sizes",
                "Stay hydrated with water"
            ]
        },
        "heart": {
            "medications": [
                "Aspirin (75mg-100mg daily)",
                "Statins (Atorvastatin 10mg-80mg)",
                "Beta-blockers (Metoprolol 25mg-100mg)",
                "ACE inhibitors (Lisinopril 10mg-40mg)"
            ],
            "safety_measures": [
                "Monitor blood pressure daily",
                "Avoid strenuous activities without medical clearance",
                "Manage stress through meditation or yoga",
                "Get adequate sleep (7-8 hours)",
                "Quit smoking immediately",
                "Limit alcohol consumption"
            ],
            "diet_recommendations": [
                "Follow Mediterranean diet pattern",
                "Reduce sodium intake (less than 2g daily)",
                "Eat omega-3 rich foods (salmon, mackerel, walnuts)",
                "Increase fruits and vegetables (5+ servings daily)",
                "Choose whole grains over refined grains",
                "Limit saturated and trans fats"
            ]
        },
        "parkinson": {
            "medications": [
                "Levodopa/Carbidopa (as prescribed)",
                "Dopamine agonists (Pramipexole, Ropinirole)",
                "MAO-B inhibitors (Selegiline, Rasagiline)",
                "Amantadine (for dyskinesia)"
            ],
            "safety_measures": [
                "Install grab bars and handrails at home",
                "Remove tripping hazards (rugs, cords)",
                "Use assistive devices (walker, cane) if needed",
                "Practice balance exercises daily",
                "Attend physical therapy sessions",
                "Keep regular neurology appointments"
            ],
            "diet_recommendations": [
                "Eat high-fiber foods to prevent constipation",
                "Drink plenty of water (8+ glasses daily)",
                "Choose protein-rich foods (but separate from medication)",
                "Include antioxidant-rich foods (berries, leafy greens)",
                "Take small, frequent meals",
                "Consider soft foods if swallowing is difficult"
            ]
        }
    }
    
    disease_lower = disease.lower()
    if disease_lower not in recommendations_db:
        raise HTTPException(status_code=404, detail="Recommendations not found for this disease")
    
    return Recommendation(
        disease=disease_lower,
        **recommendations_db[disease_lower]
    )

@api_router.post("/chat", response_model=ChatResponse)
async def chat_with_bot(chat_input: ChatMessage):
    """
    Chat with health bot using GPT-5.1
    """
    session_id = chat_input.session_id or str(uuid.uuid4())
    
    try:
        chat = LlmChat(
            api_key=EMERGENT_KEY,
            session_id=session_id,
            system_message="You are a helpful medical assistant bot. Provide accurate, empathetic health information. Always remind users to consult with healthcare professionals for medical advice. Keep responses concise and clear."
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
        logger.error(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail="Chat service error")

@api_router.post("/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    """
    Transcribe audio to text using Whisper
    """
    try:
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
        logger.error(f"Transcription error: {str(e)}")
        raise HTTPException(status_code=500, detail="Transcription failed")

@api_router.get("/videos/search", response_model=List[VideoResult])
async def search_videos(query: str, disease: Optional[str] = None, max_results: int = 6):
    """
    Search YouTube for health-related videos
    """
    if not YOUTUBE_API_KEY or YOUTUBE_API_KEY == "YOUR_YOUTUBE_API_KEY_HERE":
        # Return mock data if no API key
        mock_videos = [
            {
                "video_id": "dQw4w9WgXcQ",
                "title": f"Understanding {disease or query} - Doctor's Guide",
                "description": "A comprehensive guide to understanding and managing the condition.",
                "thumbnail_url": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400",
                "channel_title": "Medical Education Channel",
                "published_at": "2024-01-15T10:00:00Z"
            },
            {
                "video_id": "abc123xyz",
                "title": f"Diet and Nutrition for {disease or query}",
                "description": "Learn about the best dietary practices for managing your health.",
                "thumbnail_url": "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=400",
                "channel_title": "Health & Wellness",
                "published_at": "2024-02-20T14:30:00Z"
            },
            {
                "video_id": "xyz789abc",
                "title": f"Exercise and Physical Therapy for {disease or query}",
                "description": "Safe and effective exercises recommended by physiotherapists.",
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
            safeSearch="strict"
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
        logger.error(f"YouTube API error: {str(e)}")
        raise HTTPException(status_code=400, detail="YouTube search failed")

@api_router.get("/articles", response_model=List[Article])
async def get_articles(disease: Optional[str] = None):
    """
    Get health articles
    """
    articles_db = [
        {
            "id": "1",
            "title": "Understanding Type 2 Diabetes: A Comprehensive Guide",
            "content": "Diabetes is a chronic condition affecting how your body processes blood sugar. Learn about symptoms, management, and prevention strategies.",
            "disease": "diabetes",
            "category": "education"
        },
        {
            "id": "2",
            "title": "Heart Health: Prevention and Early Detection",
            "content": "Heart disease is preventable. Discover lifestyle changes, warning signs, and screening recommendations.",
            "disease": "heart",
            "category": "prevention"
        },
        {
            "id": "3",
            "title": "Living with Parkinson's Disease: Daily Management Tips",
            "content": "Parkinson's affects movement but doesn't define you. Explore strategies for maintaining quality of life.",
            "disease": "parkinson",
            "category": "lifestyle"
        },
        {
            "id": "4",
            "title": "Nutrition and Disease Prevention",
            "content": "Your diet plays a crucial role in preventing chronic diseases. Learn about anti-inflammatory foods and balanced nutrition.",
            "disease": "general",
            "category": "nutrition"
        },
        {
            "id": "5",
            "title": "Exercise Guidelines for Chronic Conditions",
            "content": "Physical activity is medicine. Discover safe exercise recommendations for various health conditions.",
            "disease": "general",
            "category": "fitness"
        }
    ]
    
    if disease:
        articles_db = [a for a in articles_db if a["disease"] == disease.lower() or a["disease"] == "general"]
    
    return [Article(**article) for article in articles_db]

# Include the router in the main app
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