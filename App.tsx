import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, 
  PieChart, 
  Target, 
  CreditCard, 
  Shield, 
  AlertTriangle, 
  FileText, 
  Store,
  Users, 
  MessageCircle, 
  Mic, 
  Award,
  BookOpen,
  Heart,
  X,
  ChevronRight,
  User,
  MapPin,
  Calendar,
  DollarSign,
  Book,
  Globe,
  CheckCircle,
  Upload,
  Eye,
  EyeOff,
  Send,
  Phone,
  Mail,
  Star,
  Clock,
  ArrowRight,
  Plus,
  Minus,
  BarChart3,
  TrendingDown,
  Lightbulb,
  Calculator,
  Building,
  GraduationCap,
  Briefcase
} from 'lucide-react';
import ModalStepper from './ModalStepper';
import DynamicInvestmentPlannerModal from './DynamicInvestmentPlannerModal';
import DynamicExpenseManagerModal from './DynamicExpenseManagerModal';
import DynamicGoalPlannerModal from './DynamicGoalPlannerModal';
import DynamicMicroCreditModal from './DynamicMicroCreditModal';
import DynamicInsuranceGuideModal from './DynamicInsuranceGuideModal';
import DynamicEmergencyFundModal from './DynamicEmergencyFundModal';
import DynamicTaxAssistantModal from './DynamicTaxAssistantModal';
import DynamicBusinessSupportModal from './DynamicBusinessSupportModal';
import DynamicBudgetCoachModal from './DynamicBudgetCoachModal';
import DynamicSchemeMatchModal from './DynamicSchemeMatchModal';
import { translations, t } from './translations';

interface User {
  name: string;
  email: string;
  isNewUser: boolean;
  profile?: {
    fullName: string;
    location: string;
    ageGroup: string;
    monthlyIncome: string;
    isLiterate: boolean;
    language: string;
    goals: string[];
    aadhaarUploaded: boolean;
    exactMonthlyIncome?: string;
    expenses?: string[];
  };
}

// Goal type for goal planner
interface Goal {
  name: string;
  target: number;
  deadline: string;
  monthlySave: number;
  reminder: boolean;
  progress: number;
  saved: number; // total saved so far
}

