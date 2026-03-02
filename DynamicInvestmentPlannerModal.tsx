import React, { useState } from 'react';
import ModalStepper from './ModalStepper';
import { TrendingUp } from 'lucide-react';

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

interface DynamicInvestmentPlannerModalProps {
  userProfile?: Profile;
  myInvestmentPlans: { plan: string }[];
  setMyInvestmentPlans: React.Dispatch<React.SetStateAction<{ plan: string }[]>>;
  setActiveModal: (id: string | null) => void;
}

const getDynamicQuestions = (profile?: Profile) => {
  const questions: { question: string; placeholder?: string; type?: 'text' | 'number' }[] = [];
  if (!profile?.monthlyIncome) {
    questions.push({ question: 'What is your monthly income?', placeholder: 'e.g. 25000', type: 'number' });
  }
  if (!profile?.goals?.includes('Invest')) {
    questions.push({ question: 'What is your investment goal?', placeholder: 'e.g. Retirement, House, Education', type: 'text' });
  }
  questions.push({ question: 'How long do you want to invest (years)?', placeholder: 'e.g. 5', type: 'number' });
  questions.push({ question: 'What is your risk preference?', placeholder: 'Low, Medium, High', type: 'text' });
  // New questions
  questions.push({ question: 'What do you want to invest?', placeholder: 'e.g. ₹5000, gold, stocks', type: 'text' });
  questions.push({ question: 'In what way do you want to invest?', placeholder: 'e.g. SIP, lump sum, gold, stocks, PPF', type: 'text' });
  if (profile?.ageGroup && profile.ageGroup.startsWith('45')) {
    questions.push({ question: 'Are you planning for retirement?', placeholder: 'Yes/No', type: 'text' });
  }
  if (profile?.goals?.includes('Tax Saving')) {
    questions.push({ question: 'Do you want tax-saving options like ELSS or PPF?', placeholder: 'Yes/No', type: 'text' });
  }
  return questions;
};

const getPrefilledAnswers = (profile?: Profile) => {
  const answers: string[] = [];
  if (profile?.monthlyIncome) answers.push(profile.monthlyIncome.replace(/[^\d]/g, ''));
  if (profile && profile.goals && profile.goals.includes('Invest')) answers.push('Invest');
  return answers;
};

const aiSuggestionsMock = [
  {
    title: 'SIP: Invest ₹2,000/month for 5 years, expected ₹1.5L, Low risk.',
    details: 'A Systematic Investment Plan (SIP) is ideal for beginners. You invest a fixed amount monthly, which grows with compounding. Low risk and flexible.',
    risk: 'Low',
    duration: 5,
    goal: 'General',
  },
  {
    title: 'PPF: ₹1,500/month for 15 years, tax-free, Very Low risk.',
    details: 'Public Provident Fund (PPF) is a government-backed scheme with tax-free returns. Great for long-term safety and retirement.',
    risk: 'Very Low',
    duration: 15,
    goal: 'Retirement',
  },
  {
    title: 'ELSS: ₹1,000/month for 3 years, tax-saving, Medium risk.',
    details: 'Equity Linked Savings Scheme (ELSS) offers tax benefits under 80C and has higher return potential. Lock-in is 3 years.',
    risk: 'Medium',
    duration: 3,
    goal: 'Tax Saving',
  },
];

function getRelevantPlans(answers: string[]) {
  // Extract new answers
  const investWhat = answers[4]?.toLowerCase() || '';
  const investWay = answers[5]?.toLowerCase() || '';
  // Try to match risk and duration
  let risk = answers.find(a => ['low', 'medium', 'high', 'very low'].includes(a?.toLowerCase?.() || ''));
  let duration = parseInt(answers.find(a => /^\d+$/.test(a)) || '0', 10);
  let goal = answers.find(a => /retire|tax|save|education|house/i.test(a || ''));
  // Build recommendations based on answers
  const recs = [];
  if (investWay.includes('sip') || investWay.includes('mutual')) {
    recs.push({
      title: 'Groww SIP',
      details: 'Invest monthly in mutual funds via Groww. Easy to start, low fees, flexible withdrawal.',
      platform: 'Groww',
      scheme: 'Mutual Funds SIP',
      match: true
    });
  }
  if (investWay.includes('ppf')) {
    recs.push({
      title: 'SBI PPF',
      details: 'Open a Public Provident Fund (PPF) account with SBI. Government-backed, tax-free, safe for long-term.',
      platform: 'SBI',
      scheme: 'PPF',
      match: true
    });
  }
  if (investWay.includes('gold')) {
    recs.push({
      title: 'Paytm Gold',
      details: 'Buy digital gold on Paytm. Start with as little as ₹1, safe and easy to sell anytime.',
      platform: 'Paytm',
      scheme: 'Digital Gold',
      match: true
    });
  }
  if (investWay.includes('stock') || investWay.includes('equity')) {
    recs.push({
      title: 'Zerodha Stocks',
      details: 'Invest directly in stocks via Zerodha. Low brokerage, advanced tools, higher risk/higher reward.',
      platform: 'Zerodha',
      scheme: 'Stocks',
      match: true
    });
  }
  if (investWay.includes('elss') || (goal && goal.toLowerCase().includes('tax'))) {
    recs.push({
      title: 'Axis ELSS',
      details: 'Tax-saving mutual fund (ELSS) from Axis. 3-year lock-in, higher return potential, tax benefit under 80C.',
      platform: 'Axis Mutual Fund',
      scheme: 'ELSS',
      match: true
    });
  }
  // Fallbacks if nothing matches
  if (recs.length === 0) {
    recs.push({
      title: 'Groww SIP',
      details: 'Invest monthly in mutual funds via Groww. Easy to start, low fees, flexible withdrawal.',
      platform: 'Groww',
      scheme: 'Mutual Funds SIP',
      match: false
    });
    recs.push({
      title: 'SBI PPF',
      details: 'Open a Public Provident Fund (PPF) account with SBI. Government-backed, tax-free, safe for long-term.',
      platform: 'SBI',
      scheme: 'PPF',
      match: false
    });
    recs.push({
      title: 'Paytm Gold',
      details: 'Buy digital gold on Paytm. Start with as little as ₹1, safe and easy to sell anytime.',
      platform: 'Paytm',
      scheme: 'Digital Gold',
      match: false
    });
  }
  // Score and sort
  return recs.map((rec, idx) => ({ ...rec, idx, score: rec.match ? 2 : 0 })).sort((a, b) => b.score - a.score);
}

