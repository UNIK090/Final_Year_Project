import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Heart, Activity, ArrowRight, Shield, Stethoscope, MessageCircle } from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Predictions',
      description: 'Advanced machine learning models trained on extensive medical datasets',
      color: 'text-primary-600',
    },
    {
      icon: Stethoscope,
      title: 'Multiple Diseases',
      description: 'Diabetes, Heart Disease, and Parkinson\'s detection in one platform',
      color: 'text-accent',
    },
    {
      icon: Shield,
      title: 'Personalized Care',
      description: 'Get tailored medication, diet, and safety recommendations',
      color: 'text-success',
    },
    {
      icon: MessageCircle,
      title: 'Voice-Enabled Bot',
      description: 'Talk to our health assistant using voice or text',
      color: 'text-info',
    },
  ];

  const diseases = [
    {
      name: 'Diabetes',
      icon: Activity,
      description: 'Early detection based on glucose levels, BMI, and blood pressure',
      gradient: 'from-blue-100 to-blue-50',
    },
    {
      name: 'Heart Disease',
      icon: Heart,
      description: 'Cardiovascular risk assessment using key health indicators',
      gradient: 'from-red-100 to-red-50',
    },
    {
      name: 'Parkinson\'s',
      icon: Brain,
      description: 'Neurological condition screening through motor and tremor analysis',
      gradient: 'from-purple-100 to-purple-50',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-pattern py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="space-y-8">
              <div className="inline-block px-4 py-2 bg-secondary-100 rounded-full">
                <p className="font-sans text-sm text-primary-700 font-medium tracking-wider uppercase">Medical AI Technology</p>
              </div>
              <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl text-primary-900 leading-tight" data-testid="hero-title">
                Predict Health Risks,
                <span className="block text-primary-600">Protect Your Future</span>
              </h1>
              <p className="font-sans text-lg text-slate-600 leading-relaxed">
                Advanced machine learning platform for early disease detection. Get personalized health insights, 
                recommendations, and connect with expert resources—all in one place.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/predict"
                  data-testid="cta-predict-now"
                  className="inline-flex items-center space-x-2 bg-primary-600 text-white hover:bg-primary-700 shadow-soft hover:shadow-hover rounded-full px-8 py-4 font-medium transition-all duration-300"
                >
                  <span>Start Prediction</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/health-bot"
                  data-testid="cta-talk-to-bot"
                  className="inline-flex items-center space-x-2 border-2 border-primary-200 text-primary-700 hover:border-primary-600 hover:bg-primary-50 rounded-full px-8 py-4 font-medium transition-all duration-300"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>Talk to Health Bot</span>
                </Link>
              </div>
            </div>

            {/* Image */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-3xl transform rotate-3"></div>
              <img
                src="https://images.unsplash.com/photo-1659353888477-6e6aab941b55?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3MjQyMTd8MHwxfHNlYXJjaHwyfHxtb2Rlcm4lMjBkb2N0b3IlMjBjb25zdWx0YXRpb24lMjBmcmllbmRseXxlbnwwfHx8fDE3NjYyNTIwODF8MA&ixlib=rb-4.1.0&q=85"
                alt="Modern doctor consultation"
                className="relative rounded-3xl shadow-hover object-cover w-full h-[500px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading font-semibold text-3xl md:text-4xl text-primary-800 mb-4">Why Choose HealthPredict?</h2>
            <p className="font-sans text-base text-slate-600 max-w-2xl mx-auto">Comprehensive health prediction platform powered by cutting-edge AI technology</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-secondary-50/50 rounded-3xl p-8 border border-transparent hover:border-secondary-200 transition-all duration-300 hover:-translate-y-1">
                  <div className={`inline-flex p-4 rounded-2xl bg-white shadow-soft mb-6 ${feature.color}`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="font-heading font-semibold text-xl text-primary-800 mb-3">{feature.title}</h3>
                  <p className="font-sans text-sm text-slate-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Diseases Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading font-semibold text-3xl md:text-4xl text-primary-800 mb-4">Diseases We Detect</h2>
            <p className="font-sans text-base text-slate-600 max-w-2xl mx-auto">Early detection saves lives. Our AI models screen for multiple chronic conditions</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {diseases.map((disease, index) => {
              const Icon = disease.icon;
              return (
                <div key={index} className={`bg-gradient-to-br ${disease.gradient} rounded-3xl p-8 border border-slate-100 hover:shadow-hover transition-all duration-300`}>
                  <Icon className="h-12 w-12 text-primary-600 mb-6" />
                  <h3 className="font-heading font-semibold text-2xl text-primary-900 mb-3">{disease.name}</h3>
                  <p className="font-sans text-base text-slate-700">{disease.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="font-heading font-bold text-3xl md:text-5xl">Ready to Take Control of Your Health?</h2>
          <p className="font-sans text-lg text-primary-50">Start your health assessment today and get personalized recommendations</p>
          <Link
            to="/predict"
            data-testid="cta-get-started"
            className="inline-flex items-center space-x-2 bg-white text-primary-600 hover:bg-secondary-50 shadow-soft hover:shadow-hover rounded-full px-10 py-4 font-semibold transition-all duration-300"
          >
            <span>Get Started Now</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;