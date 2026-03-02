import React, { useState } from 'react';
import { AlertTriangle, Lightbulb, CheckCircle } from 'lucide-react';

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

interface FundHistory {
  date: string;
  amount: number;
}

interface EmergencyFund {
  target: number;
  saved: number;
  history: FundHistory[];
}

interface DynamicEmergencyFundModalProps {
  userProfile?: Profile;
  myEmergencyFund: EmergencyFund;
  setMyEmergencyFund: React.Dispatch<React.SetStateAction<EmergencyFund>>;
}

const questions = [
  { label: 'What are your average monthly expenses?', key: 'expenses', type: 'number', placeholder: 'e.g. 15000' },
  { label: 'How much have you already saved for emergencies?', key: 'saved', type: 'number', placeholder: 'e.g. 5000' },
  { label: 'How many dependents do you have?', key: 'dependents', type: 'number', placeholder: 'e.g. 2' },
  { label: 'How many months of expenses do you want to cover?', key: 'months', type: 'number', placeholder: 'e.g. 6' },
];

type Answers = {
  expenses?: string;
  saved?: string;
  dependents?: string;
  months?: string;
};

const DynamicEmergencyFundModal: React.FC<DynamicEmergencyFundModalProps> = ({ userProfile, myEmergencyFund, setMyEmergencyFund }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [showResult, setShowResult] = useState(false);
  const [logAmount, setLogAmount] = useState('');

  // Calculate target and plan
  const expenses = Number(answers.expenses || userProfile?.exactMonthlyIncome || userProfile?.monthlyIncome?.replace(/[^\d]/g, '') || 0);
  const months = Number(answers.months || 6);
  const target = expenses * months;
  const saved = Number(answers.saved || 0);
  const dependents = Number(answers.dependents || 0);
  const percent = target > 0 ? Math.min(100, Math.round(((myEmergencyFund.saved || saved) / target) * 100)) : 0;

  // AI Reason
  function getAIReason() {
    if (dependents > 2) return 'With multiple dependents, a larger emergency fund is recommended.';
    if (months >= 9) return 'A 9+ month fund is very safe and ideal for uncertain times.';
    if (expenses > 30000) return 'High expenses? Prioritize building your fund quickly.';
    return 'A 6-month fund is a good safety net for most families.';
  }

  // AI Suggestions
  function getAISuggestions() {
    const tips = [];
    if (userProfile && !userProfile.aadhaarUploaded) {
      tips.push('Upload your Aadhaar for easier access to government relief in emergencies.');
    }
    if (percent < 50) {
      tips.push('Set up an auto-transfer to your emergency fund every month.');
    }
    if (target > 0 && (myEmergencyFund.saved || saved) < target) {
      tips.push(`Try to save at least ₹${Math.ceil(target / months)} per month to reach your goal.`);
    }
    if (tips.length === 0) {
      tips.push('Keep your emergency fund in a separate, easily accessible account.');
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

  const handleLog = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(logAmount);
    if (!isNaN(amt) && amt > 0) {
      setMyEmergencyFund(fund => ({
        ...fund,
        saved: (fund.saved || 0) + amt,
        history: [...(fund.history || []), { date: new Date().toLocaleDateString(), amount: amt }],
        target: target || fund.target,
      }));
      setLogAmount('');
    }
  };

  // On first result, initialize fund if not set
  React.useEffect(() => {
    if (showResult && (myEmergencyFund.target === 0 || myEmergencyFund.saved === 0)) {
      setMyEmergencyFund({
        target: target,
        saved: saved,
        history: saved > 0 ? [{ date: new Date().toLocaleDateString(), amount: saved }] : [],
      });
    }
    // eslint-disable-next-line
  }, [showResult]);

  return (
    <div className="space-y-6">
      {/* Fund Progress */}
      {showResult && (
        <div className="bg-red-50 rounded-xl p-4">
          <h5 className="font-semibold text-red-800 mb-3">My Emergency Fund</h5>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">₹{myEmergencyFund.saved}</p>
              <p className="text-gray-600 text-sm">Current Amount</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">₹{myEmergencyFund.target}</p>
              <p className="text-gray-600 text-sm">Target Amount</p>
            </div>
          </div>
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Progress</span>
              <span className="font-semibold text-gray-800">{percent}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div className="bg-gradient-to-r from-red-500 to-orange-500 h-4 rounded-full" style={{ width: `${percent}%` }}></div>
            </div>
          </div>
          <form className="flex items-center mt-4 space-x-2" onSubmit={handleLog}>
            <input
              type="number"
              min="1"
              className="border border-red-300 rounded px-2 py-1 text-xs w-24"
              placeholder="Log Savings"
              value={logAmount}
              onChange={e => setLogAmount(e.target.value)}
              required
            />
            <button type="submit" className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600">Add</button>
          </form>
          {myEmergencyFund.history.length > 0 && (
            <div className="mt-4">
              <h6 className="font-semibold text-gray-700 mb-2">Savings History</h6>
              <ul className="text-xs text-gray-700 space-y-1">
                {myEmergencyFund.history.map((h, i) => (
                  <li key={i}>+₹{h.amount} on {h.date}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      {/* Stepper */}
      {!showResult ? (
        <div className="bg-white p-6 rounded-xl shadow-md max-w-md w-full mx-auto">
          <h3 className="text-xl font-bold text-gray-800 mb-2">Emergency Fund Planner</h3>
          <label className="block text-gray-700 mb-2">{questions[step].label}</label>
          <input
            type={questions[step].type}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-red-200 focus:border-transparent"
            placeholder={questions[step].placeholder}
            value={answers[questions[step].key] || ''}
            onChange={e => handleInput(e.target.value)}
          />
          <div className="flex justify-between items-center mt-4">
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={handleBack}
              disabled={step === 0}
            >
              &larr; Back
            </button>
            <button
              className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              onClick={handleNext}
              disabled={!answers[questions[step].key]}
            >
              Next
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-md max-w-md w-full mx-auto text-center">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Your Plan</h3>
          <p className="text-gray-700 mb-2">Target: ₹{target} ({months} months of expenses)</p>
          <div className="bg-red-50 rounded-xl p-4 mb-4">
            <div className="flex items-center mb-2">
              <Lightbulb className="w-5 h-5 text-red-500 mr-2" />
              <span className="font-semibold text-red-800">AI Reason</span>
            </div>
            <p className="text-red-700 text-sm">{getAIReason()}</p>
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
        </div>
      )}
    </div>
  );
};

export default DynamicEmergencyFundModal; 