import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Activity, Heart, Brain, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Predict = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('diabetes');

  const [diabetesForm, setDiabetesForm] = useState({
    glucose: '',
    bmi: '',
    age: '',
    blood_pressure: '',
  });

  const [heartForm, setHeartForm] = useState({
    age: '',
    cholesterol: '',
    blood_pressure: '',
    heart_rate: '',
  });

  const [parkinsonForm, setParkinsonForm] = useState({
    age: '',
    tremor_score: '',
    motor_score: '',
    voice_variation: '',
  });

  const handleDiabetesSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/predict`, {
        disease_type: 'diabetes',
        parameters: {
          glucose: parseFloat(diabetesForm.glucose),
          bmi: parseFloat(diabetesForm.bmi),
          age: parseFloat(diabetesForm.age),
          blood_pressure: parseFloat(diabetesForm.blood_pressure),
        },
      });

      toast.success('Prediction completed successfully!');
      navigate(`/results/diabetes`, { state: { result: response.data } });
    } catch (error) {
      toast.error('Prediction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleHeartSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/predict`, {
        disease_type: 'heart',
        parameters: {
          age: parseFloat(heartForm.age),
          cholesterol: parseFloat(heartForm.cholesterol),
          blood_pressure: parseFloat(heartForm.blood_pressure),
          heart_rate: parseFloat(heartForm.heart_rate),
        },
      });

      toast.success('Prediction completed successfully!');
      navigate(`/results/heart`, { state: { result: response.data } });
    } catch (error) {
      toast.error('Prediction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleParkinsonSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/predict`, {
        disease_type: 'parkinson',
        parameters: {
          age: parseFloat(parkinsonForm.age),
          tremor_score: parseFloat(parkinsonForm.tremor_score),
          motor_score: parseFloat(parkinsonForm.motor_score),
          voice_variation: parseFloat(parkinsonForm.voice_variation),
        },
      });

      toast.success('Prediction completed successfully!');
      navigate(`/results/parkinson`, { state: { result: response.data } });
    } catch (error) {
      toast.error('Prediction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-primary-900 mb-4" data-testid="predict-page-title">
            Disease Prediction
          </h1>
          <p className="font-sans text-base text-slate-600">
            Enter your health parameters to get AI-powered risk assessment
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="diabetes" data-testid="tab-diabetes" className="space-x-2">
              <Activity className="h-4 w-4" />
              <span>Diabetes</span>
            </TabsTrigger>
            <TabsTrigger value="heart" data-testid="tab-heart" className="space-x-2">
              <Heart className="h-4 w-4" />
              <span>Heart</span>
            </TabsTrigger>
            <TabsTrigger value="parkinson" data-testid="tab-parkinson" className="space-x-2">
              <Brain className="h-4 w-4" />
              <span>Parkinson's</span>
            </TabsTrigger>
          </TabsList>

          {/* Diabetes Form */}
          <TabsContent value="diabetes">
            <Card className="bg-white rounded-2xl border border-slate-100 shadow-soft">
              <CardHeader>
                <CardTitle className="font-heading text-2xl text-primary-800">Diabetes Screening</CardTitle>
                <CardDescription className="font-sans">Enter your blood sugar and health metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleDiabetesSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="glucose">Glucose Level (mg/dL)</Label>
                      <Input
                        id="glucose"
                        type="number"
                        data-testid="input-glucose"
                        placeholder="e.g., 120"
                        value={diabetesForm.glucose}
                        onChange={(e) => setDiabetesForm({ ...diabetesForm, glucose: e.target.value })}
                        required
                        className="bg-white border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bmi">BMI (Body Mass Index)</Label>
                      <Input
                        id="bmi"
                        type="number"
                        step="0.1"
                        data-testid="input-bmi"
                        placeholder="e.g., 25.5"
                        value={diabetesForm.bmi}
                        onChange={(e) => setDiabetesForm({ ...diabetesForm, bmi: e.target.value })}
                        required
                        className="bg-white border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age">Age (years)</Label>
                      <Input
                        id="age"
                        type="number"
                        data-testid="input-age"
                        placeholder="e.g., 45"
                        value={diabetesForm.age}
                        onChange={(e) => setDiabetesForm({ ...diabetesForm, age: e.target.value })}
                        required
                        className="bg-white border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="blood_pressure">Blood Pressure (mmHg)</Label>
                      <Input
                        id="blood_pressure"
                        type="number"
                        data-testid="input-blood-pressure"
                        placeholder="e.g., 80"
                        value={diabetesForm.blood_pressure}
                        onChange={(e) => setDiabetesForm({ ...diabetesForm, blood_pressure: e.target.value })}
                        required
                        className="bg-white border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 rounded-xl"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    data-testid="btn-submit-diabetes"
                    disabled={loading}
                    className="w-full bg-primary-600 text-white hover:bg-primary-700 shadow-soft hover:shadow-hover rounded-full py-6 font-medium"
                  >
                    {loading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                    ) : (
                      <><span>Get Prediction</span><ArrowRight className="ml-2 h-4 w-4" /></>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Heart Disease Form */}
          <TabsContent value="heart">
            <Card className="bg-white rounded-2xl border border-slate-100 shadow-soft">
              <CardHeader>
                <CardTitle className="font-heading text-2xl text-primary-800">Heart Disease Screening</CardTitle>
                <CardDescription className="font-sans">Enter your cardiovascular health metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleHeartSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="heart-age">Age (years)</Label>
                      <Input
                        id="heart-age"
                        type="number"
                        data-testid="input-heart-age"
                        placeholder="e.g., 55"
                        value={heartForm.age}
                        onChange={(e) => setHeartForm({ ...heartForm, age: e.target.value })}
                        required
                        className="bg-white border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cholesterol">Cholesterol (mg/dL)</Label>
                      <Input
                        id="cholesterol"
                        type="number"
                        data-testid="input-cholesterol"
                        placeholder="e.g., 200"
                        value={heartForm.cholesterol}
                        onChange={(e) => setHeartForm({ ...heartForm, cholesterol: e.target.value })}
                        required
                        className="bg-white border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="heart-bp">Blood Pressure (mmHg)</Label>
                      <Input
                        id="heart-bp"
                        type="number"
                        data-testid="input-heart-bp"
                        placeholder="e.g., 120"
                        value={heartForm.blood_pressure}
                        onChange={(e) => setHeartForm({ ...heartForm, blood_pressure: e.target.value })}
                        required
                        className="bg-white border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="heart-rate">Heart Rate (bpm)</Label>
                      <Input
                        id="heart-rate"
                        type="number"
                        data-testid="input-heart-rate"
                        placeholder="e.g., 72"
                        value={heartForm.heart_rate}
                        onChange={(e) => setHeartForm({ ...heartForm, heart_rate: e.target.value })}
                        required
                        className="bg-white border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 rounded-xl"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    data-testid="btn-submit-heart"
                    disabled={loading}
                    className="w-full bg-primary-600 text-white hover:bg-primary-700 shadow-soft hover:shadow-hover rounded-full py-6 font-medium"
                  >
                    {loading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                    ) : (
                      <><span>Get Prediction</span><ArrowRight className="ml-2 h-4 w-4" /></>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Parkinson's Form */}
          <TabsContent value="parkinson">
            <Card className="bg-white rounded-2xl border border-slate-100 shadow-soft">
              <CardHeader>
                <CardTitle className="font-heading text-2xl text-primary-800">Parkinson's Screening</CardTitle>
                <CardDescription className="font-sans">Enter your motor and neurological assessment scores</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleParkinsonSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="parkinson-age">Age (years)</Label>
                      <Input
                        id="parkinson-age"
                        type="number"
                        data-testid="input-parkinson-age"
                        placeholder="e.g., 65"
                        value={parkinsonForm.age}
                        onChange={(e) => setParkinsonForm({ ...parkinsonForm, age: e.target.value })}
                        required
                        className="bg-white border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tremor">Tremor Score (0-10)</Label>
                      <Input
                        id="tremor"
                        type="number"
                        step="0.1"
                        data-testid="input-tremor"
                        placeholder="e.g., 5.5"
                        value={parkinsonForm.tremor_score}
                        onChange={(e) => setParkinsonForm({ ...parkinsonForm, tremor_score: e.target.value })}
                        required
                        className="bg-white border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="motor">Motor Score (0-40)</Label>
                      <Input
                        id="motor"
                        type="number"
                        step="0.1"
                        data-testid="input-motor"
                        placeholder="e.g., 20"
                        value={parkinsonForm.motor_score}
                        onChange={(e) => setParkinsonForm({ ...parkinsonForm, motor_score: e.target.value })}
                        required
                        className="bg-white border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="voice">Voice Variation Score (0-10)</Label>
                      <Input
                        id="voice"
                        type="number"
                        step="0.1"
                        data-testid="input-voice"
                        placeholder="e.g., 3.5"
                        value={parkinsonForm.voice_variation}
                        onChange={(e) => setParkinsonForm({ ...parkinsonForm, voice_variation: e.target.value })}
                        required
                        className="bg-white border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 rounded-xl"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    data-testid="btn-submit-parkinson"
                    disabled={loading}
                    className="w-full bg-primary-600 text-white hover:bg-primary-700 shadow-soft hover:shadow-hover rounded-full py-6 font-medium"
                  >
                    {loading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                    ) : (
                      <><span>Get Prediction</span><ArrowRight className="ml-2 h-4 w-4" /></>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Info Card */}
        <div className="mt-8 bg-secondary-50 rounded-2xl p-6 border border-secondary-200">
          <p className="font-sans text-sm text-slate-600">
            <strong>Note:</strong> This is a screening tool and not a diagnostic test. Always consult with healthcare 
            professionals for medical advice and proper diagnosis.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Predict;