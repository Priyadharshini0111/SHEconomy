import React, { useState } from 'react';
import { Store, Lightbulb, CheckCircle, Building, GraduationCap, Globe, BookOpen, Users } from 'lucide-react';

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

interface Resource {
  title: string;
  description: string;
  icon: React.ReactNode;
  tag: string;
  action: string;
  language: string;
  link?: string;
}

interface DynamicBusinessSupportModalProps {
  userProfile?: Profile;
  myBusinessResources: Resource[];
  setMyBusinessResources: React.Dispatch<React.SetStateAction<Resource[]>>;
}

const allResources: Resource[] = [
  {
    title: 'Digital Marketing Training',
    description: 'Learn to promote your business online',
    icon: <BookOpen className="w-8 h-8 text-green-600" />,
    tag: 'Free Course',
    action: 'Enroll',
    language: 'English',
    link: '#'
  },
  {
    title: 'Digital Marketing Training (Hindi)',
    description: 'Learn to promote your business online (Hindi)',
    icon: <BookOpen className="w-8 h-8 text-green-600" />,
    tag: 'Free Course',
    action: 'Enroll',
    language: 'Hindi',
    link: '#'
  },
  {
    title: 'GST Registration Help',
    description: 'Simplified GST registration process',
    icon: <Store className="w-8 h-8 text-blue-600" />,
    tag: 'Assistance Available',
    action: 'Get Help',
    language: 'English',
    link: '#'
  },
  {
    title: 'Business Registration',
    description: 'Get your business legally registered',
    icon: <Building className="w-8 h-8 text-blue-600" />,
    tag: '',
    action: 'Start Process',
    language: 'English',
    link: '#'
  },
  {
    title: 'Skill Development',
    description: 'Learn new business skills',
    icon: <GraduationCap className="w-8 h-8 text-purple-600" />,
    tag: '',
    action: 'Browse Courses',
    language: 'English',
    link: '#'
  },
  {
    title: 'Skill Development (Hindi)',
    description: 'Learn new business skills (Hindi)',
    icon: <GraduationCap className="w-8 h-8 text-purple-600" />,
    tag: '',
    action: 'Browse Courses',
    language: 'Hindi',
    link: '#'
  },
  {
    title: 'Business Mentorship',
    description: 'Connect with experienced entrepreneurs',
    icon: <Users className="w-8 h-8 text-pink-600" />,
    tag: 'Available',
    action: 'Find Mentor',
    language: 'English',
    link: '#'
  }
];

const questions = [
  { label: 'What type of business do you have?', key: 'type', type: 'text', placeholder: 'e.g. Kirana, Tailoring, Services' },
  { label: 'What stage is your business at?', key: 'stage', type: 'select', options: ['Idea', 'Just Started', 'Growing', 'Established'] },
  { label: 'What is your main challenge?', key: 'challenge', type: 'select', options: ['Marketing', 'Registration', 'Finance', 'Skills', 'Other'] },
  { label: 'Preferred language for resources?', key: 'language', type: 'select', options: ['English', 'Hindi'] },
];

type Answers = {
  type?: string;
  stage?: string;
  challenge?: string;
  language?: string;
};

