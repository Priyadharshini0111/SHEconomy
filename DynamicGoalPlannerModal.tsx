import React, { useState } from 'react';
import { Target, Lightbulb } from 'lucide-react';

interface Profile {
  fullName: string;
  location: string;
  ageGroup: string;
  monthlyIncome: string;
  exactMonthlyIncome?: string;
  isLiterate: boolean;
  language: string;
  goals: string[];
  aadhaarUploaded: boolean;
}

interface DynamicGoalPlannerModalProps {
  userProfile?: Profile;
  myGoals: Goal[];
  setMyGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
}

interface Goal {
  name: string;
  target: number;
  deadline: string;
  monthlySave: number;
  reminder: boolean;
  progress: number;
  saved: number; // total saved so far
}

// Add Gemini API call for recommendations
const GEMINI_API_KEY = 'AIzaSyBif5c4kQOeJKpo-aRNQva86h1ldss_ggE';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
async function getGeminiGoalPlan({ salary, expenses, goalName, target, deadline, monthlySave }, language) {
  const prompt = `User Profile:\n- Monthly Income: ₹${salary}\n- Monthly Expenses: ₹${expenses}\n- Financial Goal: ${goalName}\n- Target Amount: ₹${target}\n- Deadline: ${deadline}\n- Planned Monthly Savings: ₹${monthlySave}\n\nPlease provide a step-by-step, practical plan for this user to achieve their goal by the deadline, considering their income and expenses. Respond in ${language === 'ta' ? 'Tamil' : 'English'}.`;
  const body = { contents: [{ parts: [{ text: prompt }] }] };
  try {
    const res = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } catch {
    return language === 'ta' ? 'மன்னிக்கவும், பரிந்துரை பெற முடியவில்லை.' : 'Sorry, could not get a recommendation.';
  }
}

