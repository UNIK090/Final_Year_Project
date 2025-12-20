import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, AlertTriangle, ArrowRight, Activity, Heart, Brain } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';

const Results = () => {
  const { diseaseType } = useParams();
  const location = useLocation();
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (location.state?.result) {
      setResult(location.state.result);
    }
  }, [location]);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-sans text-slate-600">No prediction results found. Please complete a prediction first.</p>
      </div>
    );
  }

  const getIcon = () => {
    switch (diseaseType) {
      case 'diabetes':
        return <Activity className="h-12 w-12" />;
      case 'heart':
        return <Heart className="h-12 w-12" />;
      case 'parkinson':
        return <Brain className="h-12 w-12" />;
      default:
        return <Activity className="h-12 w-12" />;
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'high':
        return 'text-error';
      case 'medium':
        return 'text-warning';
      case 'low':
        return 'text-success';
      default:
        return 'text-slate-600';
    }
  };

  const getRiskIcon = (risk) => {
    switch (risk) {
      case 'high':
        return <AlertCircle className="h-8 w-8" />;
      case 'medium':
        return <AlertTriangle className="h-8 w-8" />;
      case 'low':
        return <CheckCircle2 className="h-8 w-8" />;
      default:
        return <AlertTriangle className="h-8 w-8" />;
    }
  };

  const getRiskBgColor = (risk) => {
    switch (risk) {
      case 'high':
        return 'bg-red-50 border-red-200';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200';
      case 'low':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  const confidencePercent = Math.round(result.confidence * 100);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex p-4 rounded-full bg-primary-100 text-primary-600 mb-4">
            {getIcon()}
          </div>
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-primary-900 mb-4 capitalize" data-testid="results-title">
            {diseaseType} Screening Results
          </h1>
          <p className="font-sans text-base text-slate-600">Your AI-powered health risk assessment</p>
        </div>

        {/* Main Result Card */}
        <Card className={`bg-white rounded-3xl border-2 shadow-hover mb-8 ${getRiskBgColor(result.risk_level)}`}>
          <CardHeader className="text-center pb-6">
            <div className={`inline-flex mx-auto p-4 rounded-full ${getRiskColor(result.risk_level)}`}>
              {getRiskIcon(result.risk_level)}
            </div>
            <CardTitle className="font-heading text-3xl text-primary-900 mt-4">
              {result.prediction === 'positive' ? 'Elevated Risk Detected' : 'Low Risk Detected'}
            </CardTitle>
            <CardDescription className="font-sans text-lg mt-2">
              Risk Level: <span className={`font-semibold capitalize ${getRiskColor(result.risk_level)}`}>{result.risk_level}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Confidence Meter */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-sans text-sm font-medium text-slate-700">Prediction Confidence</span>
                <span className="font-sans text-sm font-bold text-primary-700" data-testid="confidence-value">{confidencePercent}%</span>
              </div>
              <Progress value={confidencePercent} className="h-3" />
            </div>

            {/* Parameter Summary */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <h3 className="font-heading font-semibold text-lg text-primary-800 mb-4">Input Parameters</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(result.parameters).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <p className="font-sans text-xs text-slate-500 uppercase tracking-wider mb-1">
                      {key.replace('_', ' ')}
                    </p>
                    <p className="font-heading font-semibold text-lg text-primary-900">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations CTA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-primary-600 text-white rounded-2xl border-0 shadow-soft hover:shadow-hover transition-all duration-300">
            <CardContent className="p-8">
              <h3 className="font-heading font-semibold text-2xl mb-3">Get Personalized Recommendations</h3>
              <p className="font-sans text-primary-50 mb-6">
                View detailed medication, diet, and safety guidelines tailored to your condition.
              </p>
              <Link to={`/recommendations/${diseaseType}`}>
                <Button
                  data-testid="btn-view-recommendations"
                  className="bg-white text-primary-600 hover:bg-secondary-50 rounded-full px-6 py-3 font-medium"
                >
                  <span>View Recommendations</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-secondary-100 rounded-2xl border-0 shadow-soft hover:shadow-hover transition-all duration-300">
            <CardContent className="p-8">
              <h3 className="font-heading font-semibold text-2xl text-primary-900 mb-3">Explore Health Resources</h3>
              <p className="font-sans text-slate-700 mb-6">
                Watch expert videos and read articles about managing your health condition.
              </p>
              <Link to="/resources">
                <Button
                  data-testid="btn-view-resources"
                  className="bg-primary-600 text-white hover:bg-primary-700 rounded-full px-6 py-3 font-medium"
                >
                  <span>Browse Resources</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 bg-slate-50 rounded-2xl p-6 border border-slate-200">
          <p className="font-sans text-sm text-slate-600 leading-relaxed">
            <strong>Important:</strong> This screening result is generated by AI and should not be considered a medical diagnosis. 
            Please consult with a qualified healthcare professional for proper evaluation, diagnosis, and treatment. 
            Early detection and professional medical care are crucial for managing health conditions effectively.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Results;