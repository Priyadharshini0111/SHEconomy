import React, { useState } from 'react';
import { FileText, Lightbulb, CheckCircle, Calculator } from 'lucide-react';

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

interface TaxPlanItem {
  option: string;
  amount: string;
  savings: string;
  benefit: string;
  aiWhy: string;
}

interface DynamicTaxAssistantModalProps {
  userProfile?: Profile;
  myTaxPlan: TaxPlanItem[];
  setMyTaxPlan: React.Dispatch<React.SetStateAction<TaxPlanItem[]>>;
}

const taxOptions: TaxPlanItem[] = [
  {
    option: 'PPF',
    amount: '₹50,000',
    savings: '₹15,600',
    benefit: 'Tax-free returns',
    aiWhy: 'Safe, government-backed, and great for long-term savings.'
  },
  {
    option: 'ELSS Mutual Funds',
    amount: '₹50,000',
    savings: '₹15,600',
    benefit: 'Market returns',
    aiWhy: 'Best for higher returns if you can take some risk.'
  },
  {
    option: 'Life Insurance',
    amount: '₹25,000',
    savings: '₹7,800',
    benefit: 'Family protection',
    aiWhy: 'Essential if you have dependents.'
  },
  {
    option: 'NSC',
    amount: '₹25,000',
    savings: '₹7,800',
    benefit: 'Fixed returns',
    aiWhy: 'Good for safe, fixed income.'
  }
];

const questions = [
  { label: 'What is your annual income?', key: 'income', type: 'number', placeholder: 'e.g. 400000' },
  { label: 'How much have you already invested for tax saving?', key: 'invested', type: 'number', placeholder: 'e.g. 20000' },
  { label: 'Do you have dependents?', key: 'dependents', type: 'select', options: ['No', 'Yes, 1', 'Yes, 2+'] },
  { label: 'Which tax-saving options do you already use?', key: 'existing', type: 'select', options: ['None', 'PPF', 'ELSS', 'Insurance', 'NSC', 'Multiple'] },
];

type Answers = {
  income?: string;
  invested?: string;
  dependents?: string;
  existing?: string;
};

const DynamicTaxAssistantModal: React.FC<DynamicTaxAssistantModalProps> = ({ userProfile, myTaxPlan, setMyTaxPlan }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [showResult, setShowResult] = useState(false);
  const [added, setAdded] = useState<string | null>(null);

  // AI logic to pick best options
  const income = Number(answers.income || userProfile?.monthlyIncome?.replace(/[^\d]/g, '') || 0) * 12;
  const invested = Number(answers.invested || 0);
  const remaining = Math.max(0, 150000 - invested);
  let bestOptions = taxOptions;
  if (answers.existing && answers.existing !== 'None') {
    bestOptions = taxOptions.filter(opt => opt.option !== answers.existing);
  }
  if (answers.dependents && answers.dependents !== 'No') {
    bestOptions = [taxOptions[2], ...bestOptions.filter(opt => opt.option !== 'Life Insurance')];
  }
  bestOptions = bestOptions.slice(0, 3);

  // AI Suggestions
  function getAISuggestions() {
    const tips = [];
    if (userProfile && !userProfile.aadhaarUploaded) {
      tips.push('Link your Aadhaar to your PAN for smooth tax filing.');
    }
    if (remaining > 0) {
      tips.push(`You can still invest up to ₹${remaining} under 80C.`);
    }
    if (answers.existing === 'None') {
      tips.push('Start with PPF or ELSS for easy tax savings.');
    }
    if (tips.length === 0) {
      tips.push('Submit proofs early to avoid last-minute rush.');
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

  const handleAdd = (opt: TaxPlanItem) => {
    setMyTaxPlan(plan => [...plan, opt]);
    setAdded(opt.option);
  };

  return (
    <div className="space-y-6">
      {/* My Tax Plan */}
      {myTaxPlan.length > 0 && (
        <div className="bg-yellow-50 rounded-xl p-4">
          <h5 className="font-semibold text-yellow-800 mb-3">My Tax Plan</h5>
          <div className="space-y-2">
            {myTaxPlan.map((item, idx) => (
              <div key={idx} className="bg-white rounded-lg p-3 border border-yellow-200 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-800">{item.option}</p>
                  <p className="text-gray-600 text-xs">Amount: {item.amount} | Savings: {item.savings}</p>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">Added</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Stepper */}
      {!showResult ? (
        <div className="bg-white p-6 rounded-xl shadow-md max-w-md w-full mx-auto">
          <h3 className="text-xl font-bold text-gray-800 mb-2">Tax Saving Planner</h3>
          <label className="block text-gray-700 mb-2">{questions[step].label}</label>
          {questions[step].type === 'select' ? (
            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-yellow-200 focus:border-transparent"
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
              className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-yellow-200 focus:border-transparent"
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
              className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50"
              onClick={handleNext}
              disabled={!answers[questions[step].key]}
            >
              Next
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-md max-w-md w-full mx-auto text-center">
          <FileText className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Best Tax-Saving Options</h3>
          <p className="text-gray-700 mb-2">80C Limit: ₹1,50,000 | Remaining: ₹{remaining}</p>
          <div className="space-y-3 mb-4">
            {bestOptions.map((opt, idx) => (
              <div key={idx} className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200 mb-2">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-800">{opt.option}</p>
                    <p className="text-gray-600 text-sm">{opt.benefit}</p>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">Save {opt.savings}</span>
                </div>
                <div className="mb-2 text-left">
                  <span className="text-gray-500 text-xs">AI Reason:</span>
                  <div className="flex items-center mt-1">
                    <Lightbulb className="w-4 h-4 text-yellow-500 mr-1" />
                    <span className="text-yellow-900 text-xs">{opt.aiWhy}</span>
                  </div>
                </div>
                {added === opt.option ? (
                  <div className="flex flex-col items-center">
                    <CheckCircle className="w-6 h-6 text-green-500 mb-1" />
                    <span className="text-green-700 text-xs font-semibold">Added!</span>
                  </div>
                ) : (
                  <button
                    className="bg-yellow-500 text-white px-4 py-1 rounded text-xs hover:bg-yellow-600 mt-2"
                    onClick={() => handleAdd(opt)}
                  >
                    Add to My Tax Plan
                  </button>
                )}
              </div>
            ))}
          </div>
          {/* AI Suggestions Section */}
          <div className="bg-yellow-50 rounded-xl p-4 mb-4">
            <div className="flex items-center mb-2">
              <Calculator className="w-5 h-5 text-yellow-600 mr-2" />
              <span className="font-semibold text-yellow-800">AI Suggestions</span>
            </div>
            <ul className="text-yellow-900 text-sm list-disc list-inside space-y-1 text-left">
              {getAISuggestions().map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicTaxAssistantModal; 