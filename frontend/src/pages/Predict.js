import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Activity, Heart, Brain, Droplets, Shield, AlertTriangle, Kidney, Liver, Zap, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
const API = `${BACKEND_URL}/api`;

const Predict = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('diabetes');

  // Diabetes Form
  const [diabetesForm, setDiabetesForm] = useState({
    glucose: '',
    bmi: '',
    age: '',
    blood_pressure: '',
    pregnancies: '',
    skin_thickness: '',
    insulin: '',
    diabetes_pedigree: ''
  });

  // Heart Disease Form
  const [heartForm, setHeartForm] = useState({
    age: '',
    cholesterol: '',
    blood_pressure: '',
    heart_rate: '',
    max_hr: '',
    exercise_induced_angina: '',
    oldpeak: '',
    ca: '',
    thal: ''
  });

  // Parkinson's Form
  const [parkinsonForm, setParkinsonForm] = useState({
    age: '',
    tremor_score: '',
    motor_score: '',
    voice_variation: '',
    jitter: '',
    shimmer: '',
    nhr: '',
    hnr: '',
    rpde: '',
    d2: '',
    ppe: ''
  });

  // Hypertension Form
  const [hypertensionForm, setHypertensionForm] = useState({
    age: '',
    bmi: '',
    systolic_bp: '',
    diastolic_bp: '',
    cholesterol: '',
    fasting_blood_sugar: '',
    family_history: '',
    smoking: '',
    alcohol: ''
  });

  // Cancer Risk Form
  const [cancerForm, setCancerForm] = useState({
    age: '',
    family_history: '',
    smoking: '',
    alcohol: '',
    bmi: '',
    physical_activity: '',
    radiation_exposure: '',
    chemical_exposure: '',
    years_of_exposure: ''
  });

  // Kidney Disease Form
  const [kidneyForm, setKidneyForm] = useState({
    age: '',
    blood_pressure_high: '',
    blood_glucose_random: '',
    specific_gravity: '',
    albumin: '',
    sugar: '',
    blood_urea: '',
    serum_creatinine: '',
    sodium: '',
    potassium: '',
    hemoglobin: '',
    packed_cell_volume: ''
  });

  // Liver Disease Form
  const [liverForm, setLiverForm] = useState({
    age: '',
    gender: '',
    total_bilirubin: '',
    direct_bilirubin: '',
    alkaline_phosphatase: '',
    alamine_aminotransferase: '',
    aspartate_aminotransferase: '',
    total_protiens: '',
    albumin: '',
    albumin_globulin_ratio: ''
  });

  // Stroke Form
  const [strokeForm, setStrokeForm] = useState({
    age: '',
    hypertension: '',
    heart_disease: '',
    married: '',
    avg_glucose_level: '',
    bmi: '',
    smoking_status: '',
    gender: '',
    work_type: ''
  });

  const handleSubmit = async (diseaseType, formState, event) => {
    if (event) event.preventDefault();
    setLoading(true);

    try {
      // Convert form values to numbers
      const parameters = {};
      Object.keys(formState).forEach(key => {
        const value = formState[key];
        parameters[key] = value === '' ? 0 : parseFloat(value);
      });

      const response = await axios.post(`${API}/predict`, {
        disease_type: diseaseType,
        parameters: parameters
      });

      toast.success('Prediction completed successfully!');
      navigate(`/results/${diseaseType}`, { state: { result: response.data } });
    } catch (error) {
      console.error('Prediction error:', error);
      const errorMessage = error.response?.data?.detail || 'Prediction failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const diseaseIcons = {
    diabetes: Droplets,
    heart: Heart,
    parkinson: Brain,
    hypertension: Activity,
    cancer_risk: Shield,
    kidney_disease: Kidney,
    liver_disease: Liver,
    stroke: AlertTriangle
  };

  const diseaseColors = {
    diabetes: 'text-blue-600',
    heart: 'text-red-600',
    parkinson: 'text-purple-600',
    hypertension: 'text-orange-600',
    cancer_risk: 'text-green-600',
    kidney_disease: 'text-amber-600',
    liver_disease: 'text-yellow-600',
    stroke: 'text-rose-600'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-stone-100 to-primary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-900 mb-4">
            Advanced Disease Prediction
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Our AI-powered medical analysis uses advanced machine learning models trained on real medical data
            to provide accurate health assessments with confidence scores.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid grid-cols-4 md:grid-cols-8 gap-2 h-auto p-2 bg-white shadow-lg rounded-xl border border-slate-200">
            <TabsTrigger value="diabetes" className="flex flex-col items-center gap-1 p-3 data-[state=active]:bg-primary-600 data-[state=active]:text-white">
              <Droplets className="w-5 h-5" />
              <span className="text-xs">Diabetes</span>
            </TabsTrigger>
            <TabsTrigger value="heart" className="flex flex-col items-center gap-1 p-3 data-[state=active]:bg-red-600 data-[state=active]:text-white">
              <Heart className="w-5 h-5" />
              <span className="text-xs">Heart</span>
            </TabsTrigger>
            <TabsTrigger value="parkinson" className="flex flex-col items-center gap-1 p-3 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <Brain className="w-5 h-5" />
              <span className="text-xs">Parkinson</span>
            </TabsTrigger>
            <TabsTrigger value="hypertension" className="flex flex-col items-center gap-1 p-3 data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              <Activity className="w-5 h-5" />
              <span className="text-xs">Hypertension</span>
            </TabsTrigger>
            <TabsTrigger value="cancer_risk" className="flex flex-col items-center gap-1 p-3 data-[state=active]:bg-green-600 data-[state=active]:text-white">
              <Shield className="w-5 h-5" />
              <span className="text-xs">Cancer</span>
            </TabsTrigger>
            <TabsTrigger value="kidney_disease" className="flex flex-col items-center gap-1 p-3 data-[state=active]:bg-amber-600 data-[state=active]:text-white">
              <Kidney className="w-5 h-5" />
              <span className="text-xs">Kidney</span>
            </TabsTrigger>
            <TabsTrigger value="liver_disease" className="flex flex-col items-center gap-1 p-3 data-[state=active]:bg-yellow-600 data-[state=active]:text-white">
              <Liver className="w-5 h-5" />
              <span className="text-xs">Liver</span>
            </TabsTrigger>
            <TabsTrigger value="stroke" className="flex flex-col items-center gap-1 p-3 data-[state=active]:bg-rose-600 data-[state=active]:text-white">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-xs">Stroke</span>
            </TabsTrigger>
          </TabsList>

          {/* Diabetes Tab */}
          <TabsContent value="diabetes">
            <Card className="shadow-2xl border-2 border-blue-100">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <div className="flex items-center gap-3">
                  <Droplets className="w-8 h-8" />
                  <div>
                    <CardTitle className="text-2xl">Type 2 Diabetes Prediction</CardTitle>
                    <CardDescription className="text-blue-100">
                      AI-powered analysis based on glucose levels, BMI, age, and blood pressure
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={(e) => handleSubmit('diabetes', diabetesForm, e)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="glucose" className="text-sm font-medium text-slate-700">
                        Glucose Level (mg/dL) *
                      </Label>
                      <Input
                        id="glucose"
                        type="number"
                        placeholder="e.g., 120"
                        value={diabetesForm.glucose}
                        onChange={(e) => setDiabetesForm({ ...diabetesForm, glucose: e.target.value })}
                        required
                        className="border-2 focus:border-blue-500"
                      />
                      <p className="text-xs text-slate-500">Normal: 70-99 mg/dL</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bmi" className="text-sm font-medium text-slate-700">
                        BMI *
                      </Label>
                      <Input
                        id="bmi"
                        type="number"
                        step="0.1"
                        placeholder="e.g., 25.5"
                        value={diabetesForm.bmi}
                        onChange={(e) => setDiabetesForm({ ...diabetesForm, bmi: e.target.value })}
                        required
                        className="border-2 focus:border-blue-500"
                      />
                      <p className="text-xs text-slate-500">Normal: 18.5-24.9</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="age" className="text-sm font-medium text-slate-700">
                        Age (years) *
                      </Label>
                      <Input
                        id="age"
                        type="number"
                        placeholder="e.g., 45"
                        value={diabetesForm.age}
                        onChange={(e) => setDiabetesForm({ ...diabetesForm, age: e.target.value })}
                        required
                        className="border-2 focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="blood_pressure" className="text-sm font-medium text-slate-700">
                        Blood Pressure (mmHg) *
                      </Label>
                      <Input
                        id="blood_pressure"
                        type="number"
                        placeholder="e.g., 80"
                        value={diabetesForm.blood_pressure}
                        onChange={(e) => setDiabetesForm({ ...diabetesForm, blood_pressure: e.target.value })}
                        required
                        className="border-2 focus:border-blue-500"
                      />
                      <p className="text-xs text-slate-500">Diastolic pressure</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pregnancies" className="text-sm font-medium text-slate-700">
                        Pregnancies
                      </Label>
                      <Input
                        id="pregnancies"
                        type="number"
                        placeholder="e.g., 2"
                        value={diabetesForm.pregnancies}
                        onChange={(e) => setDiabetesForm({ ...diabetesForm, pregnancies: e.target.value })}
                        className="border-2 focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="insulin" className="text-sm font-medium text-slate-700">
                        Insulin (mu U/ml)
                      </Label>
                      <Input
                        id="insulin"
                        type="number"
                        placeholder="e.g., 80"
                        value={diabetesForm.insulin}
                        onChange={(e) => setDiabetesForm({ ...diabetesForm, insulin: e.target.value })}
                        className="border-2 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Run Diabetes Prediction'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Heart Disease Tab */}
          <TabsContent value="heart">
            <Card className="shadow-2xl border-2 border-red-100">
              <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                <div className="flex items-center gap-3">
                  <Heart className="w-8 h-8" />
                  <div>
                    <CardTitle className="text-2xl">Heart Disease Prediction</CardTitle>
                    <CardDescription className="text-red-100">
                      Cardiovascular risk assessment based on cholesterol, blood pressure, and cardiac metrics
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={(e) => handleSubmit('heart', heartForm, e)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="heart_age" className="text-sm font-medium text-slate-700">
                        Age (years) *
                      </Label>
                      <Input
                        id="heart_age"
                        type="number"
                        placeholder="e.g., 55"
                        value={heartForm.age}
                        onChange={(e) => setHeartForm({ ...heartForm, age: e.target.value })}
                        required
                        className="border-2 focus:border-red-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cholesterol" className="text-sm font-medium text-slate-700">
                        Cholesterol (mg/dL) *
                      </Label>
                      <Input
                        id="cholesterol"
                        type="number"
                        placeholder="e.g., 200"
                        value={heartForm.cholesterol}
                        onChange={(e) => setHeartForm({ ...heartForm, cholesterol: e.target.value })}
                        required
                        className="border-2 focus:border-red-500"
                      />
                      <p className="text-xs text-slate-500">Desirable: &lt;200 mg/dL</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="heart_bp" className="text-sm font-medium text-slate-700">
                        Blood Pressure (mmHg) *
                      </Label>
                      <Input
                        id="heart_bp"
                        type="number"
                        placeholder="e.g., 130"
                        value={heartForm.blood_pressure}
                        onChange={(e) => setHeartForm({ ...heartForm, blood_pressure: e.target.value })}
                        required
                        className="border-2 focus:border-red-500"
                      />
                      <p className="text-xs text-slate-500">Systolic pressure</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="heart_rate" className="text-sm font-medium text-slate-700">
                        Resting Heart Rate (bpm) *
                      </Label>
                      <Input
                        id="heart_rate"
                        type="number"
                        placeholder="e.g., 72"
                        value={heartForm.heart_rate}
                        onChange={(e) => setHeartForm({ ...heartForm, heart_rate: e.target.value })}
                        required
                        className="border-2 focus:border-red-500"
                      />
                      <p className="text-xs text-slate-500">Normal: 60-100 bpm</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="max_hr" className="text-sm font-medium text-slate-700">
                        Maximum Heart Rate (bpm)
                      </Label>
                      <Input
                        id="max_hr"
                        type="number"
                        placeholder="e.g., 165"
                        value={heartForm.max_hr}
                        onChange={(e) => setHeartForm({ ...heartForm, max_hr: e.target.value })}
                        className="border-2 focus:border-red-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="oldpeak" className="text-sm font-medium text-slate-700">
                        ST Depression (oldpeak)
                      </Label>
                      <Input
                        id="oldpeak"
                        type="number"
                        step="0.1"
                        placeholder="e.g., 1.5"
                        value={heartForm.oldpeak}
                        onChange={(e) => setHeartForm({ ...heartForm, oldpeak: e.target.value })}
                        className="border-2 focus:border-red-500"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Run Heart Disease Prediction'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Parkinson's Tab */}
          <TabsContent value="parkinson">
            <Card className="shadow-2xl border-2 border-purple-100">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <div className="flex items-center gap-3">
                  <Brain className="w-8 h-8" />
                  <div>
                    <CardTitle className="text-2xl">Parkinson's Disease Prediction</CardTitle>
                    <CardDescription className="text-purple-100">
                      Neurological assessment using voice, motor, and tremor analysis
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={(e) => handleSubmit('parkinson', parkinsonForm, e)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="parkinson_age" className="text-sm font-medium text-slate-700">
                        Age (years) *
                      </Label>
                      <Input
                        id="parkinson_age"
                        type="number"
                        placeholder="e.g., 65"
                        value={parkinsonForm.age}
                        onChange={(e) => setParkinsonForm({ ...parkinsonForm, age: e.target.value })}
                        required
                        className="border-2 focus:border-purple-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tremor_score" className="text-sm font-medium text-slate-700">
                        Tremor Score (0-10) *
                      </Label>
                      <Input
                        id="tremor_score"
                        type="number"
                        step="0.1"
                        placeholder="e.g., 5.5"
                        value={parkinsonForm.tremor_score}
                        onChange={(e) => setParkinsonForm({ ...parkinsonForm, tremor_score: e.target.value })}
                        required
                        className="border-2 focus:border-purple-500"
                      />
                      <p className="text-xs text-slate-500">Higher score indicates more severe tremors</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="motor_score" className="text-sm font-medium text-slate-700">
                        Motor Score (0-50) *
                      </Label>
                      <Input
                        id="motor_score"
                        type="number"
                        placeholder="e.g., 20"
                        value={parkinsonForm.motor_score}
                        onChange={(e) => setParkinsonForm({ ...parkinsonForm, motor_score: e.target.value })}
                        required
                        className="border-2 focus:border-purple-500"
                      />
                      <p className="text-xs text-slate-500">UPDRS motor score</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="voice_variation" className="text-sm font-medium text-slate-700">
                        Voice Variation (0-10) *
                      </Label>
                      <Input
                        id="voice_variation"
                        type="number"
                        step="0.1"
                        placeholder="e.g., 3.2"
                        value={parkinsonForm.voice_variation}
                        onChange={(e) => setParkinsonForm({ ...parkinsonForm, voice_variation: e.target.value })}
                        required
                        className="border-2 focus:border-purple-500"
                      />
                      <p className="text-xs text-slate-500">Lower variation may indicate Parkinson's</p>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Run Parkinson\'s Prediction'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hypertension Tab */}
          <TabsContent value="hypertension">
            <Card className="shadow-2xl border-2 border-orange-100">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <div className="flex items-center gap-3">
                  <Activity className="w-8 h-8" />
                  <div>
                    <CardTitle className="text-2xl">Hypertension Prediction</CardTitle>
                    <CardDescription className="text-orange-100">
                      Blood pressure assessment with cardiovascular risk factors
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={(e) => handleSubmit('hypertension', hypertensionForm, e)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="htn_age" className="text-sm font-medium text-slate-700">
                        Age (years) *
                      </Label>
                      <Input
                        id="htn_age"
                        type="number"
                        placeholder="e.g., 50"
                        value={hypertensionForm.age}
                        onChange={(e) => setHypertensionForm({ ...hypertensionForm, age: e.target.value })}
                        required
                        className="border-2 focus:border-orange-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="htn_bmi" className="text-sm font-medium text-slate-700">
                        BMI *
                      </Label>
                      <Input
                        id="htn_bmi"
                        type="number"
                        step="0.1"
                        placeholder="e.g., 28"
                        value={hypertensionForm.bmi}
                        onChange={(e) => setHypertensionForm({ ...hypertensionForm, bmi: e.target.value })}
                        required
                        className="border-2 focus:border-orange-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="systolic_bp" className="text-sm font-medium text-slate-700">
                        Systolic BP (mmHg) *
                      </Label>
                      <Input
                        id="systolic_bp"
                        type="number"
                        placeholder="e.g., 140"
                        value={hypertensionForm.systolic_bp}
                        onChange={(e) => setHypertensionForm({ ...hypertensionForm, systolic_bp: e.target.value })}
                        required
                        className="border-2 focus:border-orange-500"
                      />
                      <p className="text-xs text-slate-500">Normal: &lt;120 mmHg</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="diastolic_bp" className="text-sm font-medium text-slate-700">
                        Diastolic BP (mmHg) *
                      </Label>
                      <Input
                        id="diastolic_bp"
                        type="number"
                        placeholder="e.g., 90"
                        value={hypertensionForm.diastolic_bp}
                        onChange={(e) => setHypertensionForm({ ...hypertensionForm, diastolic_bp: e.target.value })}
                        required
                        className="border-2 focus:border-orange-500"
                      />
                      <p className="text-xs text-slate-500">Normal: &lt;80 mmHg</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="htn_cholesterol" className="text-sm font-medium text-slate-700">
                        Cholesterol (mg/dL)
                      </Label>
                      <Input
                        id="htn_cholesterol"
                        type="number"
                        placeholder="e.g., 220"
                        value={hypertensionForm.cholesterol}
                        onChange={(e) => setHypertensionForm({ ...hypertensionForm, cholesterol: e.target.value })}
                        className="border-2 focus:border-orange-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fasting_sugar" className="text-sm font-medium text-slate-700">
                        Fasting Blood Sugar (mg/dL)
                      </Label>
                      <Input
                        id="fasting_sugar"
                        type="number"
                        placeholder="e.g., 100"
                        value={hypertensionForm.fasting_blood_sugar}
                        onChange={(e) => setHypertensionForm({ ...hypertensionForm, fasting_blood_sugar: e.target.value })}
                        className="border-2 focus:border-orange-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="family_history" className="text-sm font-medium text-slate-700">
                        Family History (0=No, 1=Yes)
                      </Label>
                      <Input
                        id="family_history"
                        type="number"
                        placeholder="0 or 1"
                        value={hypertensionForm.family_history}
                        onChange={(e) => setHypertensionForm({ ...hypertensionForm, family_history: e.target.value })}
                        className="border-2 focus:border-orange-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="smoking" className="text-sm font-medium text-slate-700">
                        Smoking (0=No, 1=Yes)
                      </Label>
                      <Input
                        id="smoking"
                        type="number"
                        placeholder="0 or 1"
                        value={hypertensionForm.smoking}
                        onChange={(e) => setHypertensionForm({ ...hypertensionForm, smoking: e.target.value })}
                        className="border-2 focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Run Hypertension Prediction'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cancer Risk Tab */}
          <TabsContent value="cancer_risk">
            <Card className="shadow-2xl border-2 border-green-100">
              <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <div className="flex items-center gap-3">
                  <Shield className="w-8 h-8" />
                  <div>
                    <CardTitle className="text-2xl">Cancer Risk Assessment</CardTitle>
                    <CardDescription className="text-green-100">
                      Comprehensive risk evaluation based on lifestyle and genetic factors
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={(e) => handleSubmit('cancer_risk', cancerForm, e)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="cancer_age" className="text-sm font-medium text-slate-700">
                        Age (years) *
                      </Label>
                      <Input
                        id="cancer_age"
                        type="number"
                        placeholder="e.g., 55"
                        value={cancerForm.age}
                        onChange={(e) => setCancerForm({ ...cancerForm, age: e.target.value })}
                        required
                        className="border-2 focus:border-green-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cancer_bmi" className="text-sm font-medium text-slate-700">
                        BMI *
                      </Label>
                      <Input
                        id="cancer_bmi"
                        type="number"
                        step="0.1"
                        placeholder="e.g., 27"
                        value={cancerForm.bmi}
                        onChange={(e) => setCancerForm({ ...cancerForm, bmi: e.target.value })}
                        required
                        className="border-2 focus:border-green-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cancer_family_history" className="text-sm font-medium text-slate-700">
                        Family History (0=No, 1=Yes) *
                      </Label>
                      <Input
                        id="cancer_family_history"
                        type="number"
                        placeholder="0 or 1"
                        value={cancerForm.family_history}
                        onChange={(e) => setCancerForm({ ...cancerForm, family_history: e.target.value })}
                        required
                        className="border-2 focus:border-green-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cancer_smoking" className="text-sm font-medium text-slate-700">
                        Smoking (0=No, 1=Yes) *
                      </Label>
                      <Input
                        id="cancer_smoking"
                        type="number"
                        placeholder="0 or 1"
                        value={cancerForm.smoking}
                        onChange={(e) => setCancerForm({ ...cancerForm, smoking: e.target.value })}
                        required
                        className="border-2 focus:border-green-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cancer_alcohol" className="text-sm font-medium text-slate-700">
                        Alcohol Consumption (0=No, 1=Yes) *
                      </Label>
                      <Input
                        id="cancer_alcohol"
                        type="number"
                        placeholder="0 or 1"
                        value={cancerForm.alcohol}
                        onChange={(e) => setCancerForm({ ...cancerForm, alcohol: e.target.value })}
                        required
                        className="border-2 focus:border-green-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="physical_activity" className="text-sm font-medium text-slate-700">
                        Physical Activity (minutes/week)
                      </Label>
                      <Input
                        id="physical_activity"
                        type="number"
                        placeholder="e.g., 150"
                        value={cancerForm.physical_activity}
                        onChange={(e) => setCancerForm({ ...cancerForm, physical_activity: e.target.value })}
                        className="border-2 focus:border-green-500"
                      />
                      <p className="text-xs text-slate-500">Recommended: 150+ minutes/week</p>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Run Cancer Risk Assessment'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Kidney Disease Tab */}
          <TabsContent value="kidney_disease">
            <Card className="shadow-2xl border-2 border-amber-100">
              <CardHeader className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
                <div className="flex items-center gap-3">
                  <Kidney className="w-8 h-8" />
                  <div>
                    <CardTitle className="text-2xl">Kidney Disease Prediction</CardTitle>
                    <CardDescription className="text-amber-100">
                      Renal function assessment using blood and urine markers
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={(e) => handleSubmit('kidney_disease', kidneyForm, e)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="kidney_age" className="text-sm font-medium text-slate-700">
                        Age (years) *
                      </Label>
                      <Input
                        id="kidney_age"
                        type="number"
                        placeholder="e.g., 55"
                        value={kidneyForm.age}
                        onChange={(e) => setKidneyForm({ ...kidneyForm, age: e.target.value })}
                        required
                        className="border-2 focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="serum_creatinine" className="text-sm font-medium text-slate-700">
                        Serum Creatinine (mg/dL) *
                      </Label>
                      <Input
                        id="serum_creatinine"
                        type="number"
                        step="0.1"
                        placeholder="e.g., 1.2"
                        value={kidneyForm.serum_creatinine}
                        onChange={(e) => setKidneyForm({ ...kidneyForm, serum_creatinine: e.target.value })}
                        required
                        className="border-2 focus:border-amber-500"
                      />
                      <p className="text-xs text-slate-500">Normal: 0.7-1.3 mg/dL</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="blood_pressure_high" className="text-sm font-medium text-slate-700">
                        High Blood Pressure (0=No, 1=Yes)
                      </Label>
                      <Input
                        id="blood_pressure_high"
                        type="number"
                        placeholder="0 or 1"
                        value={kidneyForm.blood_pressure_high}
                        onChange={(e) => setKidneyForm({ ...kidneyForm, blood_pressure_high: e.target.value })}
                        className="border-2 focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="blood_glucose_random" className="text-sm font-medium text-slate-700">
                        Random Blood Glucose (mg/dL)
                      </Label>
                      <Input
                        id="blood_glucose_random"
                        type="number"
                        placeholder="e.g., 130"
                        value={kidneyForm.blood_glucose_random}
                        onChange={(e) => setKidneyForm({ ...kidneyForm, blood_glucose_random: e.target.value })}
                        className="border-2 focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hemoglobin" className="text-sm font-medium text-slate-700">
                        Hemoglobin (g/dL)
                      </Label>
                      <Input
                        id="hemoglobin"
                        type="number"
                        step="0.1"
                        placeholder="e.g., 13.5"
                        value={kidneyForm.hemoglobin}
                        onChange={(e) => setKidneyForm({ ...kidneyForm, hemoglobin: e.target.value })}
                        className="border-2 focus:border-amber-500"
                      />
                      <p className="text-xs text-slate-500">Normal: 12-16 g/dL</p>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Run Kidney Disease Prediction'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Liver Disease Tab */}
          <TabsContent value="liver_disease">
            <Card className="shadow-2xl border-2 border-yellow-100">
              <CardHeader className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                <div className="flex items-center gap-3">
                  <Liver className="w-8 h-8" />
                  <div>
                    <CardTitle className="text-2xl">Liver Disease Prediction</CardTitle>
                    <CardDescription className="text-yellow-100">
                      Hepatic function assessment using liver enzymes and biomarkers
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={(e) => handleSubmit('liver_disease', liverForm, e)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="liver_age" className="text-sm font-medium text-slate-700">
                        Age (years) *
                      </Label>
                      <Input
                        id="liver_age"
                        type="number"
                        placeholder="e.g., 45"
                        value={liverForm.age}
                        onChange={(e) => setLiverForm({ ...liverForm, age: e.target.value })}
                        required
                        className="border-2 focus:border-yellow-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="total_bilirubin" className="text-sm font-medium text-slate-700">
                        Total Bilirubin (mg/dL) *
                      </Label>
                      <Input
                        id="total_bilirubin"
                        type="number"
                        step="0.1"
                        placeholder="e.g., 1.2"
                        value={liverForm.total_bilirubin}
                        onChange={(e) => setLiverForm({ ...liverForm, total_bilirubin: e.target.value })}
                        required
                        className="border-2 focus:border-yellow-500"
                      />
                      <p className="text-xs text-slate-500">Normal: 0.3-1.2 mg/dL</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="alamine_aminotransferase" className="text-sm font-medium text-slate-700">
                        ALT (U/L) *
                      </Label>
                      <Input
                        id="alamine_aminotransferase"
                        type="number"
                        placeholder="e.g., 30"
                        value={liverForm.alamine_aminotransferase}
                        onChange={(e) => setLiverForm({ ...liverForm, alamine_aminotransferase: e.target.value })}
                        required
                        className="border-2 focus:border-yellow-500"
                      />
                      <p className="text-xs text-slate-500">Normal: 7-56 U/L</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="liver_albumin" className="text-sm font-medium text-slate-700">
                        Albumin (g/dL) *
                      </Label>
                      <Input
                        id="liver_albumin"
                        type="number"
                        step="0.1"
                        placeholder="e.g., 4.0"
                        value={liverForm.albumin}
                        onChange={(e) => setLiverForm({ ...liverForm, albumin: e.target.value })}
                        required
                        className="border-2 focus:border-yellow-500"
                      />
                      <p className="text-xs text-slate-500">Normal: 3.5-5.0 g/dL</p>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-3 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Run Liver Disease Prediction'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stroke Tab */}
          <TabsContent value="stroke">
            <Card className="shadow-2xl border-2 border-rose-100">
              <CardHeader className="bg-gradient-to-r from-rose-500 to-rose-600 text-white">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-8 h-8" />
                  <div>
                    <CardTitle className="text-2xl">Stroke Risk Prediction</CardTitle>
                    <CardDescription className="text-rose-100">
                      Cerebrovascular risk assessment with cardiovascular factors
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={(e) => handleSubmit('stroke', strokeForm, e)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="stroke_age" className="text-sm font-medium text-slate-700">
                        Age (years) *
                      </Label>
                      <Input
                        id="stroke_age"
                        type="number"
                        placeholder="e.g., 65"
                        value={strokeForm.age}
                        onChange={(e) => setStrokeForm({ ...strokeForm, age: e.target.value })}
                        required
                        className="border-2 focus:border-rose-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="stroke_bmi" className="text-sm font-medium text-slate-700">
                        BMI *
                      </Label>
                      <Input
                        id="stroke_bmi"
                        type="number"
                        step="0.1"
                        placeholder="e.g., 28"
                        value={strokeForm.bmi}
                        onChange={(e) => setStrokeForm({ ...strokeForm, bmi: e.target.value })}
                        required
                        className="border-2 focus:border-rose-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="stroke_hypertension" className="text-sm font-medium text-slate-700">
                        Hypertension (0=No, 1=Yes) *
                      </Label>
                      <Input
                        id="stroke_hypertension"
                        type="number"
                        placeholder="0 or 1"
                        value={strokeForm.hypertension}
                        onChange={(e) => setStrokeForm({ ...strokeForm, hypertension: e.target.value })}
                        required
                        className="border-2 focus:border-rose-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="stroke_heart_disease" className="text-sm font-medium text-slate-700">
                        Heart Disease (0=No, 1=Yes) *
                      </Label>
                      <Input
                        id="stroke_heart_disease"
                        type="number"
                        placeholder="0 or 1"
                        value={strokeForm.heart_disease}
                        onChange={(e) => setStrokeForm({ ...strokeForm, heart_disease: e.target.value })}
                        required
                        className="border-2 focus:border-rose-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="avg_glucose_level" className="text-sm font-medium text-slate-700">
                        Average Glucose Level (mg/dL) *
                      </Label>
                      <Input
                        id="avg_glucose_level"
                        type="number"
                        placeholder="e.g., 100"
                        value={strokeForm.avg_glucose_level}
                        onChange={(e) => setStrokeForm({ ...strokeForm, avg_glucose_level: e.target.value })}
                        required
                        className="border-2 focus:border-rose-500"
                      />
                      <p className="text-xs text-slate-500">Normal: 70-100 mg/dL</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="stroke_smoking" className="text-sm font-medium text-slate-700">
                        Smoking Status (0=No, 1=Yes)
                      </Label>
                      <Input
                        id="stroke_smoking"
                        type="number"
                        placeholder="0 or 1"
                        value={strokeForm.smoking_status}
                        onChange={(e) => setStrokeForm({ ...strokeForm, smoking_status: e.target.value })}
                        className="border-2 focus:border-rose-500"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      'Run Stroke Risk Prediction'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-12 p-6 bg-white rounded-2xl shadow-lg border border-slate-200">
          <div className="flex items-start gap-4">
            <Zap className="w-6 h-6 text-primary-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-primary-900 mb-2">
                Important Medical Disclaimer
              </h3>
              <p className="text-slate-600 leading-relaxed">
                This AI-powered prediction tool is for informational purposes only and should not be used as a substitute 
                for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or 
                other qualified health provider with any questions you may have regarding a medical condition. 
                If you think you may have a medical emergency, immediately call your doctor or emergency services.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Predict;