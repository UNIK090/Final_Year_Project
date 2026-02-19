"""
Advanced AI-Powered Prescription Generator
Uses GPT models to generate personalized prescriptions and recommendations
"""

from typing import Dict, List, Optional
import json
from datetime import datetime, timedelta
from emergentintegrations.llm.chat import LlmChat, UserMessage


class PrescriptionGenerator:
    """Generate personalized prescriptions using AI"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        
    async def generate_prescription(
        self,
        disease: str,
        patient_profile: Dict,
        prediction_result: Dict
    ) -> Dict:
        """
        Generate AI-powered prescription
        
        Args:
            disease: Type of disease
            patient_profile: Patient information (age, gender, allergies, etc.)
            prediction_result: ML prediction results
            
        Returns:
            Dictionary with medications, dosage, instructions, and warnings
        """
        
        # Build comprehensive prompt
        prompt = self._build_prescription_prompt(disease, patient_profile, prediction_result)
        
        try:
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"prescription_{disease}_{datetime.now().timestamp()}",
                system_message="""You are an expert medical doctor with 20+ years of experience in clinical practice. 
                Your task is to generate personalized medical prescriptions based on patient profiles and diagnostic results.
                
                IMPORTANT GUIDELINES:
                1. Always include a disclaimer that this is AI-generated and requires doctor consultation
                2. Consider patient age, gender, allergies, and medical history
                3. Provide specific dosages and administration instructions
                4. Include potential side effects and contraindications
                5. Suggest follow-up schedule and monitoring requirements
                6. Include lifestyle recommendations
                7. Format the output as structured JSON
                8. Be thorough but concise
                9. Always prioritize patient safety
                10. Include emergency warning signs
                
                Return the prescription in this JSON format:
                {
                    "medications": [
                        {
                            "name": "medication_name",
                            "generic_name": "generic_name",
                            "dosage": "specific_dosage",
                            "frequency": "how_often",
                            "duration": "how_long",
                            "administration": "how_to_take",
                            "purpose": "why_prescribed",
                            "side_effects": ["side_effect_1", "side_effect_2"],
                            "contraindications": ["contraindication_1"],
                            "interactions": ["interaction_1"]
                        }
                    ],
                    "lifestyle_recommendations": [
                        "recommendation_1",
                        "recommendation_2"
                    ],
                    "diet_recommendations": [
                        "diet_tip_1",
                        "diet_tip_2"
                    ],
                    "follow_up": {
                        "next_appointment": "time_frame",
                        "tests_to_monitor": ["test_1", "test_2"],
                        "warning_signs": ["symptom_1", "symptom_2"]
                    },
                    "emergency_instructions": "when_to_seek_immediate_care",
                    "disclaimer": "medical_disclaimer"
                }"""
            ).with_model("openai", "gpt-5.1")
            
            user_message = UserMessage(text=prompt)
            response = await chat.send_message(user_message)
            
            # Parse response
            prescription = self._parse_prescription_response(response)
            
            # Add metadata
            prescription['generated_at'] = datetime.now().isoformat()
            prescription['disease'] = disease
            prescription['patient_risk_level'] = prediction_result.get('risk_level', 'unknown')
            prescription['confidence'] = prediction_result.get('confidence', 0.0)
            
            return prescription
            
        except Exception as e:
            # Fallback to template-based prescription if AI fails
            return self._generate_fallback_prescription(disease, patient_profile, prediction_result)
    
    def _build_prescription_prompt(
        self,
        disease: str,
        patient_profile: Dict,
        prediction_result: Dict
    ) -> str:
        """Build comprehensive prompt for AI"""
        
        prompt = f"""
Generate a personalized prescription for a patient with the following details:

DISEASE DIAGNOSIS: {disease.upper()}
RISK LEVEL: {prediction_result.get('risk_level', 'unknown').upper()}
CONFIDENCE: {prediction_result.get('confidence', 0):.2%}

PATIENT PROFILE:
- Age: {patient_profile.get('age', 'unknown')} years
- Gender: {patient_profile.get('gender', 'unknown')}
- Weight: {patient_profile.get('weight', 'unknown')} kg
- Height: {patient_profile.get('height', 'unknown')} cm
- BMI: {patient_profile.get('bmi', 'unknown')}
- Blood Type: {patient_profile.get('blood_type', 'unknown')}

MEDICAL HISTORY:
- Known Allergies: {', '.join(patient_profile.get('allergies', ['none']))}
- Current Medications: {', '.join(patient_profile.get('current_medications', ['none']))}
- Chronic Conditions: {', '.join(patient_profile.get('chronic_conditions', ['none']))}
- Previous Surgeries: {', '.join(patient_profile.get('surgeries', ['none']))}
- Family History: {patient_profile.get('family_history', 'none')}

