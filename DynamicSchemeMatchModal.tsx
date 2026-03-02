import React, { useState } from 'react';
import { Award, Bookmark, CheckCircle, Lightbulb } from 'lucide-react';
import ModalStepper from './ModalStepper';

interface DynamicSchemeMatchModalProps {
  userProfile?: any;
  mySchemes: any[];
  setMySchemes: (schemes: any[]) => void;
}

const allSchemes = [
  {
    name: 'PM Kisan Samman Nidhi',
    type: 'Government',
    benefit: '₹6,000 per year for farmers',
    eligibility: 'Small/marginal farmers',
    description: 'Direct income support for small farmers',
    amount: '₹2,000 every 4 months',
    status: 'Eligible',
    aiWhy: 'You are eligible as a small/marginal farmer with landholding.'
  },
  {
    name: 'Ayushman Bharat',
    type: 'Government',
    benefit: 'Health coverage up to ₹5 lakhs',
    eligibility: 'Low-income families',
    description: 'Free healthcare for eligible families',
    amount: 'Cashless treatment',
    status: 'Apply Now',
    aiWhy: 'You may qualify based on your income and family size.'
  },
  {
    name: 'Pradhan Mantri Suraksha Bima Yojana',
    type: 'Government',
    benefit: 'Accident insurance ₹2 lakhs',
    eligibility: 'All savings account holders',
    description: 'Low-cost accident insurance',
    amount: 'Premium: ₹20/year',
    status: 'Eligible',
    aiWhy: 'Open to all with a savings account.'
  },
  {
    name: 'HDFC Life Sanchay Plus',
    type: 'Private',
    benefit: 'Guaranteed returns, life cover',
    eligibility: '18-60 years',
    description: 'Private guaranteed savings plan',
    amount: 'Premium varies',
    status: 'Apply Now',
    aiWhy: 'Good for those seeking guaranteed returns from a private insurer.'
  },
  {
    name: 'ICICI Prudential Health Saver',
    type: 'Private',
    benefit: 'Health insurance + savings',
    eligibility: '18-65 years',
    description: 'Private health insurance with savings',
    amount: 'Premium varies',
    status: 'Apply Now',
    aiWhy: 'Combines health cover with savings for private sector customers.'
  }
];

const eligibilityQuestions = [
  { label: 'Do you own agricultural land?', key: 'land', type: 'select', options: ['Yes', 'No'] },
  { label: 'What is your monthly household income?', key: 'income', type: 'number', placeholder: 'e.g. 15000' },
  { label: 'How many family members?', key: 'family', type: 'number', placeholder: 'e.g. 4' },
  { label: 'Do you have a savings bank account?', key: 'bank', type: 'select', options: ['Yes', 'No'] },
  { label: 'What is your age?', key: 'age', type: 'number', placeholder: 'e.g. 32' },
];

const preferenceStep = [
  { label: 'Do you prefer government schemes, private schemes, or both?', key: 'preference', type: 'select', options: ['Government', 'Private', 'Both'] }
];