const DynamicGoalPlannerModal: React.FC<DynamicGoalPlannerModalProps> = ({ userProfile, myGoals, setMyGoals }) => {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<Partial<Goal>>({});
  const [aiPlan, setAiPlan] = useState<string | null>(null);
  const [aiTip, setAiTip] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [logIndex, setLogIndex] = useState<number | null>(null);
  const [logAmount, setLogAmount] = useState('');
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState('');

  const questions = [
    {
      label: 'What is your financial goal?',
      placeholder: 'e.g. Emergency Fund, House, Education',
      key: 'name',
      type: 'text',
    },
    {
      label: 'What is your target amount?',
      placeholder: 'e.g. 100000',
      key: 'target',
      type: 'number',
    },
    {
      label: 'By when do you want to achieve this goal?',
      placeholder: 'e.g. 2025-12-31',
      key: 'deadline',
      type: 'date',
    },
    {
      label: 'How much can you save monthly?',
      placeholder: 'e.g. 5000',
      key: 'monthlySave',
      type: 'number',
    },
    {
      label: 'Would you like to set up automatic reminders?',
      placeholder: '',
      key: 'reminder',
      type: 'boolean',
    },
  ];

  const handleNext = async () => {
    if (step < questions.length - 1) setStep(step + 1);
    else {
      // AI-powered plan and tip (Gemini)
      if (goal.target && goal.monthlySave && userProfile) {
        setLoadingRecommendation(true);
        const salary = userProfile.exactMonthlyIncome || userProfile.monthlyIncome;
        const expenses = userProfile.expenses || '';
        const rec = await getGeminiGoalPlan({
          salary,
          expenses,
          goalName: goal.name,
          target: goal.target,
          deadline: goal.deadline,
          monthlySave: goal.monthlySave
        }, userProfile.language);
        setAiRecommendation(rec);
        setLoadingRecommendation(false);
      }
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleInput = (val: string | boolean) => {
    const key = questions[step].key as keyof Goal;
    setGoal(prev => ({ ...prev, [key]: val }));
  };

  const handleAddGoal = () => {
    if (goal.name && goal.target && goal.deadline && goal.monthlySave !== undefined && goal.reminder !== undefined) {
      setMyGoals(goals => [
        ...goals,
        {
          name: goal.name || '',
          target: Number(goal.target),
          deadline: goal.deadline || '',
          monthlySave: Number(goal.monthlySave),
          reminder: Boolean(goal.reminder),
          progress: 0,
          saved: 0,
        },
      ]);
      setGoal({});
      setAiPlan(null);
      setAiTip(null);
      setStep(0);
    }
  };

  return (
    <div className="space-y-6">
      {/* My Goals Section */}
      {myGoals.length > 0 && (
        <div className="bg-green-50 rounded-xl p-4">
          <h5 className="font-semibold text-green-800 mb-3">My Goals</h5>
          <div className="space-y-2">
            {myGoals.map((g, idx) => {
              const percent = Math.min(100, Math.round((g.saved / g.target) * 100));
              return (
                <div key={idx} className="bg-white rounded-lg p-3 border border-green-200 flex flex-col md:flex-row md:justify-between md:items-center">
                  <div>
                    <p className="font-medium text-gray-800">{g.name}</p>
                    <p className="text-gray-600 text-sm">Target: ₹{g.target} by {g.deadline}</p>
                    <p className="text-gray-600 text-xs">Monthly Save: ₹{g.monthlySave} | Reminder: {g.reminder ? 'Yes' : 'No'}</p>
                    <p className="text-green-700 text-xs">Saved: ₹{g.saved} / ₹{g.target}</p>
                    {/* AI Recommendation for this goal */}
                    <div className="mt-2 text-green-700 text-xs flex items-center">
                      <Lightbulb className="w-4 h-4 mr-1 text-green-500" />
                      {getGoalRecommendation(g, userProfile)}
                    </div>
                    <button
                      className="mt-2 text-xs text-green-600 underline hover:text-green-800"
                      onClick={() => { setLogIndex(idx); setLogAmount(''); }}
                    >
                      Log Savings
                    </button>
                    {logIndex === idx && (
                      <form
                        className="flex items-center mt-2 space-x-2"
                        onSubmit={e => {
                          e.preventDefault();
                          const amt = Number(logAmount);
                          if (!isNaN(amt) && amt > 0) {
                            setMyGoals(goals => goals.map((goal, i) => {
                              if (i !== idx) return goal;
                              const newSaved = (goal.saved || 0) + amt;
                              const newProgress = Math.min(100, Math.round((newSaved / goal.target) * 100));
                              return { ...goal, saved: newSaved, progress: newProgress };
                            }));
                            setLogIndex(null);
                            setLogAmount('');
                          }
                        }}
                      >
                        <input
                          type="number"
                          min="1"
                          className="border border-green-300 rounded px-2 py-1 text-xs w-24"
                          placeholder="Amount"
                          value={logAmount}
                          onChange={e => setLogAmount(e.target.value)}
                          required
                        />
                        <button type="submit" className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600">Add</button>
                        <button type="button" className="text-gray-400 ml-1" onClick={() => setLogIndex(null)}>Cancel</button>
                      </form>
                    )}
                  </div>
                  <div className="w-full md:w-40 mt-2 md:mt-0">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${percent}%` }}></div>
                    </div>
                    <span className="text-xs text-gray-500">{percent}% complete</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* Stepper Questions */}
      {step < questions.length && (
        <div className="bg-white p-6 rounded-xl shadow-md max-w-md w-full mx-auto">
          <h3 className="text-xl font-bold text-gray-800 mb-2">Goal Planner</h3>
          <label className="block text-gray-700 mb-2">{questions[step].label}</label>
          {questions[step].type === 'boolean' ? (
            <div className="flex space-x-4">
              <button
                className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all ${goal.reminder === true ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-300 text-gray-700'}`}
                onClick={() => handleInput(true)}
                type="button"
              >
                Yes
              </button>
              <button
                className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all ${goal.reminder === false ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-300 text-gray-700'}`}
                onClick={() => handleInput(false)}
                type="button"
              >
                No
              </button>
            </div>
          ) : (
            <input
              type={questions[step].type}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-green-200 focus:border-transparent"
              placeholder={questions[step].placeholder}
              value={goal[questions[step].key as keyof Goal] || ''}
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
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
              onClick={handleNext}
              disabled={questions[step].type === 'boolean' ? goal.reminder === undefined : !goal[questions[step].key as keyof Goal]}
            >
              Next
            </button>
          </div>
        </div>
      )}
      {/* AI Plan and Tip */}
      {step === questions.length && (
        <div className="bg-white p-6 rounded-xl shadow-md max-w-md w-full mx-auto text-center">
          <Target className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">{userProfile?.language === 'ta' ? 'AI பரிந்துரை' : 'AI Recommendation'}</h3>
          {loadingRecommendation ? (
            <div className="text-green-700 text-sm">{userProfile?.language === 'ta' ? 'AI பரிந்துரை பெறப்படுகிறது...' : 'Getting AI recommendation...'}</div>
          ) : (
            <p className="text-gray-700 mb-4 whitespace-pre-line">{aiRecommendation}</p>
          )}
          <button
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors mt-2"
            onClick={handleAddGoal}
          >
            Add to My Goals
          </button>
        </div>
      )}
    </div>
  );
};

function getGoalRecommendation(goal: Goal, profile?: Profile) {
  // Example AI logic: personalize based on goal and profile
  if (!profile) return 'Set up an auto-transfer to reach your goal faster.';
  const salary = Number(profile.exactMonthlyIncome || profile.monthlyIncome.replace(/[^\d]/g, ''));
  if (goal.name.toLowerCase().includes('emergency')) {
    return `Aim to save at least 3-6 months of expenses. Try to increase your monthly save to ₹${Math.ceil((salary * 3) / 6)} if possible.`;
  }
  if (goal.target > salary * 12) {
    return `Big goal! Consider breaking it into smaller milestones or increasing your monthly save.`;
  }
  if (goal.reminder) {
    return 'Reminders are ON. Stay consistent for best results!';
  }
  return 'Great start! Review your progress monthly and adjust as needed.';
}

export default DynamicGoalPlannerModal; 