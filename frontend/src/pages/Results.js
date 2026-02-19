import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { 
  CheckCircle, XCircle, AlertTriangle, Activity, Pill, 
  Utensils, Heart, FileText, Video, ArrowLeft, 
  Loader2, Download, Calendar, Clock, Shield
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
const API = `${BACKEND_URL}/api`;

const Results = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { result } = location.state || {};
  
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [prescription, setPrescription] = useState(null);
  const [videos, setVideos] = useState([]);
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    if (result) {
      fetchRecommendations();
      fetchVideos();
      fetchArticles();
      generatePrescription();
    }
  }, [result]);

  const fetchRecommendations = async () => {
    try {
      const response = await axios.get(`${API}/recommendations/${result.disease_type}`);
      setRecommendations(response.data);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    }
  };

  const fetchVideos = async () => {
    try {
      const response = await axios.get(`${API}/videos/search`, {
        params: { query: result.disease_type, disease: result.disease_type, max_results: 3 }
      });
      setVideos(response.data);
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    }
  };

  const fetchArticles = async () => {
    try {
      const response = await axios.get(`${API}/articles`, {
        params: { disease: result.disease_type }
      });
      setArticles(response.data);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    }
  };

  const generatePrescription = async () => {
    if (!result) return;
    
    setLoading(true);
    try {
      const response = await axios.post(`${API}/prescription`, {
        disease: result.disease_type,
        patient_profile: {
          age: result.parameters?.age || 50,
          gender: 'unknown',
          weight: 70,
          height: 170,
          bmi: result.parameters?.bmi || 25
        },
        prediction_result: result
      });
      setPrescription(response.data);
    } catch (error) {
      console.error('Failed to generate prescription:', error);
      toast.error('Could not generate prescription');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      case 'very_low':
        return 'bg-emerald-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRiskTextColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      case 'very_low':
        return 'text-emerald-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPredictionIcon = (prediction) => {
    return prediction === 'positive' 
      ? <AlertTriangle className="w-16 h-16 text-red-500" />
      : <CheckCircle className="w-16 h-16 text-green-500" />;
  };

  const getDiseaseDisplayName = (disease) => {
    const names = {
      diabetes: 'Type 2 Diabetes',
      heart: 'Heart Disease',
      parkinson: 'Parkinson\'s Disease',
      hypertension: 'Hypertension',
      cancer_risk: 'Cancer Risk',
      kidney_disease: 'Kidney Disease',
      liver_disease: 'Liver Disease',
      stroke: 'Stroke Risk'
    };
    return names[disease] || disease.charAt(0).toUpperCase() + disease.slice(1);
  };

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-stone-100 to-primary-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">No Results Available</h1>
          <Button onClick={() => navigate('/predict')} className="bg-primary-600">
            Go to Prediction
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-stone-100 to-primary-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Button
          onClick={() => navigate('/predict')}
          variant="outline"
          className="mb-6 border-2 border-slate-300 hover:border-primary-500"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Predictions
        </Button>

        {/* Prediction Result Card */}
        <Card className="mb-8 shadow-2xl border-2">
          <CardHeader className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
            <CardTitle className="text-3xl font-bold">
              {getDiseaseDisplayName(result.disease_type)} Analysis Results
            </CardTitle>
            <CardDescription className="text-primary-100">
              AI-powered medical assessment completed on {new Date(result.timestamp).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Prediction Status */}
              <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-lg border-2 border-slate-200">
                {getPredictionIcon(result.prediction)}
                <h2 className="text-3xl font-bold mt-4 text-slate-800">
                  {result.prediction === 'positive' ? 'Positive' : 'Negative'}
                </h2>
                <p className="text-slate-600 mt-2">Prediction Status</p>
              </div>

              {/* Confidence Score */}
              <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-lg border-2 border-slate-200">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="#e5e7eb"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke={result.confidence > 0.7 ? '#059669' : result.confidence > 0.5 ? '#d97706' : '#dc2626'}
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${result.confidence * 440} 440`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-slate-800">
                      {(result.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mt-4 text-slate-800">Confidence Score</h3>
                <p className="text-slate-600 text-sm mt-1">Model Accuracy</p>
              </div>

              {/* Risk Level */}
              <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-lg border-2 border-slate-200">
                <div className={`w-20 h-20 rounded-full ${getRiskColor(result.risk_level)} flex items-center justify-center`}>
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold mt-4 text-slate-800 capitalize">
                  {result.risk_level}
                </h2>
                <p className={`text-lg mt-2 ${getRiskTextColor(result.risk_level)}`}>Risk Level</p>
              </div>
            </div>

            {/* Feature Importance */}
            {result.feature_importance && Object.keys(result.feature_importance).length > 0 && (
              <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200">
                <h3 className="text-xl font-semibold text-slate-800 mb-4">Key Risk Factors</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(result.feature_importance).slice(0, 6).map(([factor, importance]) => (
                    <div key={factor}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-slate-700 capitalize">
                          {factor.replace(/_/g, ' ')}
                        </span>
                        <span className="text-sm text-slate-600">{(importance * 100).toFixed(0)}%</span>
                      </div>
                      <Progress value={importance * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detailed Results Tabs */}
        <Tabs defaultValue="prescription" className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2 h-auto p-2 bg-white shadow-lg rounded-xl border border-slate-200">
            <TabsTrigger value="prescription" className="flex items-center gap-2 p-3 data-[state=active]:bg-primary-600 data-[state=active]:text-white">
              <Pill className="w-5 h-5" />
              <span>Prescription</span>
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2 p-3 data-[state=active]:bg-primary-600 data-[state=active]:text-white">
              <Heart className="w-5 h-5" />
              <span>Recommendations</span>
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-2 p-3 data-[state=active]:bg-primary-600 data-[state=active]:text-white">
              <Video className="w-5 h-5" />
              <span>Videos</span>
            </TabsTrigger>
            <TabsTrigger value="articles" className="flex items-center gap-2 p-3 data-[state=active]:bg-primary-600 data-[state=active]:text-white">
              <FileText className="w-5 h-5" />
              <span>Articles</span>
            </TabsTrigger>
          </TabsList>

          {/* Prescription Tab */}
          <TabsContent value="prescription">
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                <span className="ml-3 text-lg text-slate-600">Generating AI prescription...</span>
              </div>
            ) : prescription ? (
              <Card className="shadow-xl border-2 border-primary-200">
                <CardHeader className="bg-gradient-to-r from-primary-50 to-primary-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">AI-Generated Prescription</CardTitle>
                      <CardDescription className="text-slate-600">
                        Personalized treatment plan for {getDiseaseDisplayName(result.disease_type)}
                      </CardDescription>
                    </div>
                    <Button variant="outline" className="border-primary-300">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Medications */}
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <Pill className="w-6 h-6 text-primary-600" />
                      Medications
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {prescription.medications?.map((med, index) => (
                        <div key={index} className="p-4 bg-white border-2 border-slate-200 rounded-xl hover:border-primary-300 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-lg font-semibold text-slate-800">{med.name}</h4>
                            <span className="text-sm text-slate-500">{med.generic_name}</span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                            <div>
                              <span className="text-slate-500">Dosage:</span>
                              <span className="ml-1 font-medium">{med.dosage}</span>
                            </div>
                            <div>
                              <span className="text-slate-500">Frequency:</span>
                              <span className="ml-1 font-medium">{med.frequency}</span>
                            </div>
                            <div>
                              <span className="text-slate-500">Duration:</span>
                              <span className="ml-1 font-medium">{med.duration}</span>
                            </div>
                            <div>
                              <span className="text-slate-500">Purpose:</span>
                              <span className="ml-1 font-medium">{med.purpose}</span>
                            </div>
                          </div>
                          {med.side_effects && med.side_effects.length > 0 && (
                            <div className="mt-3 text-sm">
                              <span className="text-slate-500">Side Effects:</span>
                              <span className="ml-1 text-slate-700">{med.side_effects.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Lifestyle Recommendations */}
                  {prescription.lifestyle_recommendations && prescription.lifestyle_recommendations.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <Activity className="w-6 h-6 text-primary-600" />
                        Lifestyle Recommendations
                      </h3>
                      <ul className="space-y-2">
                        {prescription.lifestyle_recommendations.map((item, index) => (
                          <li key={index} className="flex items-start gap-2 text-slate-700">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Diet Recommendations */}
                  {prescription.diet_recommendations && prescription.diet_recommendations.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <Utensils className="w-6 h-6 text-primary-600" />
                        Diet Recommendations
                      </h3>
                      <ul className="space-y-2">
                        {prescription.diet_recommendations.map((item, index) => (
                          <li key={index} className="flex items-start gap-2 text-slate-700">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Follow-up Care */}
                  {prescription.follow_up && (
                    <div>
                      <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-primary-600" />
                        Follow-up Care
                      </h3>
                      <div className="p-4 bg-primary-50 rounded-xl border border-primary-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm text-slate-500">Next Appointment:</span>
                            <p className="font-semibold text-slate-800">{prescription.follow_up.next_appointment}</p>
                          </div>
                          <div>
                            <span className="text-sm text-slate-500">Tests to Monitor:</span>
                            <ul className="mt-1 space-y-1">
                              {prescription.follow_up.tests_to_monitor?.map((test, index) => (
                                <li key={index} className="text-sm text-slate-700">• {test}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Warning Signs */}
                  {prescription.follow_up?.warning_signs && (
                    <div>
                      <h3 className="text-xl font-semibold text-red-700 mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-6 h-6" />
                        Warning Signs
                      </h3>
                      <div className="p-4 bg-red-50 rounded-xl border-2 border-red-200">
                        <p className="text-sm text-slate-600 mb-2">Seek immediate medical attention if you experience:</p>
                        <ul className="space-y-1">
                          {prescription.follow_up.warning_signs.map((sign, index) => (
                            <li key={index} className="flex items-start gap-2 text-red-700">
                              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                              <span className="text-sm">{sign}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Emergency Instructions */}
                  {prescription.emergency_instructions && (
                    <div className="p-4 bg-red-100 rounded-xl border-2 border-red-300">
                      <h4 className="font-semibold text-red-800 mb-2">Emergency Instructions</h4>
                      <p className="text-sm text-red-700">{prescription.emergency_instructions}</p>
                    </div>
                  )}

                  {/* Disclaimer */}
                  {prescription.disclaimer && (
                    <div className="p-4 bg-slate-100 rounded-xl border border-slate-300">
                      <p className="text-xs text-slate-600 italic">
                        <strong>Disclaimer:</strong> {prescription.disclaimer}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-xl">
                <CardContent className="p-12 text-center">
                  <Pill className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">Prescription Not Available</h3>
                  <p className="text-slate-600">Unable to generate prescription at this time.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations">
            {recommendations ? (
              <Card className="shadow-xl border-2 border-green-200">
                <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
                  <CardTitle className="text-2xl">Comprehensive Recommendations</CardTitle>
                  <CardDescription className="text-slate-600">
                    Personalized health guidance for {getDiseaseDisplayName(result.disease_type)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Medications */}
                  {recommendations.medications && recommendations.medications.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <Pill className="w-6 h-6 text-green-600" />
                        Suggested Medications
                      </h3>
                      <ul className="space-y-2">
                        {recommendations.medications.map((med, index) => (
                          <li key={index} className="p-3 bg-white border-2 border-slate-200 rounded-lg">
                            <span className="text-slate-800">{med}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Safety Measures */}
                  {recommendations.safety_measures && recommendations.safety_measures.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <Shield className="w-6 h-6 text-green-600" />
                        Safety Measures
                      </h3>
                      <ul className="space-y-2">
                        {recommendations.safety_measures.map((measure, index) => (
                          <li key={index} className="flex items-start gap-2 text-slate-700">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>{measure}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Diet Recommendations */}
                  {recommendations.diet_recommendations && recommendations.diet_recommendations.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <Utensils className="w-6 h-6 text-green-600" />
                        Diet Recommendations
                      </h3>
                      <ul className="space-y-2">
                        {recommendations.diet_recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2 text-slate-700">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Lifestyle Recommendations */}
                  {recommendations.lifestyle_recommendations && recommendations.lifestyle_recommendations.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <Activity className="w-6 h-6 text-green-600" />
                        Lifestyle Recommendations
                      </h3>
                      <ul className="space-y-2">
                        {recommendations.lifestyle_recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2 text-slate-700">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Follow-up Care */}
                  {recommendations.follow_up_care && recommendations.follow_up_care.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-green-600" />
                        Follow-up Care
                      </h3>
                      <ul className="space-y-2">
                        {recommendations.follow_up_care.map((care, index) => (
                          <li key={index} className="flex items-start gap-2 text-slate-700">
                            <Clock className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>{care}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-xl">
                <CardContent className="p-12 text-center">
                  <Heart className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">Recommendations Loading...</h3>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos">
            <Card className="shadow-xl border-2 border-blue-200">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                <CardTitle className="text-2xl">Educational Videos</CardTitle>
                <CardDescription className="text-slate-600">
                  Learn more about {getDiseaseDisplayName(result.disease_type)}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {videos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videos.map((video) => (
                      <div key={video.video_id} className="overflow-hidden rounded-xl border-2 border-slate-200 hover:border-blue-300 transition-all duration-300 hover:shadow-xl">
                        <div className="relative aspect-video">
                          <img
                            src={video.thumbnail_url}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                            <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <Video className="w-8 h-8 text-blue-600" />
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-slate-800 mb-2 line-clamp-2">{video.title}</h3>
                          <p className="text-sm text-slate-600 line-clamp-2 mb-3">{video.description}</p>
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>{video.channel_title}</span>
                            <span>{new Date(video.published_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Video className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                    <h3 className="text-xl font-semibold text-slate-800 mb-2">No Videos Available</h3>
                    <p className="text-slate-600">Check back later for educational content.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Articles Tab */}
          <TabsContent value="articles">
            <Card className="shadow-xl border-2 border-purple-200">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100">
                <CardTitle className="text-2xl">Health Articles</CardTitle>
                <CardDescription className="text-slate-600">
                  Read more about {getDiseaseDisplayName(result.disease_type)}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {articles.length > 0 ? (
                  <div className="space-y-4">
                    {articles.map((article) => (
                      <div key={article.id} className="p-6 bg-white border-2 border-slate-200 rounded-xl hover:border-purple-300 transition-all duration-300 hover:shadow-lg">
                        <div className="flex items-start justify-between mb-2">
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                            {article.category}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold text-slate-800 mb-2">{article.title}</h3>
                        <p className="text-slate-600 line-clamp-2">{article.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                    <h3 className="text-xl font-semibold text-slate-800 mb-2">No Articles Available</h3>
                    <p className="text-slate-600">Check back later for educational articles.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Medical Disclaimer */}
        <div className="mt-8 p-6 bg-white rounded-2xl shadow-lg border-2 border-red-200">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Important Medical Disclaimer
              </h3>
              <p className="text-slate-600 leading-relaxed">
                This AI-powered analysis and prescription generation is for informational purposes only and should 
                not be used as a substitute for professional medical advice, diagnosis, or treatment. Always seek 
                the advice of your physician or other qualified health provider with any questions you may have 
                regarding a medical condition. If you think you may have a medical emergency, immediately call 
                your doctor or emergency services.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;