const DynamicInvestmentPlannerModal: React.FC<DynamicInvestmentPlannerModalProps> = ({
  userProfile,
  myInvestmentPlans,
  setMyInvestmentPlans,
  setActiveModal,
}) => {
  const [step, setStep] = useState<'ai' | 'added' | null>('ai');
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState<number | null>(null);
  const [answers, setAnswers] = useState<string[]>(getPrefilledAnswers(userProfile));
  const questions = getDynamicQuestions(userProfile);

  // Inline tips logic (simple example)
  const tips = [
    userProfile?.ageGroup && userProfile.ageGroup.startsWith('18') ? 'Starting early gives you a big advantage!' : '',
    userProfile?.goals?.includes('Tax Saving') ? 'Consider ELSS or PPF for tax benefits.' : '',
    userProfile?.monthlyIncome && parseInt(userProfile.monthlyIncome.replace(/[^\d]/g, '')) < 15000 ? 'Start with small, regular investments.' : '',
  ].filter(Boolean);

  // Get relevant plans in real-time
  const relevantPlans = getRelevantPlans(answers);

  // Handler for stepper input change
  const handleAnswerChange = (idx: number, value: string) => {
    setAnswers(prev => {
      const next = [...prev];
      next[idx] = value;
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* My Investment Plans Section */}
      {myInvestmentPlans.length > 0 && (
        <div className="bg-green-50 rounded-xl p-4">
          <h5 className="font-semibold text-green-800 mb-3">My Investment Plans</h5>
          <div className="space-y-2">
            {myInvestmentPlans.map((plan, idx) => (
              <div key={idx} className="bg-white rounded-lg p-3 border border-green-200 flex flex-col md:flex-row md:justify-between md:items-center">
                <div>
                  <p className="font-medium text-gray-800">Plan {idx + 1}</p>
                  <p className="text-gray-600 text-sm">{plan.plan}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Inline Tips */}
      {tips.length > 0 && (
        <div className="bg-blue-50 rounded-xl p-4">
          <h5 className="font-semibold text-blue-800 mb-2">Personalized Tips</h5>
          <ul className="list-disc pl-5 text-blue-700 text-sm">
            {tips.map((tip, i) => <li key={i}>{tip}</li>)}
          </ul>
        </div>
      )}
      {/* Step 1: AI Stepper */}
      {step === 'ai' && (
        <>
          <ModalStepper
            title="Create Investment Plan"
            cta="Analyze with AI"
            steps={questions}
            aiPrompt={(a) => `Suggest 2-3 personalized investment plans for a woman with profile: ${JSON.stringify(userProfile)}, answers: ${JSON.stringify(a)}. Show plan name, amount, duration, expected returns, and a short tip.`}
            aiSuggestionsMock={relevantPlans.map(s => ({ title: s.title }))}
            onComplete={(s) => {
              const idx = relevantPlans.findIndex(plan => plan.title === s.title);
              setConfirmation(relevantPlans[idx]?.title || 'Plan added!');
              setMyInvestmentPlans(plans => [...plans, { plan: relevantPlans[idx]?.title || 'Plan' }]);
              setStep('added');
            }}
          />
          {/* Real-time Recommendations */}
          <div className="bg-white p-6 rounded-xl shadow-md max-w-md w-full mx-auto mt-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Live Recommendations</h4>
            <ul className="space-y-3">
              {relevantPlans.map((s, idx) => (
                <li key={idx} className={idx === 0 ? 'border-2 border-green-500 rounded-lg p-2 bg-green-50' : ''}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-green-700">{s.title}</span>
                    <button className="text-blue-600 underline ml-2 text-sm" onClick={() => setDetailsOpen(detailsOpen === idx ? null : idx)}>
                      {detailsOpen === idx ? 'Hide Details' : 'View Details'}
                    </button>
                  </div>
                  <div className="text-gray-500 text-xs mt-1">Platform: <span className="font-semibold text-gray-700">{s.platform}</span> &bull; Scheme: <span className="font-semibold text-gray-700">{s.scheme}</span></div>
                  {detailsOpen === idx && (
                    <div className="mt-2 text-gray-700 text-sm bg-green-50 rounded p-3 border border-green-200">{s.details}</div>
                  )}
                  {idx === 0 && <span className="inline-block mt-2 px-2 py-1 bg-green-200 text-green-800 text-xs rounded">Most Relevant</span>}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
      {/* Step 2: Plan Added Confirmation with Details */}
      {step === 'added' && confirmation && (
        <div className="bg-white p-6 rounded-xl shadow-md max-w-md w-full mx-auto text-center">
          <TrendingUp className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Plan Added!</h3>
          <p className="text-gray-600 mb-4">{confirmation}</p>
          <button className="mt-4 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors" onClick={() => { setStep('ai'); setConfirmation(null); }}>Add Another</button>
          <button className="mt-4 ml-2 bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors" onClick={() => setActiveModal(null)}>Done</button>
        </div>
      )}
    </div>
  );
};

export default DynamicInvestmentPlannerModal; 