const DynamicBusinessSupportModal: React.FC<DynamicBusinessSupportModalProps> = ({ userProfile, myBusinessResources, setMyBusinessResources }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [showResult, setShowResult] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);

  // AI logic to pick best resources
  let filtered = allResources.filter(r => r.language === (answers.language || userProfile?.language || 'English'));
  if (answers.challenge === 'Marketing') filtered = filtered.filter(r => r.title.toLowerCase().includes('marketing'));
  if (answers.challenge === 'Registration') filtered = filtered.filter(r => r.title.toLowerCase().includes('registration'));
  if (answers.challenge === 'Skills') filtered = filtered.filter(r => r.title.toLowerCase().includes('skill'));
  if (filtered.length === 0) filtered = allResources.filter(r => r.language === (answers.language || userProfile?.language || 'English'));
  filtered = filtered.slice(0, 3);

  // AI Suggestions
  function getAISuggestions() {
    const tips = [];
    if (answers.language === 'Hindi') tips.push('Explore resources in Hindi for easier learning.');
    if (answers.challenge === 'Marketing') tips.push('Start with digital marketing to reach more customers.');
    if (answers.challenge === 'Registration') tips.push('Register your business to access government schemes.');
    if (answers.challenge === 'Skills') tips.push('Take a skill development course to grow your business.');
    if (tips.length === 0) tips.push('Start small, focus on one product/service, and gradually expand. Customer satisfaction is key to growth.');
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

  const handleSave = (res: Resource) => {
    setMyBusinessResources(resources => [...resources, res]);
    setSaved(res.title);
  };

  return (
    <div className="space-y-6">
      {/* My Business Resources */}
      {myBusinessResources.length > 0 && (
        <div className="bg-green-50 rounded-xl p-4">
          <h5 className="font-semibold text-green-800 mb-3">My Business Resources</h5>
          <div className="space-y-2">
            {myBusinessResources.map((res, idx) => (
              <div key={idx} className="bg-white rounded-lg p-3 border border-green-200 flex items-center justify-between">
                <div className="flex items-center">
                  {res.icon}
                  <div className="ml-3">
                    <p className="font-medium text-gray-800">{res.title}</p>
                    <p className="text-gray-600 text-xs">{res.description}</p>
                  </div>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700 border border-green-200">Saved</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Stepper */}
      {!showResult ? (
        <div className="bg-white p-6 rounded-xl shadow-md max-w-md w-full mx-auto">
          <h3 className="text-xl font-bold text-gray-800 mb-2">Business Support Finder</h3>
          <label className="block text-gray-700 mb-2">{questions[step].label}</label>
          {questions[step].type === 'select' ? (
            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-green-200 focus:border-transparent"
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
              type="text"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-green-200 focus:border-transparent"
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
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
              onClick={handleNext}
              disabled={!answers[questions[step].key]}
            >
              Next
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-md max-w-md w-full mx-auto text-center">
          <Store className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Recommended Resources</h3>
          <div className="space-y-3 mb-4">
            {filtered.map((res, idx) => (
              <div key={idx} className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-200 mb-2 flex items-center justify-between">
                <div className="flex items-center">
                  {res.icon}
                  <div className="ml-3 text-left">
                    <p className="font-semibold text-gray-800">{res.title}</p>
                    <p className="text-gray-600 text-sm">{res.description}</p>
                    {res.tag && <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">{res.tag}</span>}
                  </div>
                </div>
                {saved === res.title ? (
                  <div className="flex flex-col items-center">
                    <CheckCircle className="w-6 h-6 text-green-500 mb-1" />
                    <span className="text-green-700 text-xs font-semibold">Saved!</span>
                  </div>
                ) : (
                  <button
                    className="bg-green-500 text-white px-4 py-1 rounded text-xs hover:bg-green-600 mt-2"
                    onClick={() => handleSave(res)}
                  >
                    Save
                  </button>
                )}
              </div>
            ))}
          </div>
          {/* AI Suggestions Section */}
          <div className="bg-green-50 rounded-xl p-4 mb-4">
            <div className="flex items-center mb-2">
              <Lightbulb className="w-5 h-5 text-green-600 mr-2" />
              <span className="font-semibold text-green-800">AI Suggestions</span>
            </div>
            <ul className="text-green-900 text-sm list-disc list-inside space-y-1 text-left">
              {getAISuggestions().map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
          {/* Static Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-blue-50 rounded-xl p-4">
              <Building className="w-8 h-8 text-blue-600 mb-3" />
              <h5 className="font-semibold text-blue-800 mb-2">Business Registration</h5>
              <p className="text-blue-700 text-sm mb-3">Get your business legally registered</p>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                onClick={() => window.open('https://udyamregistration.gov.in/', '_blank')}
              >
                Start Process
              </button>
            </div>
            <div className="bg-purple-50 rounded-xl p-4">
              <GraduationCap className="w-8 h-8 text-purple-600 mb-3" />
              <h5 className="font-semibold text-purple-800 mb-2">Skill Development</h5>
              <p className="text-purple-700 text-sm mb-3">Learn new business skills</p>
              <button
                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
                onClick={() => window.open('https://www.skillindiadigital.gov.in/', '_blank')}
              >
                Browse Courses
              </button>
            </div>
          </div>
          <div className="bg-green-50 rounded-xl p-4 mt-6">
            <div className="flex items-center mb-2">
              <Store className="w-5 h-5 text-green-600 mr-2" />
              <span className="font-semibold text-green-800">Business Tip</span>
            </div>
            <p className="text-green-700 text-sm">
              Start small, focus on one product/service, and gradually expand. Customer satisfaction is key to growth.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicBusinessSupportModal; 