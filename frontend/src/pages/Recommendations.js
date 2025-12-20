import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Pill, Shield, UtensilsCrossed, Loader2, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Recommendations = () => {
  const { disease } = useParams();
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await axios.get(`${API}/recommendations/${disease}`);
        setRecommendations(response.data);
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [disease]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!recommendations) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-sans text-slate-600">Failed to load recommendations</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-primary-900 mb-4 capitalize" data-testid="recommendations-title">
            {disease} Management Guide
          </h1>
          <p className="font-sans text-base text-slate-600">
            Personalized recommendations for managing your health condition
          </p>
        </div>

        {/* Medications */}
        <Card className="bg-white rounded-3xl border border-slate-100 shadow-soft mb-8">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                <Pill className="h-6 w-6" />
              </div>
              <CardTitle className="font-heading text-2xl text-primary-800">Medications</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="font-sans text-sm text-slate-600 mb-6">
              Common medications prescribed for managing {disease}. Always follow your doctor's prescription.
            </p>
            <div className="space-y-3">
              {recommendations.medications.map((medication, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-4 bg-blue-50 rounded-xl border border-blue-100 hover:border-blue-200 transition-colors"
                  data-testid={`medication-${index}`}
                >
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="font-sans text-sm text-slate-700">{medication}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Safety Measures */}
        <Card className="bg-white rounded-3xl border border-slate-100 shadow-soft mb-8">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-orange-100 text-orange-600">
                <Shield className="h-6 w-6" />
              </div>
              <CardTitle className="font-heading text-2xl text-primary-800">Safety Measures</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="font-sans text-sm text-slate-600 mb-6">
              Important safety precautions and lifestyle modifications to follow daily.
            </p>
            <Accordion type="single" collapsible className="w-full">
              {recommendations.safety_measures.map((measure, index) => (
                <AccordionItem key={index} value={`safety-${index}`}>
                  <AccordionTrigger
                    data-testid={`safety-${index}`}
                    className="font-sans text-left hover:text-primary-600"
                  >
                    {measure.split(':')[0] || measure.substring(0, 50)}
                  </AccordionTrigger>
                  <AccordionContent className="font-sans text-sm text-slate-600 pl-4">
                    {measure}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Diet Recommendations */}
        <Card className="bg-white rounded-3xl border border-slate-100 shadow-soft mb-8">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-green-100 text-green-600">
                <UtensilsCrossed className="h-6 w-6" />
              </div>
              <CardTitle className="font-heading text-2xl text-primary-800">Diet & Nutrition</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="font-sans text-sm text-slate-600 mb-6">
              Nutritional guidelines to support your health and manage your condition.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.diet_recommendations.map((diet, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-4 bg-green-50 rounded-xl border border-green-100 hover:border-green-200 transition-colors"
                  data-testid={`diet-${index}`}
                >
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="font-sans text-sm text-slate-700">{diet}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Image Section */}
        <div className="rounded-3xl overflow-hidden shadow-hover mb-8">
          <img
            src="https://images.unsplash.com/photo-1622637012640-83ff490e189f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHwyfHxoZWFsdGh5JTIwZm9vZCUyMG1lZGl0ZXJyYW5lYW4lMjBkaWV0JTIwZmxhdCUyMGxheXxlbnwwfHx8fDE3NjYyNTIwODJ8MA&ixlib=rb-4.1.0&q=85"
            alt="Healthy Mediterranean diet"
            className="w-full h-64 object-cover"
          />
        </div>

        {/* Disclaimer */}
        <div className="bg-secondary-50 rounded-2xl p-6 border border-secondary-200">
          <p className="font-sans text-sm text-slate-600 leading-relaxed">
            <strong>Medical Disclaimer:</strong> These recommendations are for informational purposes only and should not 
            replace professional medical advice. Always consult with your healthcare provider before starting any medication, 
            changing your diet, or making significant lifestyle modifications. Individual treatment plans may vary based on 
            your specific health condition and medical history.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Recommendations;