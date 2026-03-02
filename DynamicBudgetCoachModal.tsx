import React, { useState } from 'react';
import { BarChart3, Lightbulb, CheckCircle } from 'lucide-react';

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

interface DynamicBudgetCoachModalProps {
  userProfile?: Profile;
  myBudgets: Record<string, number>;
  setMyBudgets: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  mySmartTips: string[];
  setMySmartTips: React.Dispatch<React.SetStateAction<string[]>>;
}

const defaultCategories = ['Food', 'Rent', 'Transport', 'Shopping', 'Other'];

const questions = [
  { label: 'What is your monthly income?', key: 'income', type: 'number', placeholder: 'e.g. 25000' },
  { label: 'What is your total monthly expenses?', key: 'expenses', type: 'number', placeholder: 'e.g. 18000' },
  { label: 'How much do you want to save monthly?', key: 'save', type: 'number', placeholder: 'e.g. 5000' },
  { label: 'What is your main spending challenge?', key: 'challenge', type: 'select', options: ['Overspending', 'Impulse buys', 'No tracking', 'Low income', 'Other'] },
];

type Answers = {
  income?: string;
  expenses?: string;
  save?: string;
  challenge?: string;
};

const DynamicBudgetCoachModal: React.FC<DynamicBudgetCoachModalProps> = ({ userProfile, myBudgets, setMyBudgets, mySmartTips, setMySmartTips }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [showResult, setShowResult] = useState(false);
  // Mocked real expenses (replace with real data from Expense Manager if available)
  const expenses: Record<string, number> = { Food: 6500, Rent: 9000, Transport: 1200, Shopping: 1800, Other: 500 };

  // AI Tips
  function getAITips() {
    const tips = [];
    const income = Number(answers.income || userProfile?.monthlyIncome?.replace(/[^\d]/g, '') || 0);
    const save = Number(answers.save || 0);
    if (income > 0 && save > 0 && save / income > 0.2) tips.push('Great job! You are saving more than 20% of your income.');
    if (answers.challenge === 'Overspending') tips.push('Try the 50-30-20 rule: 50% needs, 30% wants, 20% savings.');
    if (answers.challenge === 'Impulse buys') tips.push('Wait 24 hours before making non-essential purchases.');
    if (answers.challenge === 'No tracking') tips.push('Log your expenses daily to stay on top of your budget.');
    // Plan recommendations based on real expenses
    const total = Object.values(expenses).reduce((a, b) => a + b, 0);
    if (income > 0 && total > 0) {
      const foodPct = Math.round((expenses.Food / income) * 100);
      const rentPct = Math.round((expenses.Rent / income) * 100);
      const wants = expenses.Shopping + expenses.Other;
      const wantsPct = Math.round((wants / income) * 100);
      if (foodPct > 20) tips.push(`Food is ${foodPct}% of your income. Try to keep it under 15%.`);
      if (rentPct > 35) tips.push(`Rent is ${rentPct}% of your income. Try to keep it under 30%.`);
      if (wantsPct > 30) tips.push(`You're spending ${wantsPct}% on wants. Try to bring it down to 30% or less.`);
      const canSave = income - total;
      if (canSave > 0) tips.push(`If you follow this plan, you can save ₹${canSave} per month.`);
      else tips.push('Your expenses exceed your income. Review your spending to find areas to cut.');
    }
    if (tips.length === 0) tips.push('Review your spending weekly and adjust your budget as needed.');
    return tips;
  }

  // On result, update smart tips
  React.useEffect(() => {
    if (showResult) setMySmartTips(getAITips());
    // eslint-disable-next-line
  }, [showResult, expenses, myBudgets]);

  return (
    <div className="space-y-6">
      {/* My Budgets & Smart Tips */}
      {(Object.keys(myBudgets).length > 0 || mySmartTips.length > 0) && (
        <div className="bg-green-50 rounded-xl p-4">
          {Object.keys(myBudgets).length > 0 && (
            <div className="mb-3">
              <h5 className="font-semibold text-green-800 mb-1">My Budgets</h5>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {defaultCategories.map(cat => (
                  <div key={cat} className="bg-white rounded-lg p-2 border border-green-200">
                    <span className="font-medium text-gray-800">{cat}</span>: ₹{myBudgets[cat] || 0}
                  </div>
                ))}
              </div>
            </div>
          )}
          {mySmartTips.length > 0 && (
            <div>
              <h5 className="font-semibold text-green-800 mb-1">My Smart Tips</h5>
              <ul className="text-green-900 text-sm list-disc list-inside space-y-1">
                {mySmartTips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      {/* Stepper */}
      {!showResult ? (
        <div className="bg-white p-6 rounded-xl shadow-md max-w-md w-full mx-auto">
          <h3 className="text-xl font-bold text-gray-800 mb-2">Budget Coach</h3>
          <label className="block text-gray-700 mb-2">{questions[step].label}</label>
          {questions[step].type === 'select' ? (
            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-blue-200 focus:border-transparent"
              value={answers[questions[step].key] || ''}
              onChange={e => setAnswers(prev => ({ ...prev, [questions[step].key]: e.target.value }))}
            >
              <option value="">Select</option>
              {questions[step].options!.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <input
              type="number"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-blue-200 focus:border-transparent"
              placeholder={questions[step].placeholder}
              value={answers[questions[step].key] || ''}
              onChange={e => setAnswers(prev => ({ ...prev, [questions[step].key]: e.target.value }))}
            />
          )}
          <div className="flex justify-between items-center mt-4">
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setStep(s => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              &larr; Back
            </button>
            <button
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              onClick={() => step < questions.length - 1 ? setStep(s => s + 1) : setShowResult(true)}
              disabled={!answers[questions[step].key]}
            >
              Next
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-md max-w-md w-full mx-auto">
          <BarChart3 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Your Budget Plan</h3>
          <div className="mb-4">
            <h5 className="font-semibold text-gray-800 mb-2">Your Real Expenses (from Expense Manager)</h5>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {defaultCategories.map(cat => (
                <div key={cat} className="bg-white rounded-lg p-2 border border-blue-200">
                  <span className="font-medium text-gray-800">{cat}</span>: ₹{expenses[cat] || 0}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-green-50 rounded-xl p-4 mt-4">
            <div className="flex items-center mb-2">
              <Lightbulb className="w-5 h-5 text-green-600 mr-2" />
              <span className="font-semibold text-green-800">AI Smart Tips</span>
            </div>
            <ul className="text-green-900 text-sm list-disc list-inside space-y-1 text-left">
              {getAITips().map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicBudgetCoachModal; 