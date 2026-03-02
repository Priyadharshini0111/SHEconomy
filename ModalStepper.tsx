import React, { useState } from 'react';

interface Step {
  question: string;
  placeholder?: string;
  type?: 'text' | 'number';
}

interface Suggestion {
  title: string;
  description?: string;
}

interface ModalStepperProps {
  steps: Step[];
  aiPrompt: (answers: string[]) => string;
  onComplete: (suggestion: Suggestion) => void;
  aiSuggestionsMock?: Suggestion[]; // fallback if API fails
  title: string;
  cta: string;
}

const GEMINI_API_KEY = 'AIzaSyBif5c4kQOeJKpo-aRNQva86h1ldss_ggE';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + GEMINI_API_KEY;

export const ModalStepper: React.FC<ModalStepperProps> = ({
  steps,
  aiPrompt,
  onComplete,
  aiSuggestionsMock,
  title,
  cta,
}) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(steps.length).fill(''));
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAnswers = [...answers];
    newAnswers[stepIndex] = e.target.value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (answers[stepIndex].trim() === '') return;
    setStepIndex((idx) => idx + 1);
  };

  const handleBack = () => {
    setStepIndex((idx) => Math.max(0, idx - 1));
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setSuggestions(null);
    try {
      const prompt = aiPrompt(answers);
      const res = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });
      const data = await res.json();
      // Parse suggestions from Gemini response (expecting a list in markdown or text)
      let suggestions: Suggestion[] = [];
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      // Try to parse as markdown list or numbered list
      const lines = text.split('\n').filter(Boolean);
      for (let line of lines) {
        line = line.replace(/^[-*\d.]+\s*/, '');
        if (line) suggestions.push({ title: line });
      }
      if (suggestions.length === 0 && aiSuggestionsMock) suggestions = aiSuggestionsMock;
      setSuggestions(suggestions);
    } catch (e) {
      setError('Could not fetch AI suggestions. Showing default.');
      if (aiSuggestionsMock) setSuggestions(aiSuggestionsMock);
    } finally {
      setLoading(false);
    }
  };

  if (suggestions) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md max-w-md w-full mx-auto">
        <h3 className="text-xl font-bold text-gray-800 mb-4">AI Suggestions</h3>
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <ul className="space-y-3 mb-6">
          {suggestions.map((s, i) => (
            <li key={i}>
              <button
                className="w-full text-left bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg px-4 py-3 transition-all"
                onClick={() => onComplete(s)}
              >
                <span className="font-medium text-blue-800">{s.title}</span>
                {s.description && <div className="text-gray-600 text-sm">{s.description}</div>}
              </button>
            </li>
          ))}
        </ul>
        <button className="w-full mt-2 text-gray-500 hover:text-gray-700" onClick={() => setSuggestions(null)}>
          &larr; Back
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md max-w-md w-full mx-auto">
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{steps[stepIndex].question}</p>
      <input
        type={steps[stepIndex].type === 'number' ? 'number' : 'text'}
        className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-blue-200 focus:border-transparent"
        placeholder={steps[stepIndex].placeholder || ''}
        value={answers[stepIndex]}
        onChange={handleInputChange}
        autoFocus
      />
      <div className="flex justify-between items-center">
        <button
          className="text-gray-500 hover:text-gray-700"
          onClick={handleBack}
          disabled={stepIndex === 0}
        >
          &larr; Back
        </button>
        {stepIndex < steps.length - 1 ? (
          <button
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            onClick={handleNext}
            disabled={answers[stepIndex].trim() === ''}
          >
            Next
          </button>
        ) : (
          <button
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
            onClick={handleAnalyze}
            disabled={loading || answers[stepIndex].trim() === ''}
          >
            {loading ? 'Analyzing...' : cta}
          </button>
        )}
      </div>
    </div>
  );
};

export default ModalStepper; 