CURRENT SYMPTOMS:
{self._format_symptoms(patient_profile.get('symptoms', []))}

DIAGNOSTIC RESULTS:
{self._format_diagnostic_results(prediction_result)}

Please generate a comprehensive, personalized prescription that:
1. Addresses the specific disease and risk level
2. Considers the patient's age, gender, and medical history
3. Accounts for any allergies or contraindications
4. Provides clear dosage and administration instructions
5. Includes relevant lifestyle and dietary recommendations
6. Specifies follow-up care and monitoring
7. Lists warning signs that require immediate attention
8. Includes appropriate medical disclaimers
"""
        return prompt
    
    def _format_symptoms(self, symptoms: List[str]) -> str:
        """Format symptoms for prompt"""
        if not symptoms:
            return "No specific symptoms reported"
        return "\n".join([f"- {symptom}" for symptom in symptoms])
    
    def _format_diagnostic_results(self, prediction_result: Dict) -> str:
        """Format diagnostic results for prompt"""
        lines = [
            f"- Prediction: {prediction_result.get('prediction', 'unknown').upper()}",
            f"- Risk Level: {prediction_result.get('risk_level', 'unknown').upper()}",
            f"- Confidence: {prediction_result.get('confidence', 0):.2%}"
        ]
        
        if 'feature_importance' in prediction_result:
            lines.append("\nKey Risk Factors:")
            for factor, importance in prediction_result['feature_importance'].items():
                lines.append(f"- {factor}: {importance:.1%}")
        
        return "\n".join(lines)
    
    def _parse_prescription_response(self, response: str) -> Dict:
        """Parse AI response into structured prescription"""
        try:
            # Try to parse as JSON
            if "```json" in response:
                response = response.split("```json")[1].split("```")[0]
            elif "```" in response:
                response = response.split("```")[1].split("```")[0]
            
            prescription = json.loads(response.strip())
            return prescription
        except Exception as e:
            # If JSON parsing fails, extract text and create structured response
            return self._extract_text_prescription(response)
    
    def _extract_text_prescription(self, response: str) -> Dict:
        """Extract prescription from text response"""
        return {
            "medications": [
                {
                    "name": "Standard Medication",
                    "generic_name": "generic",
                    "dosage": "As prescribed by doctor",
                    "frequency": "As directed",
                    "duration": "As determined by physician",
                    "administration": "Follow physician instructions",
                    "purpose": "Disease management",
                    "side_effects": ["Consult physician"],
                    "contraindications": ["Consult physician"],
                    "interactions": ["Consult physician"]
                }
            ],
            "lifestyle_recommendations": [
                "Maintain healthy lifestyle",
                "Follow physician recommendations",
                "Attend regular check-ups"
            ],
            "diet_recommendations": [
                "Follow balanced diet",
                "Consult nutritionist"
            ],
            "follow_up": {
                "next_appointment": "As recommended by physician",
                "tests_to_monitor": ["Consult physician"],
                "warning_signs": ["Seek immediate medical attention if symptoms worsen"]
            },
            "emergency_instructions": "Call emergency services if experiencing severe symptoms",
            "disclaimer": response[:500] if len(response) > 500 else response,
            "raw_response": response
        }
    
    def _generate_fallback_prescription(
        self,
        disease: str,
        patient_profile: Dict,
        prediction_result: Dict
    ) -> Dict:
        """Generate template-based prescription as fallback"""
        
        age = patient_profile.get('age', 50)
        gender = patient_profile.get('gender', 'unknown')
        risk_level = prediction_result.get('risk_level', 'medium')
        
        # Get disease-specific prescription template
        prescription_templates = {
            'diabetes': self._get_diabetes_prescription(age, gender, risk_level),
            'heart': self._get_heart_prescription(age, gender, risk_level),
            'parkinson': self._get_parkinson_prescription(age, gender, risk_level),
            'hypertension': self._get_hypertension_prescription(age, gender, risk_level),
            'cancer_risk': self._get_cancer_prescription(age, gender, risk_level),
            'kidney_disease': self._get_kidney_prescription(age, gender, risk_level),
            'liver_disease': self._get_liver_prescription(age, gender, risk_level),
            'stroke': self._get_stroke_prescription(age, gender, risk_level)
        }
        
        prescription = prescription_templates.get(disease.lower(), self._get_general_prescription())
        
        # Add patient-specific information
        prescription['patient_age'] = age
        prescription['patient_gender'] = gender
        prescription['risk_level'] = risk_level
        prescription['generated_at'] = datetime.now().isoformat()
        prescription['disclaimer'] = """
        IMPORTANT MEDICAL DISCLAIMER:
        This prescription is AI-generated for informational purposes only. 
        It is NOT a substitute for professional medical advice, diagnosis, or treatment.
        Always consult with a qualified healthcare provider before starting any medication.
        This system does not replace the judgment of a licensed physician.
        Seek immediate medical attention if you experience severe symptoms.
        """
        
        return prescription
    
    def _get_diabetes_prescription(self, age: int, gender: str, risk_level: str) -> Dict:
        """Diabetes prescription template"""
        dosage_modifier = "lower" if age > 65 else "standard"
        
        return {
            "medications": [
                {
                    "name": "Metformin Hydrochloride",
                    "generic_name": "Metformin",
                    "dosage": f"{dosage_modifier} starting dose 500mg once daily",
                    "frequency": "Once daily with evening meal",
                    "duration": "Long-term, as prescribed by physician",
                    "administration": "Take with food to reduce gastrointestinal side effects",
                    "purpose": "First-line oral medication for blood glucose control",
                    "side_effects": ["Nausea", "Diarrhea", "Stomach upset", "Metallic taste"],
                    "contraindications": ["Severe kidney disease", "Metabolic acidosis", "Alcohol abuse"],
                    "interactions": ["Contrast dye imaging", "Certain antibiotics", "Alcohol"]
                },
                {
                    "name": "Blood Glucose Monitoring",
                    "generic_name": "Glucometer",
                    "dosage": "As needed for monitoring",
                    "frequency": "Fasting and 2 hours after meals, 3-4 times daily",
                    "duration": "Ongoing",
                    "administration": "Use glucometer as instructed",
                    "purpose": "Monitor blood glucose levels",
                    "side_effects": ["Minor discomfort from finger pricks"],
                    "contraindications": ["None for monitoring"],
                    "interactions": ["None"]
                }
            ],
            "lifestyle_recommendations": [
                "Engage in regular physical activity (30 minutes daily, 5 days per week)",
                "Maintain healthy body weight through diet and exercise",
                "Quit smoking if applicable",
                "Limit alcohol consumption",
                "Practice stress management techniques",
                "Get adequate sleep (7-8 hours per night)",
                "Attend regular diabetes education classes"
            ],
            "diet_recommendations": [
                "Follow a consistent carbohydrate-controlled meal plan",
                "Choose complex carbohydrates with low glycemic index",
                "Increase fiber intake (25-35g daily) through whole grains, vegetables, fruits",
                "Limit added sugars and sugary beverages",
                "Choose lean proteins (fish, poultry, legumes)",
                "Include healthy fats (nuts, avocados, olive oil) in moderation",
                "Control portion sizes",
                "Eat regular meals at consistent times",
                "Stay hydrated with water (8-10 glasses daily)"
            ],
            "follow_up": {
                "next_appointment": "Follow-up in 4-6 weeks to assess treatment response",
                "tests_to_monitor": [
                    "HbA1c every 3 months",
                    "Fasting blood glucose regularly",
                    "Kidney function tests annually",
                    "Comprehensive eye exam annually",
                    "Foot examination annually",
                    "Lipid profile annually"
                ],
                "warning_signs": [
                    "Blood glucose < 70 mg/dL (hypoglycemia) or > 300 mg/dL (hyperglycemia)",
                    "Symptoms of DKA (fruity breath, confusion, vomiting)",
                    "Signs of infection",
                    "Unintended weight loss",
                    "Vision changes"
                ]
            },
            "emergency_instructions": """
            Seek immediate emergency care if experiencing:
            - Severe hypoglycemia (unable to treat with oral glucose)
            - Diabetic ketoacidosis symptoms (confusion, vomiting, fruity breath)
            - Severe dehydration
            - Loss of consciousness
            Call emergency services (911) immediately in life-threatening situations.
            """
        }
    
    def _get_heart_prescription(self, age: int, gender: str, risk_level: str) -> Dict:
        """Heart disease prescription template"""
        return {
            "medications": [
                {
                    "name": "Aspirin",
                    "generic_name": "Acetylsalicylic Acid",
                    "dosage": "81-100mg daily",
                    "frequency": "Once daily",
                    "duration": "Long-term, as directed by physician",
                    "administration": "Take with food to reduce stomach irritation",
                    "purpose": "Antiplatelet therapy to prevent blood clots",
                    "side_effects": ["Stomach irritation", "Bleeding", "Bruising"],
                    "contraindications": ["Active bleeding", "Stomach ulcers", "Aspirin allergy"],
                    "interactions": ["NSAIDs", "Blood thinners", "Alcohol"]
                },
                {
                    "name": "Statin Therapy",
                    "generic_name": "Atorvastatin or similar",
                    "dosage": "Starting dose as determined by lipid levels",
                    "frequency": "Once daily",
                    "duration": "Long-term",
                    "administration": "Take at bedtime for optimal effect",
                    "purpose": "Lower LDL cholesterol and reduce cardiovascular risk",
                    "side_effects": ["Muscle pain", "Digestive problems", "Elevated liver enzymes"],
                    "contraindications": ["Active liver disease", "Pregnancy", "Breastfeeding"],
                    "interactions": ["Grapefruit juice", "Certain antibiotics", "Antifungals"]
                },
                {
                    "name": "Beta Blocker",
                    "generic_name": "Metoprolol or similar",
                    "dosage": "As prescribed by physician",
                    "frequency": "Once or twice daily",
                    "duration": "Long-term",
                    "administration": "Take consistently at same time daily",
                    "purpose": "Reduce heart rate and blood pressure, decrease cardiac workload",
                    "side_effects": ["Fatigue", "Dizziness", "Cold extremities", "Slow heart rate"],
                    "contraindications": ["Severe bradycardia", "Heart block", "Asthma"],
                    "interactions": ["Other blood pressure medications", "Diabetes medications"]
                }
            ],
            "lifestyle_recommendations": [
                "Engage in moderate-intensity aerobic exercise (150 minutes per week)",
                "Implement a cardiac rehabilitation program if prescribed",
                "Achieve and maintain healthy body weight",
                "Quit smoking immediately",
                "Limit alcohol to moderate amounts (1 drink/day for women, 2 for men)",
                "Manage stress through relaxation techniques",
                "Get adequate sleep (7-8 hours per night)"
            ],
            "diet_recommendations": [
                "Follow Mediterranean or DASH diet pattern",
                "Limit sodium intake to < 2,300 mg daily",
                "Choose lean proteins and plant-based proteins",
                "Increase intake of omega-3 fatty acids (fatty fish, walnuts)",
                "Eat 5+ servings of fruits and vegetables daily",
                "Choose whole grains over refined grains",
                "Limit saturated fats (< 10% of calories)",
                "Eliminate trans fats completely",
                "Limit added sugars and sugary beverages"
            ],
            "follow_up": {
                "next_appointment": "Follow-up in 4-6 weeks",
                "tests_to_monitor": [
                    "Lipid panel every 6-12 weeks initially, then every 3-6 months",
                    "Blood pressure monitoring weekly",
                    "Liver function tests periodically",
                    "ECG as needed",
                    "Stress testing if symptoms change"
                ],
                "warning_signs": [
                    "Chest pain or pressure",
                    "Shortness of breath",
                    "Palpitations or irregular heartbeat",
                    "Dizziness or fainting",
                    "Swelling in legs or feet",
                    "Unexplained weight gain"
                ]
            },
            "emergency_instructions": """
            Call 911 immediately if experiencing:
            - Chest pain, pressure, or discomfort lasting more than a few minutes
            - Pain spreading to arms, neck, jaw, or back
            - Shortness of breath
            - Cold sweat, nausea, or lightheadedness
            These could be signs of a heart attack - do not wait to see if symptoms pass.
            """
        }
    
    def _get_parkinson_prescription(self, age: int, gender: str, risk_level: str) -> Dict:
        """Parkinson's disease prescription template"""
        return {
            "medications": [
                {
                    "name": "Levodopa/Carbidopa",
                    "generic_name": "Carbidopa-Levodopa",
                    "dosage": "Starting dose 25/100mg, titrate as needed",
                    "frequency": "3-4 times daily",
                    "duration": "Long-term, ongoing treatment",
                    "administration": "Take 30-60 minutes before meals or 1-2 hours after",
                    "purpose": "Gold standard therapy for motor symptoms replacement",
                    "side_effects": ["Nausea", "Dizziness", "Dyskinesia", "Wearing-off effect"],
                    "contraindications": ["Narrow-angle glaucoma", "Melanoma history"],
                    "interactions": ["MAO inhibitors", "Antipsychotics", "Iron supplements"]
                },
                {
                    "name": "Dopamine Agonist",
                    "generic_name": "Pramipexole or Ropinirole",
                    "dosage": "Low starting dose, gradual titration",
                    "frequency": "3 times daily",
                    "duration": "Long-term",
                    "administration": "Take with food to reduce nausea",
                    "purpose": "Stimulate dopamine receptors, reduce Levodopa dose needs",
                    "side_effects": ["Sleepiness", "Hallucinations", "Impulse control disorders", "Edema"],
                    "contraindications": ["Severe psychiatric conditions"],
                    "interactions": ["Sedating medications", "Antidepressants"]
                }
            ],
            "lifestyle_recommendations": [
                "Engage in regular physical therapy and exercise",
                "Practice balance and gait training exercises",
                "Maintain social connections and activities",
                "Keep a daily symptom diary",
                "Use adaptive devices as needed (walkers, canes)",
                "Modify home environment for safety (remove tripping hazards)",
                "Practice speech therapy exercises if speech affected",
                "Consider cognitive exercises to maintain mental acuity"
            ],
            "diet_recommendations": [
                "Eat high-fiber foods to prevent constipation",
                "Stay well-hydrated (8-10 glasses water daily)",
                "Take protein in moderation and consider timing with medication",
                "Include antioxidant-rich foods (berries, leafy greens)",
                "Eat small, frequent meals to manage nausea",
                "Consider softer foods if swallowing difficulties",
                "Limit caffeine intake",
                "Maintain adequate calcium and vitamin D intake for bone health"
            ],
            "follow_up": {
                "next_appointment": "Neurology follow-up every 3-6 months",
                "tests_to_monitor": [
                    "Regular neurological examinations",
                    "Motor function assessments (UPDRS scale)",
                    "Cognitive and mood evaluations annually",
                    "Bone density scans",
                    "Sleep studies if sleep issues present"
                ],
                "warning_signs": [
                    "Sudden worsening of symptoms",
                    "New medication side effects",
                    "Mood changes (depression, anxiety)",
                    "Cognitive decline",
                    "Hallucinations or psychosis",
                    "Frequent falls or balance issues"
                ]
            },
            "emergency_instructions": """
            Seek immediate medical attention if experiencing:
            - Severe motor fluctuations (on/off periods)
            - Dangerous dyskinesia interfering with function
            - Psychiatric symptoms (hallucinations, paranoia)
            - Frequent falls or injuries
            - Sudden inability to swallow
            Contact neurologist for medication adjustments and emergency protocols.
            """
        }
    
    def _get_hypertension_prescription(self, age: int, gender: str, risk_level: str) -> Dict:
        """Hypertension prescription template"""
        return {
            "medications": [
                {
                    "name": "ACE Inhibitor",
                    "generic_name": "Lisinopril or Enalapril",
                    "dosage": f"Starting dose {10 if age < 65 else 5}mg daily",
                    "frequency": "Once daily",
                    "duration": "Long-term",
                    "administration": "Take at same time daily, with or without food",
                    "purpose": "Lower blood pressure by relaxing blood vessels",
                    "side_effects": ["Dry cough", "Dizziness", "Elevated potassium", "Fatigue"],
                    "contraindications": ["Pregnancy", "Angioedema history", "Bilateral renal artery stenosis"],
                    "interactions": ["Potassium supplements", "NSAIDs", "Diuretics"]
                },
                {
                    "name": "Thiazide Diuretic",
                    "generic_name": "Hydrochlorothiazide",
                    "dosage": "12.5-25mg daily",
                    "frequency": "Once daily",
                    "duration": "Long-term",
                    "administration": "Take in morning to avoid nighttime urination",
                    "purpose": "Help kidneys eliminate excess sodium and water",
                    "side_effects": ["Frequent urination", "Dizziness", "Electrolyte imbalance", "Gout"],
                    "contraindications": ["Severe kidney disease", "Anuria", "Sulfa allergy"],
                    "interactions": ["Lithium", "Digoxin", "Corticosteroids"]
                }
            ],
            "lifestyle_recommendations": [
                "Reduce sodium intake to < 2,300 mg daily",
                "Maintain healthy weight (BMI 18.5-24.9)",
                "Engage in regular aerobic exercise (150 min/week)",
                "Limit alcohol consumption",
                "Manage stress through relaxation techniques",
                "Quit smoking",
                "Monitor blood pressure regularly at home",
                "Get adequate sleep (7-8 hours per night)"
            ],
            "diet_recommendations": [
                "Follow DASH (Dietary Approaches to Stop Hypertension) diet",
                "Increase potassium intake (fruits, vegetables, legumes)",
                "Choose low-fat dairy products",
                "Limit processed and packaged foods",
                "Eat plenty of fruits and vegetables",
                "Choose whole grains over refined grains",
                "Include lean proteins",
                "Limit saturated and trans fats"
            ],
            "follow_up": {
                "next_appointment": "Follow-up in 4-6 weeks",
                "tests_to_monitor": [
                    "Blood pressure monitoring weekly",
                    "Electrolyte panel annually",
                    "Kidney function tests annually",
                    "Lipid panel annually",
                    "Eye exam annually (for hypertensive retinopathy)"
                ],
                "warning_signs": [
                    "Blood pressure > 180/120 mmHg (hypertensive crisis)",
                    "Severe headache",
                    "Chest pain",
                    "Shortness of breath",
                    "Vision changes",
                    "Dizziness or confusion"
                ]
            },
            "emergency_instructions": """
            Call emergency services (911) immediately if:
            - Blood pressure exceeds 180/120 mmHg with symptoms (hypertensive crisis)
            - Experiencing chest pain, severe headache, vision changes, or confusion
            - Having difficulty breathing
            These are signs of a hypertensive emergency requiring immediate medical care.
            """
        }
    
    def _get_cancer_prescription(self, age: int, gender: str, risk_level: str) -> Dict:
        """Cancer risk prescription template"""
        return {
            "medications": [
                {
                    "name": "Risk Reduction Consultation",
                    "generic_name": "Preventive Care",
                    "dosage": "As recommended",
                    "frequency": "Regular screening schedule",
                    "duration": "Ongoing",
                    "administration": "Follow screening guidelines",
                    "purpose": "Early detection and risk reduction",
                    "side_effects": ["None for screening"],
                    "contraindications": ["None"],
                    "interactions": ["None"]
                }
            ],
            "lifestyle_recommendations": [
                "Quit smoking immediately (most important risk factor)",
                "Maintain healthy body weight",
                "Engage in regular physical activity (150 min/week)",
                "Limit alcohol consumption",
                "Protect skin from UV radiation",
                "Reduce exposure to environmental carcinogens",
                "Get vaccinated against HPV and Hepatitis B",
                "Practice safe sex",
                "Manage stress and mental health"
            ],
            "diet_recommendations": [
                "Eat plenty of fruits and vegetables (5+ servings daily)",
                "Choose whole grains over refined grains",
                "Limit red meat consumption",
                "Avoid processed meats",
                "Choose healthy fats (olive oil, nuts, avocados)",
                "Limit added sugars and sugary beverages",
                "Maintain adequate hydration",
                "Consider antioxidant-rich foods"
            ],
            "follow_up": {
                "next_appointment": "Consult with oncologist for personalized screening plan",
                "tests_to_monitor": [
                    "Age and gender appropriate cancer screenings",
                    "Annual physical examination",
                    "Specific imaging based on risk factors",
                    "Genetic counseling if family history suggests",
                    "Regular self-examinations as appropriate"
                ],
                "warning_signs": [
                    "Unexplained weight loss",
                    "Persistent fatigue",
                    "Changes in bowel or bladder habits",
                    "Unusual bleeding or discharge",
                    "Persistent cough or hoarseness",
                    "New lumps or thickenings",
                    "Sores that don't heal",
                    "Changes in moles or skin lesions"
                ]
            },
            "emergency_instructions": """
            Seek immediate medical attention if experiencing:
            - Severe symptoms that develop suddenly
            - Signs of infection (fever, chills)
            - Difficulty breathing
            - Severe pain
            - Any other acute medical emergency
            Contact oncologist promptly for any concerning changes or symptoms.
            """
        }
    
    def _get_kidney_prescription(self, age: int, gender: str, risk_level: str) -> Dict:
        """Kidney disease prescription template"""
        return {
            "medications": [
                {
                    "name": "Blood Pressure Control",
                    "generic_name": "ACE Inhibitor or ARB",
                    "dosage": "As prescribed by nephrologist",
                    "frequency": "Once daily",
                    "duration": "Long-term",
                    "administration": "Take consistently at same time",
                    "purpose": "Protect kidney function and control blood pressure",
                    "side_effects": ["Dizziness", "Elevated potassium", "Cough (ACE inhibitors)"],
                    "contraindications": ["Severe hyperkalemia", "Pregnancy", "Bilateral renal artery stenosis"],
                    "interactions": ["Potassium supplements", "NSAIDs", "Diuretics"]
                },
                {
                    "name": "Diabetes Control",
                    "generic_name": "SGLT2 Inhibitor",
                    "dosage": "As prescribed",
                    "frequency": "Once daily",
                    "duration": "Long-term",
                    "administration": "Take in morning",
                    "purpose": "Protect kidneys in diabetic patients",
                    "side_effects": ["UTI", "Dehydration", "Yeast infections"],
                    "contraindications": ["Type 1 diabetes", "Severe kidney disease"],
                    "interactions": ["Diuretics", "Insulin"]
                }
            ],
            "lifestyle_recommendations": [
                "Control blood pressure tightly",
                "Manage blood glucose carefully if diabetic",
                "Maintain healthy weight",
                "Exercise regularly as tolerated",
                "Quit smoking",
                "Limit alcohol",
                "Stay hydrated but avoid excessive fluid",
                "Avoid NSAIDs and other nephrotoxic medications"
            ],
            "diet_recommendations": [
                "Follow renal diet as prescribed by dietitian",
                "Limit protein intake to recommended levels",
                "Restrict sodium to < 2,000 mg daily",
                "Limit potassium if levels elevated",
                "Limit phosphorus if needed",
                "Control fluid intake",
                "Choose appropriate fruits and vegetables",
                "Work with renal dietitian for personalized plan"
            ],
            "follow_up": {
                "next_appointment": "Nephrology follow-up every 1-3 months",
                "tests_to_monitor": [
                    "Creatinine and GFR every 1-3 months",
                    "Potassium levels regularly",
                    "Phosphorus and calcium regularly",
                    "Hemoglobin (for anemia)",
                    "Urine protein regularly",
                    "Blood pressure monitoring daily"
                ],
                "warning_signs": [
                    "Rapidly decreasing urine output",
                    "Swelling in legs, ankles, or feet",
                    "Shortness of breath",
                    "Nausea or vomiting",
                    "Confusion or difficulty concentrating",
                    "Fatigue and weakness"
                ]
            },
            "emergency_instructions": """
            Seek immediate emergency care if experiencing:
            - Complete inability to urinate (anuria)
            - Severe shortness of breath (pulmonary edema)
            - Chest pain or pressure",
            - Severe confusion or loss of consciousness
            - Hyperkalemia symptoms (muscle weakness, irregular heartbeat)
            Contact nephrologist immediately for urgent kidney concerns.
            """
        }
    
    def _get_liver_prescription(self, age: int, gender: str, risk_level: str) -> Dict:
        """Liver disease prescription template"""
        return {
            "medications": [
                {
                    "name": "Liver Support",
                    "generic_name": "Vitamin supplements as needed",
                    "dosage": "As prescribed",
                    "frequency": "As directed",
                    "duration": "Ongoing",
                    "administration": "Follow physician instructions",
                    "purpose": "Support liver function and prevent complications",
                    "side_effects": ["Depends on specific medications"],
                    "contraindications": ["Varies by medication"],
                    "interactions": ["Many medications require adjustment"]
                }
            ],
            "lifestyle_recommendations": [
                "Complete alcohol abstinence (most important)",
                "Maintain healthy weight",
                "Exercise regularly as tolerated",
                "Get vaccinated against Hepatitis A and B",
                "Avoid exposure to hepatotoxic substances",
                "Practice safe food handling",
                "Avoid raw or undercooked shellfish",
                "Use medications cautiously under supervision"
            ],
            "diet_recommendations": [
                "Follow liver-healthy diet as prescribed",
                "Eat adequate protein (unless contraindicated)",
                "Limit sodium if fluid retention present",
                "Choose complex carbohydrates",
                "Include fruits and vegetables",
                "Limit saturated fats",
                "Avoid added sugars",
                "Stay hydrated with water",
                "Consider small, frequent meals"
            ],
            "follow_up": {
                "next_appointment": "Hepatology follow-up every 3-6 months",
                "tests_to_monitor": [
                    "Liver function tests every 3-6 months",
                    "Complete blood count regularly",
                    "INR if taking anticoagulants",
                    "Albumin levels",
                    "Ultrasound or imaging periodically",
                    "Endoscopy if varices suspected"
                ],
                "warning_signs": [
                    "Yellowing of skin or eyes (jaundice)",
                    "Dark urine",
                    "Pale or clay-colored stools",
                    "Abdominal swelling",
                    "Easy bruising or bleeding",
                    "Confusion or mental changes (hepatic encephalopathy)",
                    "Severe fatigue"
                ]
            },
            "emergency_instructions": """
            Seek immediate emergency care if experiencing:
            - Severe jaundice with confusion (encephalopathy)
            - Vomiting blood (variceal bleeding)
            - Severe abdominal pain",
            - Inability to wake up (coma)
            - Signs of liver failure
            Contact hepatologist urgently for any severe liver-related symptoms.
            """
        }
    
    def _get_stroke_prescription(self, age: int, gender: str, risk_level: str) -> Dict:
        """Stroke prevention prescription template"""
        return {
            "medications": [
                {
                    "name": "Antiplatelet Therapy",
                    "generic_name": "Aspirin or Clopidogrel",
                    "dosage": "As prescribed by neurologist",
                    "frequency": "Once daily",
                    "duration": "Long-term",
                    "administration": "Take with food if needed",
                    "purpose": "Prevent blood clots that can cause stroke",
                    "side_effects": ["Bleeding", "Bruising", "Stomach irritation"],
                    "contraindications": ["Active bleeding", "Severe bleeding disorders", "Allergy"],
                    "interactions": ["NSAIDs", "Blood thinners", "Alcohol"]
                },
                {
                    "name": "Statin Therapy",
                    "generic_name": "High-intensity statin",
                    "dosage": "As prescribed",
                    "frequency": "Once daily",
                    "duration": "Long-term",
                    "administration": "Take at bedtime",
                    "purpose": "Lower cholesterol and stabilize plaques",
                    "side_effects": ["Muscle pain", "Liver enzyme elevation"],
                    "contraindications": ["Active liver disease", "Pregnancy"],
                    "interactions": ["Grapefruit juice", "Certain antibiotics"]
                },
                {
                    "name": "Antihypertensive",
                    "generic_name": "ACE inhibitor or ARB",
                    "dosage": "As prescribed",
                    "frequency": "Once daily",
                    "duration": "Long-term",
                    "administration": "Take consistently at same time",
                    "purpose": "Control blood pressure to prevent stroke",
                    "side_effects": ["Dizziness", "Cough", "Elevated potassium"],
                    "contraindications": ["Pregnancy", "Angioedema history"],
                    "interactions": ["Potassium supplements", "NSAIDs"]
                }
            ],
            "lifestyle_recommendations": [
                "Control blood pressure tightly (<130/80 mmHg)",
                "Manage diabetes carefully if present",
                "Quit smoking immediately",
                "Maintain healthy weight",
                "Exercise regularly (150 min/week)",
                "Limit alcohol consumption",
                "Manage stress",
                "Get adequate sleep",
                "Treat sleep apnea if present"
            ],
            "diet_recommendations": [
                "Follow Mediterranean or DASH diet",
                "Limit sodium to < 2,300 mg daily",
                "Increase fruits and vegetables (5+ servings)",
                "Choose whole grains",
                "Select lean proteins",
                "Include omega-3 rich foods (fatty fish)",
                "Limit saturated and trans fats",
                "Limit added sugars"
            ],
            "follow_up": {
                "next_appointment": "Neurology follow-up every 3-6 months",
                "tests_to_monitor": [
                    "Blood pressure monitoring regularly",
                    "Lipid panel every 3-6 months",
                    "Blood glucose if diabetic",
                    "Carotid ultrasound if indicated",
                    "Cardiac evaluation if needed",
                    "Cognitive assessment annually"
                ],
                "warning_signs": [
                    "Sudden weakness or numbness in face, arm, or leg",
                    "Difficulty speaking or understanding",
                    "Vision problems in one or both eyes",
                    "Dizziness, loss of balance, or coordination",
                    "Severe headache with no known cause",
                    "Confusion or trouble understanding",
                    "Transient ischemic attacks (TIAs) - mini strokes"
                ]
            },
            "emergency_instructions": """
            CALL 911 IMMEDIATELY if experiencing stroke symptoms (FAST):
            F - Face drooping
            A - Arm weakness
            S - Speech difficulty
            T - Time to call emergency services
            
            Do NOT wait to see if symptoms improve. Every minute counts in stroke.
            Stroke is a medical emergency requiring immediate hospital care.
            """
        }
    
    def _get_general_prescription(self) -> Dict:
        """General prescription template"""
        return {
            "medications": [
                {
                    "name": "Consult Healthcare Provider",
                    "generic_name": "Professional Medical Advice",
                    "dosage": "As prescribed by physician",
                    "frequency": "As directed",
                    "duration": "As determined by healthcare provider",
                    "administration": "Follow physician's instructions",
                    "purpose": "Proper diagnosis and treatment",
                    "side_effects": ["Depends on specific treatment"],
                    "contraindications": ["Varies by medication"],
                    "interactions": ["Consult pharmacist"]
                }
            ],
            "lifestyle_recommendations": [
                "Consult with a qualified healthcare provider",
                "Follow medical advice precisely",
                "Maintain healthy lifestyle",
                "Exercise regularly",
                "Eat balanced diet",
                "Get adequate sleep",
                "Manage stress"
            ],
            "diet_recommendations": [
                "Consult with nutritionist",
                "Follow balanced diet",
                "Stay hydrated",
                "Limit processed foods",
                "Include fruits and vegetables"
            ],
            "follow_up": {
                "next_appointment": "As recommended by healthcare provider",
                "tests_to_monitor": ["As directed by physician"],
                "warning_signs": ["Any concerning symptoms should be reported to healthcare provider"]
            },
            "emergency_instructions": """
            Call emergency services (911) for any life-threatening symptoms or medical emergency.
            Do not delay seeking professional medical care for serious health concerns.
            """
        }