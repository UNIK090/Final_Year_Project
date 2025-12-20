import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Brain, HeartPulse, MessageCircle, BookOpen, Menu, X } from 'lucide-react';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Activity },
    { path: '/predict', label: 'Predict', icon: Brain },
    { path: '/health-bot', label: 'Health Bot', icon: MessageCircle },
    { path: '/resources', label: 'Resources', icon: BookOpen },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 glass-card shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group" data-testid="nav-logo">
            <HeartPulse className="h-8 w-8 text-primary-600 transition-transform group-hover:scale-110" />
            <span className="font-heading font-bold text-xl text-primary-900">HealthPredict</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                    isActive(item.path)
                      ? 'bg-primary-600 text-white shadow-soft'
                      : 'text-primary-700 hover:bg-primary-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <button
            data-testid="mobile-menu-toggle"
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-primary-700 hover:bg-primary-50 transition-colors"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2" data-testid="mobile-menu">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  data-testid={`mobile-nav-${item.label.toLowerCase().replace(' ', '-')}`}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                    isActive(item.path)
                      ? 'bg-primary-600 text-white'
                      : 'text-primary-700 hover:bg-primary-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;