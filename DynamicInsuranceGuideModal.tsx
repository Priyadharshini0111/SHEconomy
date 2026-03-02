import React, { useState } from 'react';
import { Shield, Lightbulb, CheckCircle } from 'lucide-react';

interface Profile {
  fullName: string;
  location: string;
  ageGroup: string;
  monthlyIncome: string;
  isLiterate: boolean;
  language: string;
  goals: string[];
  aadhaarUploaded: boolean;
}

interface Interest {
  planName: string;
  coverage: string;
  status: string;
}

interface DynamicInsuranceGuideModalProps {
  userProfile?: Profile;
  myInsuranceInterests: Interest[];
  setMyInsuranceInterests: React.Dispatch<React.SetStateAction<Interest[]>>;
}

const insurancePlans = [
  {
    type: 'Health Insurance',
    coverage: '₹5,00,000',
    premium: 8000,
    benefits: ['Cashless treatment', 'Pre & post hospitalization', 'Day care procedures'],
    aiWhy: 'Best for families or individuals without employer health cover.'
  },
  {
    type: 'Life Insurance',
    coverage: '₹10,00,000',
    premium: 12000,
    benefits: ['Financial security for family', 'Tax benefits', 'Maturity benefits'],
    aiWhy: 'Recommended if you have dependents or want long-term savings.'
  },
  {
    type: 'Accidental Insurance',
    coverage: '₹2,00,000',
    premium: 500,
    benefits: ['Accident coverage', 'Disability benefits', 'Very affordable'],
    aiWhy: 'Good for extra protection, especially if you travel or commute often.'
  }
];

const questions = [
  { label: 'What is your age group?', key: 'age', type: 'select', options: ['18-25', '25-35', '35-45', '45-60', '60+'] },
  { label: 'Do you have any dependents?', key: 'dependents', type: 'select', options: ['No', 'Yes, 1', 'Yes, 2+', 'Elderly parents'] },
  { label: 'Do you have any existing health issues?', key: 'health', type: 'select', options: ['No', 'Minor', 'Major'] },
  { label: 'Do you already have insurance?', key: 'existing', type: 'select', options: ['No', 'Health only', 'Life only', 'Both'] },
  { label: 'What is your annual insurance budget?', key: 'budget', type: 'number', placeholder: 'e.g. 10000' },
];

type Answers = {
  age?: string;
  dependents?: string;
  health?: string;
  existing?: string;
  budget?: string;
};