// LocalStorage persistence helpers
const EMERGENCY_FUNDS_KEY = 'myEmergencyFunds';
function loadEmergencyFunds() {
  try {
    const data = localStorage.getItem(EMERGENCY_FUNDS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

const SUPPORTED_LANGUAGES = [
  { code: 'ta', label: 'Tamil', speechCode: 'ta-IN' },
  { code: 'en', label: 'English', speechCode: 'en-IN' },
];

// Add Gemini API constants at the top (after imports)
const GEMINI_API_KEY = 'AIzaSyBif5c4kQOeJKpo-aRNQva86h1ldss_ggE';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
const SYSTEM_PROMPT = {
  ta: `நீங்கள் SHEconomy என்ற நிதி டாஷ்போர்டு இணையதளத்திற்கு உதவும் நண்பர். இந்த இணையதளத்தின் நோக்கம், ஒவ்வொரு அம்சமும் எப்படி செயல்படுகிறது, பயனர்கள் எப்படி பயன்படுத்த வேண்டும், மற்றும் நிதி திட்டமிடல், சேமிப்பு, முதலீடு, அரசு உதவிகள் போன்றவற்றை எளிதாக பெற வழிகாட்ட வேண்டும். பயனர் கேள்விகளுக்கு தெளிவாக, படிப்படியாக பதிலளிக்கவும். ஒவ்வொரு பதிலுக்குப் பிறகும், பயனர் கேட்கக்கூடிய அடுத்த சில கேள்விகளை பரிந்துரையாக வழங்கவும். எப்போதும் தமிழில் பதிலளிக்கவும்.`,
  en: `You are a friendly, helpful assistant for a financial dashboard web app called SHEconomy. Your job is to: Greet users and explain the overall purpose of the website. Guide users through each feature, such as Investment Planner, Expense Manager, Goal Planner, Micro Credit, Insurance Guide, Emergency Fund, Tax Assistant, Business Support, Budget Coach, Scheme Match, Chat Assistant, and SHE Room. Explain how each feature works and how it can help the user. Answer questions about how to use the website, what each section does, and offer tips for getting the most out of the app. If the user asks about a specific feature, give a clear, step-by-step explanation of how to use it. After answering, suggest a few next questions the user might want to ask, as clickable options. Always respond in English.`
};
const DEFAULT_SUGGESTIONS = {
  ta: ['முதலீட்டு திட்டம் பற்றி சொல்லுங்கள்', 'செலவு மேலாளர் எப்படி பயன்படுத்துவது?', 'எப்படி சேமிக்கலாம்?'],
  en: ['Tell me about the Investment Planner', 'How to use the Expense Manager?', 'How to save money?']
};

async function getGeminiResponse(userInput, language) {
  const prompt = `${SYSTEM_PROMPT[language] || SYSTEM_PROMPT['en']}
User: ${userInput}`;
  const body = {
    contents: [{ parts: [{ text: prompt }] }]
  };
  try {
    const res = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } catch (e) {
    return language === 'ta' ? 'மன்னிக்கவும், பதில் பெற முடியவில்லை.' : 'Sorry, I could not get a response.';
  }
}

const cardIdToTranslationKey: Record<string, string> = {
  'investment-planner': 'investmentPlanner',
  'expense-manager': 'expenseManager',
  'goal-planner': 'goalPlanner',
  'micro-credit': 'microCredit',
  'insurance-guide': 'insuranceGuide',
  'emergency-fund': 'emergencyFund',
  'tax-assistant': 'taxAssistant',
  'business-support': 'businessSupport',
  'budget-coach': 'budgetCoach',
  'scheme-match': 'schemeMatch',
  'chat-assistant': 'chatAssistant',
  'voice-assistant': 'voiceAssistant',
  'she-room': 'sheRoom',
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'auth' | 'onboarding' | 'dashboard'>('auth');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [user, setUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [voiceListening, setVoiceListening] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', message: 'Hello! I\'m here to help with your financial questions. How can I assist you today?' }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [useVoiceInput, setUseVoiceInput] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSuggestions, setChatSuggestions] = useState<string[]>([]);

  // Onboarding form state
  const [onboardingData, setOnboardingData] = useState({
    fullName: '',
    location: '',
    ageGroup: '',
    monthlyIncome: '',
    isLiterate: true,
    language: 'English',
    goals: [] as string[],
    aadhaarUploaded: false,
    exactMonthlyIncome: '',
    // New fields for 'Tell Us More About You'
    stateDistrict: '',
    incomeFromHome: '', // 'yes' | 'no'
    wantBusiness: '', // 'yes' | 'no'
    wantTutorial: '', // 'yes' | 'no'
    learningMode: '',
    digitalComfort: '',
    dependents: '',
    mainEarner: '', // 'yes' | 'no'
    expenses: [] as string[],
  });

  const [sheRoomResult, setSheRoomResult] = useState<null | { suggestion: string }>(null);
  const [sheRoomStep, setSheRoomStep] = useState<'ai' | 'create' | 'created' | 'explore' | 'request-sent'>('ai');
  const [sheRoomSuggestion, setSheRoomSuggestion] = useState<{ amount: string; members: string; frequency: string } | null>(null);
  const [sheRoomGroupForm, setSheRoomGroupForm] = useState<{ amount: string; members: string; frequency: string }>({ amount: '', members: '', frequency: '' });
  const [sheRoomRequestGroup, setSheRoomRequestGroup] = useState<string | null>(null);
  const existingGroups = [
    { name: 'South Delhi Entrepreneurs', members: 8, contribution: '₹3,000', frequency: 'Monthly' },
    { name: 'Working Women Circle', members: 15, contribution: '₹1,500', frequency: 'Biweekly' },
    { name: 'Moms Savings Club', members: 10, contribution: '₹2,200', frequency: 'Monthly' },
  ];
  const [mySheGroups, setMySheGroups] = useState<{ amount: string; members: string; frequency: string }[]>([]);
  const [requestedGroups, setRequestedGroups] = useState<string[]>([]);

  const [myInvestmentPlans, setMyInvestmentPlans] = useState<{ plan: string }[]>([]);
  const [investmentStep, setInvestmentStep] = useState<'ai' | 'added' | null>(null);
  const [investmentConfirmation, setInvestmentConfirmation] = useState<string | null>(null);

  const [showExactSalaryInput, setShowExactSalaryInput] = useState(false);

  const [myGoals, setMyGoals] = useState<Goal[]>([]);

  const [myMicroCreditApplications, setMyMicroCreditApplications] = useState<any[]>([]);
  const [myInsuranceInterests, setMyInsuranceInterests] = useState<any[]>([]);
  const [myEmergencyFunds, setMyEmergencyFunds] = useState<any[]>(loadEmergencyFunds());
  const latestEmergencyFund = myEmergencyFunds.length > 0 ? myEmergencyFunds[myEmergencyFunds.length - 1] : { target: 0, saved: 0, history: [] };
  const [myTaxPlan, setMyTaxPlan] = useState<any[]>([]);
  const [myBusinessResources, setMyBusinessResources] = useState<any[]>([]);
  const [myBudgets, setMyBudgets] = useState<any>({});
  const [mySmartTips, setMySmartTips] = useState<string[]>([]);
  const [mySchemes, setMySchemes] = useState<any[]>([]);

  // Persist emergency funds to localStorage on change
  React.useEffect(() => {
    localStorage.setItem(EMERGENCY_FUNDS_KEY, JSON.stringify(myEmergencyFunds));
  }, [myEmergencyFunds]);

  const [appLanguage, setAppLanguage] = useState(() => localStorage.getItem('appLanguage') || 'en');
  useEffect(() => { localStorage.setItem('appLanguage', appLanguage); }, [appLanguage]);

  const [featureUsage, setFeatureUsage] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('featureUsage') || '{}');
    } catch {
      return {};
    }
  });

  // Helper to persist language
  useEffect(() => {
    localStorage.setItem('chatLanguage', appLanguage);
  }, [appLanguage]);

  // Helper to persist feature usage
  useEffect(() => {
    localStorage.setItem('featureUsage', JSON.stringify(featureUsage));
  }, [featureUsage]);

  // Helper to mark feature as used
  const markFeatureUsed = (feature: string) => {
    setFeatureUsage((prev: Record<string, boolean>) => ({ ...prev, [feature]: true }));
  };

  // Contextual suggestions based on feature usage
  const getContextualSuggestions = () => {
    const suggestions = [];
    if (featureUsage['goal-planner']) suggestions.push(appLanguage === 'ta' ? 'எmergency fund எப்படி உருவாக்குவது?' : 'How to build an emergency fund?');
    if (featureUsage['micro-credit']) suggestions.push(appLanguage === 'ta' ? 'சிறு கடன் பெற என்ன செய்ய வேண்டும்?' : 'How to get a micro credit loan?');
    if (featureUsage['insurance-guide']) suggestions.push(appLanguage === 'ta' ? 'எந்த காப்பீடு எனக்கு சிறந்தது?' : 'Which insurance is best for me?');
    if (featureUsage['emergency-fund']) suggestions.push(appLanguage === 'ta' ? 'எmergency fund வளர்க்க AI வழிகாட்டுதல்' : 'AI tips to grow my emergency fund');
    if (featureUsage['tax-assistant']) suggestions.push(appLanguage === 'ta' ? 'வரிவிலக்கு பெற என்ன செய்ய வேண்டும்?' : 'How to save more tax?');
    if (featureUsage['business-support']) suggestions.push(appLanguage === 'ta' ? 'என் வணிக வளர்ச்சிக்கு உதவிகள்' : 'Resources for my business growth');
    if (featureUsage['budget-coach']) suggestions.push(appLanguage === 'ta' ? 'எப்படி செலவுகளை கட்டுப்படுத்துவது?' : 'How to control my expenses?');
    if (featureUsage['scheme-match']) suggestions.push(appLanguage === 'ta' ? 'எனக்கு பொருத்தமான அரசு திட்டங்கள்' : 'Schemes I am eligible for');
    if (suggestions.length === 0) {
      suggestions.push(appLanguage === 'ta' ? 'நிதி திட்டமிடுவது எப்படி?' : 'How to plan my finances?');
    }
    return suggestions;
  };

  // Voice input logic
  const recognitionRef = useRef<any>(null);
  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice input not supported in this browser.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = SUPPORTED_LANGUAGES.find(l => l.code === appLanguage)?.speechCode || 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setNewMessage(transcript);
      setTimeout(sendMessage, 100);
    };
    recognition.onerror = (event: any) => {
      alert('Voice input error: ' + event.error);
    };
    recognition.start();
    recognitionRef.current = recognition;
  };

  // Voice output logic
  const [isSpeaking, setIsSpeaking] = useState(false);
  function speakWithState(utter) {
    setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utter);
  }

  // Update sendMessage to extract follow-up questions from AI response
  const sendMessage = async () => {
    if (newMessage.trim()) {
      setChatMessages(prev => [...prev, { sender: 'user', message: newMessage }]);
      setChatLoading(true);
      setChatSuggestions([]);
      try {
        // Compose system prompt
        const systemPrompt =
          appLanguage === 'ta'
            ? `நீங்கள் ஒரு நிதி உதவியாளர். எப்போதும் தமிழில் பதிலளிக்கவும். பயனர் கேள்வி: ${newMessage}`
            : `You are a financial assistant. Always reply in English. User question: ${newMessage}`;
        const res = await fetch(GEMINI_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }],
          }),
        });
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        setChatMessages(prev => [...prev, { sender: 'ai', message: text || (appLanguage === 'ta' ? 'மன்னிக்கவும், பதில் பெற முடியவில்லை.' : 'Sorry, could not get an answer.') }]);
        // Extract question-like suggestions from the answer
        let suggestions: string[] = [];
        const lines = text.split('\n').map((l: string) => l.trim()).filter(Boolean);
        for (let line of lines) {
          // Remove markdown formatting
          line = line.replace(/^[-*\d.]+\s*/, '');
          // Extract questions: ends with '?' or starts with 'How', 'What', 'Why', 'Which', 'Where', 'When', 'Can', 'Should', 'Is', 'Are', 'Will', 'Could', 'Would', 'Do', 'Does'
          if (/\?$/.test(line) || /^(How|What|Why|Which|Where|When|Can|Should|Is|Are|Will|Could|Would|Do|Does)\b/i.test(line)) {
            suggestions.push(line);
          }
          if (suggestions.length >= 3) break;
        }
        // If not enough, fallback to contextual
        if (suggestions.length < 2) suggestions = getContextualSuggestions().slice(0, 3);
        setChatSuggestions(suggestions);
      } catch (e) {
        setChatMessages(prev => [...prev, { sender: 'ai', message: appLanguage === 'ta' ? 'மன்னிக்கவும், பதில் பெற முடியவில்லை.' : 'Sorry, could not get an answer.' }]);
        setChatSuggestions(getContextualSuggestions().slice(0, 3));
      } finally {
        setChatLoading(false);
        setNewMessage('');
      }
    }
  };

  const handleAuth = (email: string, password: string) => {
    // Mock authentication
    const isExistingUser = email === 'user@example.com';
    
    const newUser: User = {
      name: isExistingUser ? 'Priya Sharma' : email.split('@')[0],
      email,
      isNewUser: !isExistingUser,
      profile: isExistingUser ? {
        fullName: 'Priya Sharma',
        location: '110001',
        ageGroup: '25-35',
        monthlyIncome: '₹25,000-50,000',
        isLiterate: true,
        language: 'English',
        goals: ['Save', 'Invest', 'Health Coverage'],
        aadhaarUploaded: true
      } : undefined
    };

    setUser(newUser);
    
    if (newUser.isNewUser) {
      setCurrentView('onboarding');
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleOnboardingSubmit = () => {
    if (user) {
      setUser({
        ...user,
        isNewUser: false,
        profile: onboardingData
      });
    }
    setCurrentView('dashboard');
  };

  const toggleGoal = (goal: string) => {
    setOnboardingData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal) 
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  // Helper to get personalized investment previews
  const getInvestmentPreviews = () => {
    if (myInvestmentPlans.length > 0) {
      return myInvestmentPlans.slice(-2).map(p => p.plan);
    }
    // If no plans, generate AI-based recommendations based on user profile
    if (user?.profile) {
      // Simple logic: recommend SIP and PPF for most users, can be replaced with real AI call
      const income = user.profile.monthlyIncome.replace(/[^\d]/g, '');
      return [
        `SIP: ₹${income ? Math.max(500, Math.floor(Number(income) * 0.1)) : 250}/mo → ₹${income ? Math.max(10000, Math.floor(Number(income) * 5)) : 11000} in 3 yrs`,
        `PPF: ₹${income ? Math.max(500, Math.floor(Number(income) * 0.2)) : 500}/mo for 5 yrs`
      ];
    }
    // Fallback
    return ['SIP: ₹250/mo → ₹11,000 in 3 yrs', 'PPF: ₹500/mo for 5 yrs'];
  };

  // Add a helper for speech recognition
  const startSpeechRecognition = (lang: string, onResult: (text: string) => void) => {
    setAssistantError('');
    if (!('webkitSpeechRecognition' in window)) {
      setAssistantError('Speech recognition not supported in this browser.');
      return;
    }
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };
    recognition.onerror = () => setAssistantError('Sorry, could not recognize your speech. Please try again.');
    recognition.start();
  };

  // Add at the top of App component, after other useState hooks
  const [assistantTextInput, setAssistantTextInput] = useState('');
  const [assistantError, setAssistantError] = useState('');

  // Add state for suggestions
  const [assistantSuggestions, setAssistantSuggestions] = useState(DEFAULT_SUGGESTIONS[appLanguage]);
  const [assistantFirstUse, setAssistantFirstUse] = useState(true);

  const [showTextAssistant, setShowTextAssistant] = useState(false);

  if (currentView === 'auth') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-green-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-200 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-pink-600" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
              SHEconomy
            </h1>
            <p className="text-gray-600 mt-2">Your Voice. Your Wealth. Your World.</p>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleAuth(formData.get('email') as string, formData.get('password') as string);
          }}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent pr-12"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-blue-500 text-white py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-blue-600 transition-all transform hover:scale-105"
              >
                {authMode === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {authMode === 'signin' ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                className="text-pink-600 hover:text-pink-700 font-semibold"
              >
                {authMode === 'signin' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
            <p className="text-xs text-gray-500 mt-4">
              Try: user@example.com for existing user experience
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'onboarding') {
    const progress = Math.min(100, Math.round(
      (Object.values(onboardingData).filter(val => 
        val !== '' && val !== false && (Array.isArray(val) ? val.length > 0 : true)
      ).length / Object.keys(onboardingData).length) * 100
    ));

    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-green-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Tell us about you</h2>
              <p className="text-gray-600">Help us personalize your financial journey</p>
              
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Profile completion</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-pink-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={onboardingData.fullName}
                    onChange={(e) => setOnboardingData(prev => ({ ...prev, fullName: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                  {useVoiceInput && (
                    <button
                      type="button"
                      className="absolute right-3 top-8 text-blue-600 hover:text-blue-800"
                      onClick={() => startSpeechRecognition(appLanguage === 'ta' ? 'ta-IN' : 'en-IN', (text) => setOnboardingData(prev => ({ ...prev, fullName: text })))}
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                  )}
                </div>
                {/* Location (Pincode) */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Location (Pincode)
                  </label>
                  <input
                    type="text"
                    value={onboardingData.location}
                    onChange={(e) => setOnboardingData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Enter pincode"
                  />
                  {useVoiceInput && (
                    <button
                      type="button"
                      className="absolute right-3 top-8 text-blue-600 hover:text-blue-800"
                      onClick={() => startSpeechRecognition(appLanguage === 'ta' ? 'ta-IN' : 'en-IN', (text) => setOnboardingData(prev => ({ ...prev, location: text })))}
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Age Group
                  </label>
                  <select
                    value={onboardingData.ageGroup}
                    onChange={(e) => setOnboardingData(prev => ({ ...prev, ageGroup: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="">Select age group</option>
                    <option value="18-25">18-25 years</option>
                    <option value="25-35">25-35 years</option>
                    <option value="35-45">35-45 years</option>
                    <option value="45-60">45-60 years</option>
                    <option value="60+">60+ years</option>
                  </select>
                  {useVoiceInput && (
                    <button
                      type="button"
                      className="absolute right-3 top-8 text-blue-600 hover:text-blue-800"
                      onClick={() => startSpeechRecognition(appLanguage === 'ta' ? 'ta-IN' : 'en-IN', (text) => setOnboardingData(prev => ({ ...prev, ageGroup: text })))}
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-2" />
                    Monthly Income
                  </label>
                  <select
                    value={onboardingData.monthlyIncome}
                    onChange={(e) => {
                      setOnboardingData(prev => ({ ...prev, monthlyIncome: e.target.value }));
                      setShowExactSalaryInput(true);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="">Select income range</option>
                    <option value="Below ₹10,000">Below ₹10,000</option>
                    <option value="₹10,000-25,000">₹10,000-25,000</option>
                    <option value="₹25,000-50,000">₹25,000-50,000</option>
                    <option value="₹50,000-1,00,000">₹50,000-1,00,000</option>
                    <option value="Above ₹1,00,000">Above ₹1,00,000</option>
                  </select>
                  {useVoiceInput && (
                    <button
                      type="button"
                      className="absolute right-3 top-8 text-blue-600 hover:text-blue-800"
                      onClick={() => startSpeechRecognition(appLanguage === 'ta' ? 'ta-IN' : 'en-IN', (text) => setOnboardingData(prev => ({ ...prev, monthlyIncome: text })))}
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                  )}
                  {showExactSalaryInput && (
                    <input
                      type="number"
                      className="mt-3 w-full px-4 py-3 border border-pink-400 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="Enter your exact monthly salary (e.g. 32000)"
                      value={onboardingData.exactMonthlyIncome || ''}
                      onChange={e => setOnboardingData(prev => ({ ...prev, exactMonthlyIncome: e.target.value }))}
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Literacy Level */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Book className="w-4 h-4 inline mr-2" />
                    Literacy Level
                  </label>
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setOnboardingData(prev => ({ ...prev, isLiterate: true }))}
                      className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all ${
                        onboardingData.isLiterate 
                          ? 'border-pink-500 bg-pink-50 text-pink-700' 
                          : 'border-gray-300 text-gray-700'
                      }`}
                    >
                      Literate
                    </button>
                    <button
                      type="button"
                      onClick={() => setOnboardingData(prev => ({ ...prev, isLiterate: false }))}
                      className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all ${
                        !onboardingData.isLiterate 
                          ? 'border-pink-500 bg-pink-50 text-pink-700' 
                          : 'border-gray-300 text-gray-700'
                      }`}
                    >
                      Non-literate
                    </button>
                  </div>
                  {useVoiceInput && (
                    <button
                      type="button"
                      className="absolute right-3 top-8 text-blue-600 hover:text-blue-800"
                      onClick={() => startSpeechRecognition(appLanguage === 'ta' ? 'ta-IN' : 'en-IN', (text) => setOnboardingData(prev => ({ ...prev, isLiterate: /non/i.test(text) ? false : true })))}
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Preferred Language */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Globe className="w-4 h-4 inline mr-2" />
                    Preferred Language
                  </label>
                  <select
                    value={onboardingData.language}
                    onChange={(e) => setOnboardingData(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="ta">தமிழ்</option>
                    <option value="en">English</option>
                  </select>
                  {useVoiceInput && (
                    <button
                      type="button"
                      className="absolute right-3 top-8 text-blue-600 hover:text-blue-800"
                      onClick={() => startSpeechRecognition(appLanguage === 'ta' ? 'ta-IN' : 'en-IN', (text) => setOnboardingData(prev => ({ ...prev, language: /ta(mil)?/i.test(text) ? 'ta' : 'en' })))}
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Target className="w-4 h-4 inline mr-2" />
                  Financial Goals (Select all that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['Save', 'Invest', 'Get Job', 'Health Coverage', 'Learn Skills'].map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => toggleGoal(goal)}
                      className={`p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                        onboardingData.goals.includes(goal)
                          ? 'border-pink-500 bg-pink-50 text-pink-700'
                          : 'border-gray-300 text-gray-700 hover:border-pink-300'
                      }`}
                    >
                      <CheckCircle className={`w-4 h-4 inline mr-2 ${
                        onboardingData.goals.includes(goal) ? 'text-pink-500' : 'text-gray-400'
                      }`} />
                      {goal}
                    </button>
                  ))}
                </div>
                {useVoiceInput && (
                  <button
                    type="button"
                    className="absolute right-3 top-8 text-blue-600 hover:text-blue-800"
                    onClick={() => startSpeechRecognition(appLanguage === 'ta' ? 'ta-IN' : 'en-IN', (text) => {
                      const goals = ['Save', 'Invest', 'Get Job', 'Health Coverage', 'Learn Skills'];
                      setOnboardingData(prev => ({ ...prev, goals: goals.filter(g => new RegExp(g, 'i').test(text)) }));
                    })}
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Upload className="w-4 h-4 inline mr-2" />
                  Upload Aadhaar (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-pink-400 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Drag and drop your Aadhaar card or click to browse</p>
                  <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
                  <button
                    type="button"
                    onClick={() => setOnboardingData(prev => ({ ...prev, aadhaarUploaded: true }))}
                    className="mt-2 text-pink-600 hover:text-pink-700 font-medium"
                  >
                    Choose File
                  </button>
                  {onboardingData.aadhaarUploaded && (
                    <p className="text-green-600 mt-2 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Document uploaded successfully
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Mic className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-blue-800 font-medium">Voice Input</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUseVoiceInput(!useVoiceInput)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      useVoiceInput ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      useVoiceInput ? 'translate-x-6' : 'translate-x-0.5'
                    }`}></div>
                  </button>
                </div>
                <p className="text-blue-700 text-sm mt-2">
                  Prefer speaking instead? Press mic to answer questions
                </p>
              </div>
            </div>

            <div className="bg-pink-50 rounded-xl p-6 mt-8">
              <h3 className="text-lg font-bold text-pink-700 mb-4">Tell Us More About You</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* State/District */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Which state/district are you from?</label>
                  <select
                    value={onboardingData.stateDistrict}
                    onChange={e => setOnboardingData(prev => ({ ...prev, stateDistrict: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="">Select state/district</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Kolkata">Kolkata</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Other">Other</option>
                  </select>
                  {useVoiceInput && (
                    <button
                      type="button"
                      className="absolute right-3 top-8 text-blue-600 hover:text-blue-800"
                      onClick={() => startSpeechRecognition(appLanguage === 'ta' ? 'ta-IN' : 'en-IN', (text) => setOnboardingData(prev => ({ ...prev, stateDistrict: text })))}
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                  )}
                </div>
                {/* Income from home */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Are you interested in earning income from home?</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input type="radio" name="incomeFromHome" value="yes" checked={onboardingData.incomeFromHome === 'yes'} onChange={() => setOnboardingData(prev => ({ ...prev, incomeFromHome: 'yes' }))} className="mr-2" /> Yes
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="incomeFromHome" value="no" checked={onboardingData.incomeFromHome === 'no'} onChange={() => setOnboardingData(prev => ({ ...prev, incomeFromHome: 'no' }))} className="mr-2" /> No
                    </label>
                  </div>
                  {useVoiceInput && (
                    <button
                      type="button"
                      className="absolute right-3 top-8 text-blue-600 hover:text-blue-800"
                      onClick={() => startSpeechRecognition(appLanguage === 'ta' ? 'ta-IN' : 'en-IN', (text) => setOnboardingData(prev => ({ ...prev, incomeFromHome: /no/i.test(text) ? 'no' : 'yes' })))}
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                  )}
                </div>
                {/* Want business */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Would you like to start or grow a small business?</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input type="radio" name="wantBusiness" value="yes" checked={onboardingData.wantBusiness === 'yes'} onChange={() => setOnboardingData(prev => ({ ...prev, wantBusiness: 'yes' }))} className="mr-2" /> Yes
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="wantBusiness" value="no" checked={onboardingData.wantBusiness === 'no'} onChange={() => setOnboardingData(prev => ({ ...prev, wantBusiness: 'no' }))} className="mr-2" /> No
                    </label>
                  </div>
                  {useVoiceInput && (
                    <button
                      type="button"
                      className="absolute right-3 top-8 text-blue-600 hover:text-blue-800"
                      onClick={() => startSpeechRecognition(appLanguage === 'ta' ? 'ta-IN' : 'en-IN', (text) => setOnboardingData(prev => ({ ...prev, wantBusiness: /no/i.test(text) ? 'no' : 'yes' })))}
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                  )}
                </div>
                {/* Want tutorial */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Would you like a tutorial?</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input type="radio" name="wantTutorial" value="yes" checked={onboardingData.wantTutorial === 'yes'} onChange={() => setOnboardingData(prev => ({ ...prev, wantTutorial: 'yes' }))} className="mr-2" /> Yes
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="wantTutorial" value="no" checked={onboardingData.wantTutorial === 'no'} onChange={() => setOnboardingData(prev => ({ ...prev, wantTutorial: 'no' }))} className="mr-2" /> No
                    </label>
                  </div>
                  {useVoiceInput && (
                    <button
                      type="button"
                      className="absolute right-3 top-8 text-blue-600 hover:text-blue-800"
                      onClick={() => startSpeechRecognition(appLanguage === 'ta' ? 'ta-IN' : 'en-IN', (text) => setOnboardingData(prev => ({ ...prev, wantTutorial: /no/i.test(text) ? 'no' : 'yes' })))}
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                  )}
                </div>
                {/* Preferred learning mode */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred learning mode</label>
                  <select
                    value={onboardingData.learningMode}
                    onChange={e => setOnboardingData(prev => ({ ...prev, learningMode: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="">Select mode</option>
                    <option value="Voice">Voice</option>
                    <option value="Visual">Visual</option>
                    <option value="Text">Text</option>
                  </select>
                  {useVoiceInput && (
                    <button
                      type="button"
                      className="absolute right-3 top-8 text-blue-600 hover:text-blue-800"
                      onClick={() => startSpeechRecognition(appLanguage === 'ta' ? 'ta-IN' : 'en-IN', (text) => setOnboardingData(prev => ({ ...prev, learningMode: text })))}
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                  )}
                </div>
                {/* Digital comfort */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">How comfortable are you with digital apps?</label>
                  <select
                    value={onboardingData.digitalComfort}
                    onChange={e => setOnboardingData(prev => ({ ...prev, digitalComfort: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="">Select comfort level</option>
                    <option value="Not at all">Not at all</option>
                    <option value="Somewhat">Somewhat</option>
                    <option value="Very confident">Very confident</option>
                  </select>
                  {useVoiceInput && (
                    <button
                      type="button"
                      className="absolute right-3 top-8 text-blue-600 hover:text-blue-800"
                      onClick={() => startSpeechRecognition(appLanguage === 'ta' ? 'ta-IN' : 'en-IN', (text) => setOnboardingData(prev => ({ ...prev, digitalComfort: text })))}
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                  )}
                </div>
                {/* Dependents */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Do you support dependents?</label>
                  <input
                    type="number"
                    min="0"
                    value={onboardingData.dependents}
                    onChange={e => setOnboardingData(prev => ({ ...prev, dependents: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Number of dependents"
                  />
                  {useVoiceInput && (
                    <button
                      type="button"
                      className="absolute right-3 top-8 text-blue-600 hover:text-blue-800"
                      onClick={() => startSpeechRecognition(appLanguage === 'ta' ? 'ta-IN' : 'en-IN', (text) => setOnboardingData(prev => ({ ...prev, dependents: text.replace(/\D/g, '') })))}
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                  )}
                </div>
                {/* Main earner */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Are you the main earner of your household?</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input type="radio" name="mainEarner" value="yes" checked={onboardingData.mainEarner === 'yes'} onChange={() => setOnboardingData(prev => ({ ...prev, mainEarner: 'yes' }))} className="mr-2" /> Yes
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="mainEarner" value="no" checked={onboardingData.mainEarner === 'no'} onChange={() => setOnboardingData(prev => ({ ...prev, mainEarner: 'no' }))} className="mr-2" /> No
                    </label>
                  </div>
                  {useVoiceInput && (
                    <button
                      type="button"
                      className="absolute right-3 top-8 text-blue-600 hover:text-blue-800"
                      onClick={() => startSpeechRecognition(appLanguage === 'ta' ? 'ta-IN' : 'en-IN', (text) => setOnboardingData(prev => ({ ...prev, mainEarner: /no/i.test(text) ? 'no' : 'yes' })))}
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-4">
              <button
                onClick={() => setCurrentView('dashboard')}
                type="button"
                className="underline text-gray-500 hover:text-pink-600 font-medium"
              >
                Skip
              </button>
              <button
                onClick={handleOnboardingSubmit}
                disabled={progress < 50}
                className={`px-8 py-3 rounded-xl font-semibold transition-all ${
                  progress >= 50
                    ? 'bg-gradient-to-r from-pink-500 to-blue-500 text-white hover:from-pink-600 hover:to-blue-600 transform hover:scale-105'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Generate My Dashboard
                <ArrowRight className="w-5 h-5 inline ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard view
  const isProfileComplete = user?.profile !== undefined;

  const dashboardCards = [
    {
      id: 'investment-planner',
      title: 'Investment Planner',
      description: 'Smart, low-risk plans for your income & goals',
      icon: TrendingUp,
      background: 'bg-gradient-to-br from-green-100 to-pink-100',
      preview: getInvestmentPreviews(),
      cta: 'View Plans'
    },
    {
      id: 'expense-manager',
      title: 'Expense Manager',
      description: 'Track your spending easily',
      icon: PieChart,
      background: 'bg-pink-100',
      preview: isProfileComplete ? ['Monthly: ₹18,500 spent', 'Savings: ₹6,500 this month'] : ['Track expenses', 'Set budgets'],
      cta: 'View Summary'
    },
    {
      id: 'goal-planner',
      title: t('dashboard.goalPlanner.title', appLanguage as 'en' | 'ta'),
      description: t('dashboard.goalPlanner.description', appLanguage as 'en' | 'ta'),
      icon: Target,
      background: 'bg-blue-100',
      preview: isProfileComplete ? ['Emergency Fund: 60% complete', 'House Down Payment: 25%'] : ['Set financial goals', 'Track progress'],
      cta: t('dashboard.goalPlanner.cta', appLanguage as 'en' | 'ta')
    },
    {
      id: 'micro-credit',
      title: 'Micro Credit',
      description: 'Explore low-interest credit options',
      icon: CreditCard,
      background: 'bg-purple-100',
      preview: isProfileComplete ? ['Available: ₹15,000', 'Interest: 12% p.a.'] : ['Check eligibility', 'Low interest rates'],
      cta: 'Check Options'
    },
    {
      id: 'insurance-guide',
      title: 'Insurance Guide',
      description: 'Get covered with the right plan',
      icon: Shield,
      background: 'bg-indigo-100',
      preview: isProfileComplete ? ['Health: ₹5L coverage', 'Life: ₹10L recommended'] : ['Health insurance', 'Life coverage'],
      cta: 'Get Covered'
    },
    {
      id: 'emergency-fund',
      title: 'Emergency Fund',
      description: 'Prepare for life\'s surprises',
      icon: AlertTriangle,
      background: 'bg-red-100',
      preview: isProfileComplete && myEmergencyFunds.length > 0
        ? myEmergencyFunds.slice(-2).map(fund =>
            `Target: ₹${fund.target}, Saved: ₹${fund.saved} (${Math.min(100, Math.round((fund.saved / fund.target) * 100))}% complete)`
          )
        : ['Build safety net', 'Auto-save setup'],
      cta: 'Start Saving'
    },
    {
      id: 'tax-assistant',
      title: 'Tax Assistant',
      description: 'Understand tax-saving options',
      icon: FileText,
      background: 'bg-yellow-100',
      preview: isProfileComplete ? ['Potential savings: ₹15,600', '80C limit: ₹1.5L'] : ['Save on taxes', 'Simple guidance'],
      cta: 'Save Taxes'
    },
    {
      id: 'business-support',
      title: 'Business Support',
      description: 'Get help growing your small business',
      icon: Store,
      background: 'bg-green-100',
      preview: isProfileComplete ? ['Mudra Loan: Eligible', 'Mentorship available'] : ['Start your business', 'Get funding'],
      cta: 'Get Support'
    },
    {
      id: 'budget-coach',
      title: 'Budget Coach',
      description: 'AI-powered spending insights',
      icon: BarChart3,
      background: 'bg-gradient-to-br from-blue-100 to-green-100',
      preview: isProfileComplete ? ['Monthly Budget: ₹25,000', 'Savings Goal: ₹5,000'] : ['Create budget plan', 'Track expenses'],
      cta: 'View Budget'
    },
    {
      id: 'scheme-match',
      title: 'Scheme Match',
      description: 'Find government schemes for you',
      icon: Award,
      background: 'bg-gradient-to-br from-purple-100 to-pink-100',
      preview: isProfileComplete ? ['3 schemes matched', 'PM Kisan eligible'] : ['Find schemes', 'Check eligibility'],
      cta: 'View Matches'
    },
    {
      id: 'she-room',
      title: 'SHE Room',
      description: 'Join women\'s savings groups',
      icon: Users,
      background: 'bg-gradient-to-br from-pink-100 to-blue-100',
      preview: isProfileComplete ? ['Group: Delhi Women', 'Next payout: 15 days'] : ['Join community', 'Save together'],
      cta: 'Join Room'
    },
    {
      id: 'chat-assistant',
      title: 'Chat Assistant',
      description: 'Get instant financial help',
      icon: MessageCircle,
      background: 'bg-gradient-to-br from-green-100 to-blue-100',
      preview: ['Ask me anything', 'Available 24/7'],
      cta: 'Start Chat'
    },
  ].filter(card => card.id !== 'voice-assistant');

  const renderModal = () => {
    if (!activeModal) return null;

    const modalContent = {
      'investment-planner': (
        <DynamicInvestmentPlannerModal
          userProfile={user?.profile}
          myInvestmentPlans={myInvestmentPlans}
          setMyInvestmentPlans={setMyInvestmentPlans}
          setActiveModal={setActiveModal}
        />
      ),

      'expense-manager': (
        <DynamicExpenseManagerModal
          userProfile={user?.profile}
          appLanguage={appLanguage}
        />
      ),

      'goal-planner': (
        <DynamicGoalPlannerModal
          userProfile={user?.profile ? { ...user.profile, exactMonthlyIncome: onboardingData.exactMonthlyIncome } : undefined}
          myGoals={myGoals}
          setMyGoals={setMyGoals}
        />
      ),

      'micro-credit': (
        <DynamicMicroCreditModal
          userProfile={user?.profile}
          myMicroCreditApplications={myMicroCreditApplications}
          setMyMicroCreditApplications={setMyMicroCreditApplications}
        />
      ),

      'insurance-guide': (
        <DynamicInsuranceGuideModal
          userProfile={user?.profile}
          myInsuranceInterests={myInsuranceInterests}
          setMyInsuranceInterests={setMyInsuranceInterests}
          appLanguage={appLanguage}
        />
      ),

      'emergency-fund': (
        <DynamicEmergencyFundModal
          userProfile={user?.profile}
          myEmergencyFund={latestEmergencyFund}
          setMyEmergencyFund={(fund: any) => setMyEmergencyFunds(funds => [...funds, fund])}
          appLanguage={appLanguage}
        />
      ),

      'tax-assistant': (
        <DynamicTaxAssistantModal
          userProfile={user?.profile}
          myTaxPlan={myTaxPlan}
          setMyTaxPlan={setMyTaxPlan}
          appLanguage={appLanguage}
        />
      ),

      'business-support': (
        <DynamicBusinessSupportModal
          userProfile={user?.profile}
          myBusinessResources={myBusinessResources}
          setMyBusinessResources={setMyBusinessResources}
          appLanguage={appLanguage}
        />
      ),

      'budget-coach': (
        <DynamicBudgetCoachModal
          userProfile={user?.profile}
          myBudgets={myBudgets}
          setMyBudgets={setMyBudgets}
          mySmartTips={mySmartTips}
          setMySmartTips={setMySmartTips}
          appLanguage={appLanguage}
        />
      ),

      'scheme-match': (
        <DynamicSchemeMatchModal
          userProfile={user?.profile}
          mySchemes={mySchemes}
          setMySchemes={setMySchemes}
          appLanguage={appLanguage}
        />
      ),

      'she-room': (
        <div className="space-y-6">
          {/* My Groups Section */}
          {mySheGroups.length > 0 && (
            <div className="bg-pink-50 rounded-xl p-4">
              <h5 className="font-semibold text-pink-800 mb-3">My Groups</h5>
                <div className="space-y-2">
                {mySheGroups.map((group, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-3 border border-pink-200 flex flex-col md:flex-row md:justify-between md:items-center">
                      <div>
                      <p className="font-medium text-gray-800">Group {idx + 1}</p>
                      <p className="text-gray-600 text-sm">{group.members} members • ₹{group.amount}/member • {group.frequency}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
          )}
          {/* Step 1: AI Stepper */}
          {(!sheRoomStep || sheRoomStep === 'ai') && (
            <ModalStepper
              title="Join or Create SHE Room Group"
              cta="Analyze with AI"
              steps={[
                { question: 'How much would each member contribute?', placeholder: 'e.g. 2000', type: 'number' },
                { question: 'How many members in the group?', placeholder: 'e.g. 12', type: 'number' },
                { question: 'How often should payouts happen?', placeholder: 'e.g. Monthly, Biweekly', type: 'text' },
              ]}
              aiPrompt={(answers) => `Suggest a fair payout cycle and schedule for a women's savings group where each member contributes ₹${answers[0]}, there are ${answers[1]} members, and payouts are ${answers[2]}. Give 2-3 options in simple terms.`}
              aiSuggestionsMock={[
                { title: 'Monthly: ₹2,000, 12 members, payout every 30 days' },
                { title: 'Biweekly: ₹1,000, 8 members, payout every 15 days' },
                { title: 'Weekly: ₹500, 6 members, payout every 7 days' },
              ]}
              onComplete={(s) => {
                // Parse suggestion for prefill
                const match = s.title.match(/(\d+[,.]?\d*)/g);
                setSheRoomSuggestion({
                  amount: match?.[0] || '',
                  members: match?.[1] || '',
                  frequency: s.title.toLowerCase().includes('biweek') ? 'Biweekly' : s.title.toLowerCase().includes('week') ? 'Weekly' : 'Monthly',
                });
                setSheRoomGroupForm({
                  amount: match?.[0] || '',
                  members: match?.[1] || '',
                  frequency: s.title.toLowerCase().includes('biweek') ? 'Biweekly' : s.title.toLowerCase().includes('week') ? 'Weekly' : 'Monthly',
                });
                setSheRoomStep('create');
              }}
              appLanguage={appLanguage}
            />
          )}
          {/* Step 2: Create Group Form */}
          {sheRoomStep === 'create' && sheRoomSuggestion && (
            <div className="bg-white p-6 rounded-xl shadow-md max-w-md w-full mx-auto">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Create Your Group</h3>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  setMySheGroups(groups => [...groups, { ...sheRoomGroupForm }]);
                  setSheRoomStep('created');
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount per member</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-pink-200 focus:border-transparent"
                    value={sheRoomGroupForm.amount}
                    onChange={e => setSheRoomGroupForm(f => ({ ...f, amount: e.target.value }))}
                    required
                  />
            </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of members</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-pink-200 focus:border-transparent"
                    value={sheRoomGroupForm.members}
                    onChange={e => setSheRoomGroupForm(f => ({ ...f, members: e.target.value }))}
                    required
                  />
            </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payout frequency</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-pink-200 focus:border-transparent"
                    value={sheRoomGroupForm.frequency}
                    onChange={e => setSheRoomGroupForm(f => ({ ...f, frequency: e.target.value }))}
                    required
                  />
          </div>
                <button type="submit" className="w-full bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600 transition-colors mt-2">Create Group</button>
                <button type="button" className="w-full text-gray-500 hover:text-gray-700 mt-2" onClick={() => setSheRoomStep('ai')}>&larr; Back</button>
              </form>
            </div>
          )}
          {/* Step 3: Group Created Confirmation */}
          {sheRoomStep === 'created' && (
            <div className="bg-white p-6 rounded-xl shadow-md max-w-md w-full mx-auto text-center">
              <Users className="w-12 h-12 text-pink-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Group Created!</h3>
              <p className="text-gray-600 mb-4">Your group has been created with {sheRoomGroupForm.members} members, ₹{sheRoomGroupForm.amount} per member, payout: {sheRoomGroupForm.frequency}.</p>
              <button className="mt-4 bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors" onClick={() => { setSheRoomStep('ai'); setSheRoomSuggestion(null); setActiveModal(null); }}>Done</button>
            </div>
          )}
          {/* Step 4: Explore Existing Groups */}
          <div className="bg-blue-50 rounded-xl p-4">
            <h5 className="font-semibold text-blue-800 mb-3">Available Groups to Join</h5>
            <div className="space-y-2">
              {existingGroups.map((group, index) => {
                const requested = requestedGroups.includes(group.name);
                return (
                <div key={index} className="bg-white rounded-lg p-3 border border-blue-200 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">{group.name}</p>
                      <p className="text-gray-600 text-sm">{group.members} members • {group.contribution}/month • {group.frequency}</p>
                  </div>
                    <button
                      className={`px-3 py-1 rounded-lg text-sm transition-colors ${requested ? 'bg-blue-200 text-blue-700 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                      onClick={() => {
                        if (!requested) setRequestedGroups(r => [...r, group.name]);
                      }}
                      disabled={requested}
                    >
                      {requested ? 'Requested' : 'Request to Join'}
                  </button>
                </div>
                );
              })}
            </div>
          </div>
        </div>
      ),

      'chat-assistant': (
        <div className="space-y-4">
          <div className="text-center">
            <MessageCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Chat Assistant</h3>
            <p className="text-gray-600">{appLanguage === 'ta' ? 'உங்கள் நிதி கேள்விகளுக்கு உடனடி உதவி' : 'Get instant help with your financial questions'}</p>
            <div className="mt-2 flex justify-center gap-2">
              {SUPPORTED_LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  className={`px-3 py-1 rounded-full text-sm border ${appLanguage === lang.code ? 'bg-green-500 text-white border-green-600' : 'bg-white text-gray-700 border-gray-300'} transition-colors`}
                  onClick={() => setAppLanguage(lang.code)}
                >
                  {lang.label}
                </button>
              ))}
          </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 h-96 flex flex-col">
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.sender === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <p className="text-sm">{msg.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs opacity-70">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      {msg.sender === 'ai' && (
                        <button onClick={() => speakWithState(new SpeechSynthesisUtterance(msg.message))} className="ml-2 text-green-600 hover:text-green-800" title="Listen">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 9v3.75m0 0v.008m0-.008a3.75 3.75 0 01-3.75-3.75m7.5 0a3.75 3.75 0 01-3.75 3.75m0 0a3.75 3.75 0 003.75-3.75" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-center items-center mt-4">
                  <span className="text-green-600 animate-pulse">{appLanguage === 'ta' ? 'AI பதில் தருகிறது...' : 'AI is typing...'}</span>
            </div>
              )}
            </div>
            <div className="border-t border-gray-200 p-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder={appLanguage === 'ta' ? 'உங்கள் கேள்வியை உள்ளிடவும்...' : 'Type your question...'}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={chatLoading}
                />
                <button
                  onClick={sendMessage}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  disabled={chatLoading}
                >
                  <Send className="w-5 h-5" />
                </button>
                <button
                  onClick={handleVoiceInput}
                  className="bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors"
                  title={appLanguage === 'ta' ? 'குரல் உள்ளீடு' : 'Voice input'}
                  disabled={chatLoading}
                >
                  <Mic className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {chatSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setNewMessage(suggestion);
                      setTimeout(sendMessage, 100);
                    }}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                    disabled={chatLoading}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ),

      'voice-assistant': (
        <div className="space-y-6">
          <div className="text-center">
            <Mic className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Voice Assistant</h3>
            <p className="text-gray-600">Speak your financial questions in your preferred language</p>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
            <div className="text-center mb-6">
              <button
                onClick={() => setVoiceListening(!voiceListening)}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                  voiceListening 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'bg-purple-500 text-white hover:bg-purple-600'
                }`}
              >
                <Mic className="w-8 h-8" />
              </button>
              <p className="mt-4 text-gray-700">
                {voiceListening ? 'Listening... Speak now' : 'Tap to start speaking'}
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">Try these voice commands:</h4>
              {[
                'How can I apply for a government scheme?',
                'What is SIP investment?',
                'Tell me about emergency funds',
                'How to save money on taxes?',
                'What insurance do I need?'
              ].map((command, index) => (
                <div key={index} className="bg-white rounded-lg p-3 border border-purple-200">
                  <p className="text-gray-700 text-sm">"{command}"</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-xl p-4">
              <Globe className="w-8 h-8 text-blue-600 mb-3" />
              <h5 className="font-semibold text-blue-800 mb-2">Multi-Language</h5>
              <p className="text-blue-700 text-sm">Speak in Hindi, English, or your regional language</p>
            </div>
            
            <div className="bg-green-50 rounded-xl p-4">
              <Clock className="w-8 h-8 text-green-600 mb-3" />
              <h5 className="font-semibold text-green-800 mb-2">24/7 Available</h5>
              <p className="text-green-700 text-sm">Voice assistance available anytime you need</p>
            </div>
          </div>

          <div className="bg-purple-50 rounded-xl p-4">
            <div className="flex items-center mb-2">
              <Mic className="w-5 h-5 text-purple-600 mr-2" />
              <span className="font-semibold text-purple-800">Voice Tip</span>
            </div>
            <p className="text-purple-700 text-sm">
              Speak clearly and pause between questions. The assistant understands natural conversation.
            </p>
          </div>
        </div>
      )
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-2xl">
            <h2 className="text-xl font-bold text-gray-800">
              {dashboardCards.find(card => card.id === activeModal)?.title}
            </h2>
            <button
              onClick={() => setActiveModal(null)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="p-6">
            {modalContent[activeModal as keyof typeof modalContent]}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-blue-500 rounded-full flex items-center justify-center mr-3">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                  SHEconomy
                </h1>
                <p className="text-gray-600 text-sm">Your Voice. Your Wealth. Your World.</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-semibold text-gray-800">Welcome, {user?.name}</p>
                <p className="text-gray-600 text-sm">
                  {isProfileComplete ? 'Profile Complete' : 'Complete your profile'}
                </p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-pink-200 to-blue-200 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-pink-600" />
              </div>
              <button
                onClick={() => { setUser(null); setCurrentView('auth'); }}
                className="ml-2 px-3 py-1 rounded bg-gray-200 hover:bg-pink-200 text-gray-700 font-medium"
              >
                Sign Out
              </button>
              <select value={appLanguage} onChange={e => setAppLanguage(e.target.value)} className="ml-2 px-2 py-1 rounded border border-gray-300">
                <option value="ta">தமிழ்</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isProfileComplete && (
          <div className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-yellow-800 mb-2">Complete Your Profile</h3>
                <p className="text-yellow-700 text-sm">
                  Get personalized recommendations by completing your profile setup.
                </p>
              </div>
              <button
                onClick={() => setCurrentView('onboarding')}
                className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
              >
                Complete Now
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {dashboardCards.map((card) => {
            const IconComponent = card.icon;
            const translationKey = cardIdToTranslationKey[card.id] || card.id;
            return (
              <div
                key={card.id}
                onClick={() => setActiveModal(card.id)}
                className={`${card.background} p-6 rounded-xl shadow-md hover:scale-105 transition-all duration-300 cursor-pointer border border-opacity-20 hover:shadow-lg`}
              >
                <div className="flex items-center justify-between mb-4">
                  <IconComponent className="w-8 h-8 text-gray-700" />
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{t(`dashboard.${translationKey}.title`, appLanguage as 'en' | 'ta')}</h3>
                <p className="text-gray-600 text-sm mb-4">{t(`dashboard.${translationKey}.description`, appLanguage as 'en' | 'ta')}</p>
                <div className="space-y-2 mb-4">
                  {card.preview.map((item, index) => (
                    <p key={index} className="text-xs text-gray-600 bg-white bg-opacity-50 rounded-lg px-3 py-2">
                      {item}
                    </p>
                  ))}
                </div>
                <button className="w-full bg-white bg-opacity-70 text-gray-700 py-2 rounded-lg hover:bg-opacity-90 transition-all font-medium">
                  {t(`dashboard.${translationKey}.cta`, appLanguage as 'en' | 'ta')}
                </button>
              </div>
            );
          })}
        </div>

        {/* Quick Stats */}
        {isProfileComplete && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-800">₹45,000</p>
              <p className="text-gray-600 text-sm">Total Savings</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-800">3</p>
              <p className="text-gray-600 text-sm">Goals Achieved</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-800">5</p>
              <p className="text-gray-600 text-sm">Schemes Applied</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 text-center">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-pink-600" />
              </div>
              <p className="text-2xl font-bold text-gray-800">12</p>
              <p className="text-gray-600 text-sm">Community Members</p>
            </div>
          </div>
        )}
      </main>

      {/* Render Modal */}
      {renderModal()}

      {/* Floating Voice Assistant on Dashboard */}
      {currentView === 'dashboard' && (
        <>
          {/* Floating Voice Assistant Button */}
          <button
            className="fixed bottom-8 right-8 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center focus:outline-none"
            title="Voice Assistant"
            onClick={async () => {
              setShowTextAssistant(true);
              const langCode = appLanguage === 'en' ? 'en-IN' : 'ta-IN';
              setAssistantError('');
              if (assistantFirstUse) {
                setAssistantFirstUse(false);
                const greet = appLanguage === 'ta'
                  ? 'SHEconomy-க்கு வரவேற்கிறோம்! இந்த இணையதளம் உங்கள் நிதி திட்டமிடல், சேமிப்பு மற்றும் வளர்ச்சிக்கு உதவுகிறது. ஒரு சுற்றுப்பயணம் வேண்டுமா அல்லது குறிப்பிட்ட அம்சம் பற்றி கேட்க விரும்புகிறீர்களா?'
                  : 'Welcome to SHEconomy! This website helps you plan, save, and grow your finances. Would you like a tour or have a question about a specific feature?';
                const utter = new window.SpeechSynthesisUtterance(greet);
                utter.lang = langCode;
                speakWithState(utter);
                setChatMessages(msgs => [...msgs, { sender: 'ai', message: greet }]);
                setAssistantSuggestions(DEFAULT_SUGGESTIONS[appLanguage]);
                return;
              }
              startSpeechRecognition(langCode, async (text) => {
                setChatMessages(msgs => [...msgs, { sender: 'user', message: text }]);
                const aiResponse = await getGeminiResponse(text, appLanguage);
                const utter = new window.SpeechSynthesisUtterance(aiResponse);
                utter.lang = langCode;
                speakWithState(utter);
                setChatMessages(msgs => [...msgs, { sender: 'ai', message: aiResponse }]);
                setAssistantSuggestions(DEFAULT_SUGGESTIONS[appLanguage]);
              });
            }}
          >
            <Mic className="w-8 h-8" />
          </button>
          {isSpeaking && (
            <button
              className="fixed bottom-28 right-8 z-50 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg w-12 h-12 flex items-center justify-center focus:outline-none"
              title="Stop Speaking"
              onClick={() => { window.speechSynthesis.cancel(); setIsSpeaking(false); }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
          {/* Minimized Text Assistant Button */}
          {!showTextAssistant && (
            <button
              className="fixed bottom-8 right-28 z-50 bg-white border border-blue-200 rounded-full shadow-lg w-12 h-12 flex items-center justify-center focus:outline-none"
              title="Open Text Assistant"
              onClick={() => setShowTextAssistant(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          )}
          {/* Expanded Text Assistant Card */}
          {showTextAssistant && (
            <div className="fixed bottom-8 right-28 z-50 bg-white rounded-xl shadow-lg p-4 w-72 border border-blue-200 flex flex-col items-stretch">
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold text-blue-700">Text Assistant</div>
                <button onClick={() => setShowTextAssistant(false)} className="text-gray-400 hover:text-blue-600" title="Minimize">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <input
                type="text"
                value={assistantTextInput}
                onChange={e => setAssistantTextInput(e.target.value)}
                placeholder={appLanguage === 'ta' ? 'உங்கள் கேள்வியை உள்ளிடவும்...' : 'Type your question...'}
                className="border border-gray-300 rounded-lg px-3 py-2 mb-2 focus:ring-2 focus:ring-blue-200 focus:border-transparent"
                onKeyDown={async e => {
                  if (e.key === 'Enter' && assistantTextInput.trim()) {
                    const langCode = appLanguage === 'en' ? 'en-IN' : 'ta-IN';
                    setChatMessages(msgs => [...msgs, { sender: 'user', message: assistantTextInput }]);
                    const aiResponse = await getGeminiResponse(assistantTextInput, appLanguage);
                    const utter = new window.SpeechSynthesisUtterance(aiResponse);
                    utter.lang = langCode;
                    speakWithState(utter);
                    setChatMessages(msgs => [...msgs, { sender: 'ai', message: aiResponse }]);
                    setAssistantSuggestions(DEFAULT_SUGGESTIONS[appLanguage]);
                    setAssistantTextInput('');
                  }
                }}
              />
              <button
                className="bg-blue-500 text-white rounded-lg px-4 py-2 font-medium hover:bg-blue-600 transition-colors"
                onClick={async () => {
                  if (assistantTextInput.trim()) {
                    const langCode = appLanguage === 'en' ? 'en-IN' : 'ta-IN';
                    setChatMessages(msgs => [...msgs, { sender: 'user', message: assistantTextInput }]);
                    const aiResponse = await getGeminiResponse(assistantTextInput, appLanguage);
                    const utter = new window.SpeechSynthesisUtterance(aiResponse);
                    utter.lang = langCode;
                    speakWithState(utter);
                    setChatMessages(msgs => [...msgs, { sender: 'ai', message: aiResponse }]);
                    setAssistantSuggestions(DEFAULT_SUGGESTIONS[appLanguage]);
                    setAssistantTextInput('');
                  }
                }}
              >
                {appLanguage === 'ta' ? 'அனுப்பு' : 'Send'}
              </button>
              {assistantError && <div className="text-red-600 text-xs mt-2">{assistantError}</div>}
              {/* Suggestions */}
              <div className="mt-3 flex flex-wrap gap-2">
                {assistantSuggestions.map((s, i) => (
                  <button key={i} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs hover:bg-blue-200" onClick={async () => {
                    const langCode = appLanguage === 'en' ? 'en-IN' : 'ta-IN';
                    setChatMessages(msgs => [...msgs, { sender: 'user', message: s }]);
                    const aiResponse = await getGeminiResponse(s, appLanguage);
                    const utter = new window.SpeechSynthesisUtterance(aiResponse);
                    utter.lang = langCode;
                    speakWithState(utter);
                    setChatMessages(msgs => [...msgs, { sender: 'ai', message: aiResponse }]);
                    // Remove clicked suggestion and add a new one if available
                    setAssistantSuggestions(prev => {
                      const next = prev.filter((_, idx) => idx !== i);
                      // Find a new suggestion not already shown
                      const all = DEFAULT_SUGGESTIONS[appLanguage];
                      const unused = all.filter(q => !next.includes(q) && q !== s);
                      if (unused.length > 0) next.push(unused[0]);
                      return next;
                    });
                  }}>{s}</button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default App;