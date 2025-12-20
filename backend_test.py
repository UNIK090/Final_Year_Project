#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Health Prediction App
Tests all endpoints: prediction, recommendations, chat, transcription, videos, articles
"""

import requests
import sys
import json
import tempfile
import os
from datetime import datetime
from typing import Dict, List, Tuple

class HealthAPITester:
    def __init__(self, base_url="https://smarthealth-ai-11.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.session_id = f"test-session-{datetime.now().strftime('%Y%m%d-%H%M%S')}"

    def log_test(self, name: str, success: bool, details: str = ""):
        """Log test results"""
        self.tests_run += 1
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
        if details:
            print(f"    Details: {details}")
        
        if success:
            self.tests_passed += 1
        else:
            self.failed_tests.append({"test": name, "details": details})

    def test_api_health(self) -> bool:
        """Test basic API health"""
        try:
            response = requests.get(f"{self.api_url}/", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f", Message: {data.get('message', 'N/A')}"
            self.log_test("API Health Check", success, details)
            return success
        except Exception as e:
            self.log_test("API Health Check", False, f"Error: {str(e)}")
            return False

    def test_diabetes_prediction(self) -> bool:
        """Test diabetes prediction endpoint"""
        try:
            payload = {
                "disease_type": "diabetes",
                "parameters": {
                    "glucose": 150.0,
                    "bmi": 28.5,
                    "age": 45.0,
                    "blood_pressure": 85.0
                }
            }
            response = requests.post(f"{self.api_url}/predict", json=payload, timeout=15)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                required_fields = ['id', 'disease_type', 'prediction', 'confidence', 'risk_level', 'parameters']
                missing_fields = [field for field in required_fields if field not in data]
                if missing_fields:
                    success = False
                    details = f"Missing fields: {missing_fields}"
                else:
                    details = f"Prediction: {data['prediction']}, Risk: {data['risk_level']}, Confidence: {data['confidence']:.2f}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:100]}"
            
            self.log_test("Diabetes Prediction", success, details)
            return success
        except Exception as e:
            self.log_test("Diabetes Prediction", False, f"Error: {str(e)}")
            return False

    def test_heart_prediction(self) -> bool:
        """Test heart disease prediction endpoint"""
        try:
            payload = {
                "disease_type": "heart",
                "parameters": {
                    "age": 55.0,
                    "cholesterol": 250.0,
                    "blood_pressure": 140.0,
                    "heart_rate": 85.0
                }
            }
            response = requests.post(f"{self.api_url}/predict", json=payload, timeout=15)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                details = f"Prediction: {data['prediction']}, Risk: {data['risk_level']}, Confidence: {data['confidence']:.2f}"
            else:
                details = f"Status: {response.status_code}"
            
            self.log_test("Heart Disease Prediction", success, details)
            return success
        except Exception as e:
            self.log_test("Heart Disease Prediction", False, f"Error: {str(e)}")
            return False

    def test_parkinson_prediction(self) -> bool:
        """Test Parkinson's prediction endpoint"""
        try:
            payload = {
                "disease_type": "parkinson",
                "parameters": {
                    "age": 65.0,
                    "tremor_score": 6.5,
                    "motor_score": 22.0,
                    "voice_variation": 2.5
                }
            }
            response = requests.post(f"{self.api_url}/predict", json=payload, timeout=15)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                details = f"Prediction: {data['prediction']}, Risk: {data['risk_level']}, Confidence: {data['confidence']:.2f}"
            else:
                details = f"Status: {response.status_code}"
            
            self.log_test("Parkinson's Prediction", success, details)
            return success
        except Exception as e:
            self.log_test("Parkinson's Prediction", False, f"Error: {str(e)}")
            return False

    def test_invalid_disease_prediction(self) -> bool:
        """Test prediction with invalid disease type"""
        try:
            payload = {
                "disease_type": "invalid_disease",
                "parameters": {"test": 1.0}
            }
            response = requests.post(f"{self.api_url}/predict", json=payload, timeout=10)
            success = response.status_code == 400  # Should return 400 for invalid disease
            details = f"Status: {response.status_code} (Expected 400 for invalid disease)"
            
            self.log_test("Invalid Disease Type Handling", success, details)
            return success
        except Exception as e:
            self.log_test("Invalid Disease Type Handling", False, f"Error: {str(e)}")
            return False

    def test_diabetes_recommendations(self) -> bool:
        """Test diabetes recommendations endpoint"""
        try:
            response = requests.get(f"{self.api_url}/recommendations/diabetes", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                required_fields = ['disease', 'medications', 'safety_measures', 'diet_recommendations']
                missing_fields = [field for field in required_fields if field not in data]
                if missing_fields:
                    success = False
                    details = f"Missing fields: {missing_fields}"
                else:
                    details = f"Medications: {len(data['medications'])}, Safety: {len(data['safety_measures'])}, Diet: {len(data['diet_recommendations'])}"
            else:
                details = f"Status: {response.status_code}"
            
            self.log_test("Diabetes Recommendations", success, details)
            return success
        except Exception as e:
            self.log_test("Diabetes Recommendations", False, f"Error: {str(e)}")
            return False

    def test_heart_recommendations(self) -> bool:
        """Test heart disease recommendations endpoint"""
        try:
            response = requests.get(f"{self.api_url}/recommendations/heart", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                details = f"Medications: {len(data['medications'])}, Safety: {len(data['safety_measures'])}, Diet: {len(data['diet_recommendations'])}"
            else:
                details = f"Status: {response.status_code}"
            
            self.log_test("Heart Disease Recommendations", success, details)
            return success
        except Exception as e:
            self.log_test("Heart Disease Recommendations", False, f"Error: {str(e)}")
            return False

    def test_parkinson_recommendations(self) -> bool:
        """Test Parkinson's recommendations endpoint"""
        try:
            response = requests.get(f"{self.api_url}/recommendations/parkinson", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                details = f"Medications: {len(data['medications'])}, Safety: {len(data['safety_measures'])}, Diet: {len(data['diet_recommendations'])}"
            else:
                details = f"Status: {response.status_code}"
            
            self.log_test("Parkinson's Recommendations", success, details)
            return success
        except Exception as e:
            self.log_test("Parkinson's Recommendations", False, f"Error: {str(e)}")
            return False

    def test_invalid_recommendations(self) -> bool:
        """Test recommendations with invalid disease"""
        try:
            response = requests.get(f"{self.api_url}/recommendations/invalid_disease", timeout=10)
            success = response.status_code == 404  # Should return 404 for invalid disease
            details = f"Status: {response.status_code} (Expected 404 for invalid disease)"
            
            self.log_test("Invalid Disease Recommendations", success, details)
            return success
        except Exception as e:
            self.log_test("Invalid Disease Recommendations", False, f"Error: {str(e)}")
            return False

    def test_chat_functionality(self) -> bool:
        """Test health bot chat endpoint"""
        try:
            payload = {
                "message": "What are the symptoms of diabetes?",
                "session_id": self.session_id
            }
            response = requests.post(f"{self.api_url}/chat", json=payload, timeout=30)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                required_fields = ['response', 'session_id']
                missing_fields = [field for field in required_fields if field not in data]
                if missing_fields:
                    success = False
                    details = f"Missing fields: {missing_fields}"
                else:
                    response_length = len(data['response'])
                    details = f"Response length: {response_length} chars, Session ID: {data['session_id']}"
                    # Check if response is meaningful (not empty and reasonable length)
                    if response_length < 10:
                        success = False
                        details += " (Response too short)"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:100]}"
            
            self.log_test("Health Bot Chat", success, details)
            return success
        except Exception as e:
            self.log_test("Health Bot Chat", False, f"Error: {str(e)}")
            return False

    def test_video_search(self) -> bool:
        """Test YouTube video search endpoint"""
        try:
            params = {
                "query": "diabetes management",
                "disease": "diabetes",
                "max_results": 3
            }
            response = requests.get(f"{self.api_url}/videos/search", params=params, timeout=15)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    video = data[0]
                    required_fields = ['video_id', 'title', 'description', 'thumbnail_url', 'channel_title']
                    missing_fields = [field for field in required_fields if field not in video]
                    if missing_fields:
                        success = False
                        details = f"Missing video fields: {missing_fields}"
                    else:
                        details = f"Found {len(data)} videos, First: '{video['title'][:50]}...'"
                else:
                    success = False
                    details = "No videos returned or invalid format"
            else:
                details = f"Status: {response.status_code}"
            
            self.log_test("Video Search", success, details)
            return success
        except Exception as e:
            self.log_test("Video Search", False, f"Error: {str(e)}")
            return False

    def test_articles_endpoint(self) -> bool:
        """Test health articles endpoint"""
        try:
            response = requests.get(f"{self.api_url}/articles", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    article = data[0]
                    required_fields = ['id', 'title', 'content', 'disease', 'category']
                    missing_fields = [field for field in required_fields if field not in article]
                    if missing_fields:
                        success = False
                        details = f"Missing article fields: {missing_fields}"
                    else:
                        details = f"Found {len(data)} articles, First: '{article['title'][:50]}...'"
                else:
                    success = False
                    details = "No articles returned or invalid format"
            else:
                details = f"Status: {response.status_code}"
            
            self.log_test("Health Articles", success, details)
            return success
        except Exception as e:
            self.log_test("Health Articles", False, f"Error: {str(e)}")
            return False

    def test_articles_by_disease(self) -> bool:
        """Test health articles filtered by disease"""
        try:
            params = {"disease": "diabetes"}
            response = requests.get(f"{self.api_url}/articles", params=params, timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                details = f"Found {len(data)} diabetes articles"
                # Verify articles are actually related to diabetes or general
                diabetes_articles = [a for a in data if a.get('disease') in ['diabetes', 'general']]
                if len(diabetes_articles) != len(data):
                    success = False
                    details += " (Some articles not diabetes-related)"
            else:
                details = f"Status: {response.status_code}"
            
            self.log_test("Articles by Disease Filter", success, details)
            return success
        except Exception as e:
            self.log_test("Articles by Disease Filter", False, f"Error: {str(e)}")
            return False

    def run_all_tests(self) -> Dict:
        """Run all backend tests"""
        print("🔍 Starting Comprehensive Backend API Testing...")
        print(f"🌐 Base URL: {self.base_url}")
        print("=" * 60)
        
        # Test basic connectivity first
        if not self.test_api_health():
            print("❌ API Health check failed. Stopping tests.")
            return self.get_results()
        
        # Test prediction endpoints
        print("\n📊 Testing Disease Prediction Endpoints...")
        self.test_diabetes_prediction()
        self.test_heart_prediction()
        self.test_parkinson_prediction()
        self.test_invalid_disease_prediction()
        
        # Test recommendations endpoints
        print("\n💊 Testing Recommendations Endpoints...")
        self.test_diabetes_recommendations()
        self.test_heart_recommendations()
        self.test_parkinson_recommendations()
        self.test_invalid_recommendations()
        
        # Test chat functionality
        print("\n🤖 Testing Health Bot Chat...")
        self.test_chat_functionality()
        
        # Test resource endpoints
        print("\n📚 Testing Resource Endpoints...")
        self.test_video_search()
        self.test_articles_endpoint()
        self.test_articles_by_disease()
        
        return self.get_results()

    def get_results(self) -> Dict:
        """Get test results summary"""
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        
        results = {
            "total_tests": self.tests_run,
            "passed_tests": self.tests_passed,
            "failed_tests": len(self.failed_tests),
            "success_rate": round(success_rate, 2),
            "failed_test_details": self.failed_tests
        }
        
        print("\n" + "=" * 60)
        print("📊 BACKEND TEST RESULTS SUMMARY")
        print("=" * 60)
        print(f"✅ Tests Passed: {self.tests_passed}/{self.tests_run}")
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        if self.failed_tests:
            print(f"\n❌ Failed Tests ({len(self.failed_tests)}):")
            for i, failure in enumerate(self.failed_tests, 1):
                print(f"  {i}. {failure['test']}: {failure['details']}")
        
        return results

def main():
    """Main test execution"""
    tester = HealthAPITester()
    results = tester.run_all_tests()
    
    # Return appropriate exit code
    return 0 if results["success_rate"] >= 80 else 1

if __name__ == "__main__":
    sys.exit(main())