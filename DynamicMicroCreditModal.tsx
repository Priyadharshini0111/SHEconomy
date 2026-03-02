import React, { useState } from 'react';
import { CreditCard, Lightbulb, CheckCircle } from 'lucide-react';

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

interface Application {
  loanName: string;
  amount: number;
  status: string;
}

interface DynamicMicroCreditModalProps {
  userProfile?: Profile;
  myMicroCreditApplications: Application[];
  setMyMicroCreditApplications: React.Dispatch<React.SetStateAction<Application[]>>;
}

const loanOptions = [
  {
    name: 'Mudra Loan - Shishu',
    maxAmount: 50000,
    interest: 12,
    tenure: '1-3 years',
    eligibility: 'Small business owners',
    aiWhy: 'Best for new or very small businesses needing a quick start.'
  },
  {
    name: 'SHG Bank Linkage',
    maxAmount: 10000,
    interest: 8,
    tenure: '6-12 months',
    eligibility: 'SHG members',
    aiWhy: 'Great for women in self-help groups looking for low-interest, short-term credit.'
  },
  {
    name: 'Women Entrepreneur Loan',
    maxAmount: 100000,
    interest: 10,
    tenure: '2-5 years',
    eligibility: 'Women entrepreneurs',
    aiWhy: 'Ideal for established women entrepreneurs looking to expand.'
  }
];

const questions = [
  { label: 'How much do you want to borrow?', key: 'amount', type: 'number', placeholder: 'e.g. 20000' },
  { label: 'What is your business type?', key: 'businessType', type: 'text', placeholder: 'e.g. Tailoring, Kirana, Dairy' },
  { label: 'What will you use the loan for?', key: 'purpose', type: 'text', placeholder: 'e.g. Buy stock, expand shop' },
  { label: 'How much can you repay monthly?', key: 'repay', type: 'number', placeholder: 'e.g. 2000' },
];

type Answers = {
  amount?: string;
  businessType?: string;
  purpose?: string;
  repay?: string;
};

const DynamicMicroCreditModal: React.FC<DynamicMicroCreditModalProps> = ({ userProfile, myMicroCreditApplications, setMyMicroCreditApplications }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [showResult, setShowResult] = useState(false);
  const [applied, setApplied] = useState<string | null>(null);

  // Find best match
  const amount = Number(answers.amount || 0);
  const bestLoan = loanOptions.find(l => amount <= l.maxAmount) || loanOptions[loanOptions.length - 1];

  // AI Suggestions logic
  function getAISuggestions() {
    const tips = [];
    if (userProfile && !userProfile.aadhaarUploaded) {
      tips.push('Upload your Aadhaar for faster approval and better eligibility.');
    }
    if (bestLoan.name === 'SHG Bank Linkage' && (!userProfile || !userProfile.goals.includes('Save'))) {
      tips.push('Joining a Self-Help Group (SHG) can unlock lower interest rates and easier access to credit.');
    }
    if (amount > bestLoan.maxAmount * 0.9) {
      tips.push('Consider reducing your loan amount slightly for a higher chance of approval.');
    }
    if (answers.repay && Number(answers.repay) < (amount / 12)) {
      tips.push('A higher monthly repayment can improve your approval chances and reduce interest paid.');
    }
    if (tips.length === 0) {
      tips.push('Maintain a good repayment record to unlock higher loan amounts in the future.');
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
    setMyMicroCreditApplications(apps => [
      ...apps,
      { loanName: bestLoan.name, amount, status: 'Interest Expressed' }
    ]);
    setApplied(bestLoan.name);
  };

  return (
    <div className="space-y-6">
      {/* My Applications */}
      {myMicroCreditApplications.length > 0 && (
        <div className="bg-purple-50 rounded-xl p-4">
          <h5 className="font-semibold text-purple-800 mb-3">My Credit Applications</h5>
          <div className="space-y-2">
            {myMicroCreditApplications.map((app, idx) => (
              <div key={idx} className="bg-white rounded-lg p-3 border border-purple-200 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-800">{app.loanName}</p>
                  <p className="text-gray-600 text-xs">Amount: ₹{app.amount}</p>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-700 border border-purple-200">{app.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Stepper */}
      {!showResult ? (
        <div className="bg-white p-6 rounded-xl shadow-md max-w-md w-full mx-auto">
          <h3 className="text-xl font-bold text-gray-800 mb-2">Micro Credit Eligibility</h3>
          <label className="block text-gray-700 mb-2">{questions[step].label}</label>
          <input
            type={questions[step].type}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-purple-200 focus:border-transparent"
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
              className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
              onClick={handleNext}
              disabled={!answers[questions[step].key]}
            >
              Next
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-md max-w-md w-full mx-auto text-center">
          <CreditCard className="w-12 h-12 text-purple-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Best Match: {bestLoan.name}</h3>
          <p className="text-gray-700 mb-2">Amount: Up to ₹{bestLoan.maxAmount} | Interest: {bestLoan.interest}% p.a. | Tenure: {bestLoan.tenure}</p>
          <p className="text-gray-600 text-sm mb-2">Eligibility: {bestLoan.eligibility}</p>
          <div className="bg-purple-50 rounded-xl p-4 mb-4">
            <div className="flex items-center mb-2">
              <Lightbulb className="w-5 h-5 text-purple-600 mr-2" />
              <span className="font-semibold text-purple-800">AI Reason</span>
            </div>
            <p className="text-purple-700 text-sm">{bestLoan.aiWhy}</p>
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
          {applied === bestLoan.name ? (
            <div className="flex flex-col items-center">
              <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
              <p className="text-green-700 font-semibold">Interest Expressed!</p>
              <button className="mt-4 text-purple-600 underline" onClick={() => { setShowResult(false); setStep(0); setAnswers({}); setApplied(null); }}>Apply for another</button>
            </div>
          ) : (
            <button
              className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors mt-2"
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

export default DynamicMicroCreditModal; 