const DynamicInsuranceGuideModal: React.FC<DynamicInsuranceGuideModalProps> = ({ userProfile, myInsuranceInterests, setMyInsuranceInterests }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [showResult, setShowResult] = useState(false);
  const [applied, setApplied] = useState<string | null>(null);

  // AI logic to pick best plan
  const budget = Number(answers.budget || 0);
  let bestPlan = insurancePlans[0];
  if (answers.dependents && answers.dependents !== 'No') {
    bestPlan = insurancePlans[0]; // Health
  } else if (answers.health === 'Major') {
    bestPlan = insurancePlans[0]; // Health
  } else if (answers.existing === 'Health only' || answers.existing === 'Both') {
    bestPlan = insurancePlans[1]; // Life
  } else if (budget > 0 && budget < 2000) {
    bestPlan = insurancePlans[2]; // Accidental
  } else if (answers.age === '60+') {
    bestPlan = insurancePlans[0]; // Health
  } else if (answers.existing === 'Life only') {
    bestPlan = insurancePlans[0];
  }

  // AI Suggestions
  function getAISuggestions() {
    const tips = [];
    if (userProfile && !userProfile.aadhaarUploaded) {
      tips.push('Upload your Aadhaar for faster claim processing.');
    }
    if (answers.dependents && answers.dependents.includes('Elderly')) {
      tips.push('Consider a family floater plan to cover elderly parents.');
    }
    if (answers.health === 'Major') {
      tips.push('Disclose all health issues to avoid claim rejection.');
    }
    if (budget > 0 && budget < bestPlan.premium) {
      tips.push('Increase your budget for better coverage or consider top-up plans.');
    }
    if (tips.length === 0) {
      tips.push('Review your insurance needs yearly as your life situation changes.');
    }
    return tips;
  }

  const handleNext = () => {
    if (step < questions.length - 1) setStep(step + 1);
    else setShowResult(true);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleInput = (val: string) => {
    setAnswers(prev => ({ ...prev, [questions[step].key]: val }));
  };

  const handleApply = () => {
    setMyInsuranceInterests(apps => [
      ...apps,
      { planName: bestPlan.type, coverage: bestPlan.coverage, status: 'Interest Expressed' }
    ]);
    setApplied(bestPlan.type);
  };

  return (
    <div className="space-y-6">
      {/* My Interests */}
      {myInsuranceInterests.length > 0 && (
        <div className="bg-indigo-50 rounded-xl p-4">
          <h5 className="font-semibold text-indigo-800 mb-3">My Insurance Interests</h5>
          <div className="space-y-2">
            {myInsuranceInterests.map((app, idx) => (
              <div key={idx} className="bg-white rounded-lg p-3 border border-indigo-200 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-800">{app.planName}</p>
                  <p className="text-gray-600 text-xs">Coverage: {app.coverage}</p>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">{app.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Stepper */}
      {!showResult ? (
        <div className="bg-white p-6 rounded-xl shadow-md max-w-md w-full mx-auto">
          <h3 className="text-xl font-bold text-gray-800 mb-2">Insurance Recommendation</h3>
          <label className="block text-gray-700 mb-2">{questions[step].label}</label>
          {questions[step].type === 'select' ? (
            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-indigo-200 focus:border-transparent"
              value={answers[questions[step].key] || ''}
              onChange={e => handleInput(e.target.value)}
            >
              <option value="">Select</option>
              {questions[step].options!.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <input
              type="number"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-indigo-200 focus:border-transparent"
              placeholder={questions[step].placeholder}
              value={answers[questions[step].key] || ''}
              onChange={e => handleInput(e.target.value)}
            />
          )}
          <div className="flex justify-between items-center mt-4">
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={handleBack}
              disabled={step === 0}
            >
              &larr; Back
            </button>
            <button
              className="bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50"
              onClick={handleNext}
              disabled={!answers[questions[step].key]}
            >
              Next
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-md max-w-md w-full mx-auto text-center">
          <Shield className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Best Match: {bestPlan.type}</h3>
          <p className="text-gray-700 mb-2">Coverage: {bestPlan.coverage} | Premium: ₹{bestPlan.premium}/year</p>
          <div className="mb-2">
            <span className="text-gray-500 text-sm">Key Benefits:</span>
            <ul className="mt-2 space-y-1">
              {bestPlan.benefits.map((benefit, idx) => (
                <li key={idx} className="text-sm text-gray-700 flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-indigo-50 rounded-xl p-4 mb-4">
            <div className="flex items-center mb-2">
              <Lightbulb className="w-5 h-5 text-indigo-600 mr-2" />
              <span className="font-semibold text-indigo-800">AI Reason</span>
            </div>
            <p className="text-indigo-700 text-sm">{bestPlan.aiWhy}</p>
          </div>
          {/* AI Suggestions Section */}
          <div className="bg-yellow-50 rounded-xl p-4 mb-4">
            <div className="flex items-center mb-2">
              <Lightbulb className="w-5 h-5 text-yellow-500 mr-2" />
              <span className="font-semibold text-yellow-800">AI Suggestions</span>
            </div>
            <ul className="text-yellow-900 text-sm list-disc list-inside space-y-1 text-left">
              {getAISuggestions().map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
          {applied === bestPlan.type ? (
            <div className="flex flex-col items-center">
              <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
              <p className="text-green-700 font-semibold">Interest Expressed!</p>
              <button className="mt-4 text-indigo-600 underline" onClick={() => { setShowResult(false); setStep(0); setAnswers({}); setApplied(null); }}>Get another quote</button>
            </div>
          ) : (
            <button
              className="bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-600 transition-colors mt-2"
              onClick={handleApply}
            >
              Express Interest
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DynamicInsuranceGuideModal; 