const DynamicSchemeMatchModal: React.FC<DynamicSchemeMatchModalProps> = ({ userProfile, mySchemes, setMySchemes }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const [showResult, setShowResult] = useState(false);
  const [bookmarked, setBookmarked] = useState<string | null>(null);

  // Stepper logic
  const steps = [...preferenceStep, ...eligibilityQuestions];

  const handleNext = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else setShowResult(true);
  };
  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };
  const handleInput = (val: string) => {
    setAnswers((prev: any) => ({ ...prev, [steps[step].key]: val }));
  };

  // Filter schemes based on preference and answers
  const filteredSchemes = allSchemes.filter(scheme => {
    if (answers.preference && answers.preference !== 'Both' && scheme.type !== answers.preference) return false;
    // Simple eligibility logic (mocked)
    if (scheme.name === 'PM Kisan Samman Nidhi' && answers.land !== 'Yes') return false;
    if (scheme.name === 'Ayushman Bharat' && Number(answers.income || 0) > 25000) return false;
    if (scheme.name === 'Pradhan Mantri Suraksha Bima Yojana' && answers.bank !== 'Yes') return false;
    if (scheme.name === 'HDFC Life Sanchay Plus' && (Number(answers.age || 0) < 18 || Number(answers.age || 0) > 60)) return false;
    if (scheme.name === 'ICICI Prudential Health Saver' && (Number(answers.age || 0) < 18 || Number(answers.age || 0) > 65)) return false;
    return true;
  });

  // AI Suggestions (mocked)
  function getAISuggestions() {
    const tips = [];
    if (answers.preference === 'Government') tips.push('Government schemes offer more subsidies and are safer.');
    if (answers.preference === 'Private') tips.push('Private schemes may offer higher returns but check the terms.');
    if (filteredSchemes.length === 0) tips.push('No schemes matched. Try changing your answers or select "Both".');
    if (filteredSchemes.length > 0) tips.push('Apply soon as some schemes have deadlines.');
    return tips;
  }

  const handleBookmark = (scheme: any) => {
    setMySchemes([...mySchemes, scheme]);
    setBookmarked(scheme.name);
  };

  if (!showResult) {
    const q = steps[step];
    return (
      <div className="bg-white p-6 rounded-xl shadow-md max-w-md w-full mx-auto">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center"><Award className="w-6 h-6 text-purple-600 mr-2" />Scheme Match</h3>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">{q.label}</label>
          {q.type === 'select' && Array.isArray((q as any).options) ? (
            <select
              value={answers[q.key] || ''}
              onChange={e => handleInput(e.target.value)}
              className="w-full px-4 py-3 border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select</option>
              {Array.isArray((q as any).options) && (q as any).options.map((opt: string) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <input
              type={q.type}
              value={answers[q.key] || ''}
              onChange={e => handleInput(e.target.value)}
              className="w-full px-4 py-3 border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder={(q as any).placeholder || ''}
            />
          )}
        </div>
        <div className="flex justify-between">
          <button onClick={handleBack} disabled={step === 0} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 font-medium disabled:opacity-50">Back</button>
          <button onClick={handleNext} className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold">{step === steps.length - 1 ? 'Show Matches' : 'Next'}</button>
        </div>
      </div>
    );
  }

  // Show results
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Award className="w-12 h-12 text-purple-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Scheme Match Results</h3>
        <p className="text-gray-600">Schemes matched to your profile and preference</p>
      </div>
      <div className="space-y-4">
        {filteredSchemes.length === 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-700 font-medium">No schemes matched your answers. Try again or select "Both" as preference.</div>
        )}
        {filteredSchemes.map((scheme, index) => (
          <div key={index} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-semibold text-gray-800 flex items-center">{scheme.name} {scheme.type === 'Private' && <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded">Private</span>}</h4>
                <p className="text-gray-600 text-sm">{scheme.description}</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">{scheme.eligibility}</span>
            </div>
            <div className="mb-4">
              <p className="text-purple-600 font-semibold">{scheme.benefit}</p>
              <p className="text-gray-700 text-sm">{scheme.amount}</p>
            </div>
            <div className="flex space-x-2">
              <button className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all">
                {scheme.status === 'Apply Now' ? 'Apply Now' : 'Apply for Scheme'}
              </button>
              <button
                className={`flex items-center px-3 py-2 rounded-lg border ${bookmarked === scheme.name || mySchemes.some(s => s.name === scheme.name) ? 'bg-yellow-100 border-yellow-400 text-yellow-800' : 'bg-white border-gray-300 text-gray-700'}`}
                onClick={() => handleBookmark(scheme)}
                disabled={bookmarked === scheme.name || mySchemes.some(s => s.name === scheme.name)}
              >
                <Bookmark className="w-4 h-4 mr-1" />
                {bookmarked === scheme.name || mySchemes.some(s => s.name === scheme.name) ? 'Bookmarked' : 'Bookmark'}
              </button>
            </div>
            <div className="mt-3 bg-purple-50 rounded-xl p-3 flex items-center">
              <Lightbulb className="w-5 h-5 text-purple-600 mr-2" />
              <span className="text-purple-700 text-sm">AI Reason: {scheme.aiWhy}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-purple-50 rounded-xl p-4">
        <div className="flex items-center mb-2">
          <Award className="w-5 h-5 text-purple-600 mr-2" />
          <span className="font-semibold text-purple-800">AI Suggestions</span>
        </div>
        <ul className="text-purple-700 text-sm list-disc list-inside space-y-1 text-left">
          {getAISuggestions().map((tip, i) => (
            <li key={i}>{tip}</li>
          ))}
        </ul>
      </div>
      {mySchemes.length > 0 && (
        <div className="bg-yellow-50 rounded-xl p-4">
          <div className="flex items-center mb-2">
            <Bookmark className="w-5 h-5 text-yellow-600 mr-2" />
            <span className="font-semibold text-yellow-800">My Schemes</span>
          </div>
          <ul className="text-yellow-900 text-sm list-disc list-inside space-y-1 text-left">
            {mySchemes.map((s, i) => (
              <li key={i} className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-1" />{s.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DynamicSchemeMatchModal; 