import React, { useState } from 'react';
import { PieChart, Lightbulb } from 'lucide-react';

interface Profile {
  fullName: string;
  location: string;
  ageGroup: string;
  monthlyIncome: string;
  isLiterate: boolean;
  language: string;
  goals: string[];
  aadhaarUploaded: boolean;
  exactMonthlyIncome: string;
}

interface DynamicExpenseManagerModalProps {
  userProfile?: Profile;
}

const defaultCategories = [
  'Groceries',
  'Transport',
  'Utilities',
  'Entertainment',
  'Health',
  'Others',
];

const getInitialBudgets = () =>
  defaultCategories.reduce((acc, cat) => {
    acc[cat] = 0;
    return acc;
  }, {} as Record<string, number>);

const getInitialExpenses = () =>
  defaultCategories.reduce((acc, cat) => {
    acc[cat] = 0;
    return acc;
  }, {} as Record<string, number>);

const parseExpenses = (input: string) => {
  // e.g., 'Groceries 500, Bus 40' => { Groceries: 500, Bus: 40 }
  const result: Record<string, number> = {};
  input.split(',').forEach(pair => {
    const [cat, amt] = pair.trim().split(/\s+/);
    if (cat && amt && !isNaN(Number(amt))) {
      result[cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase()] = Number(amt);
    }
  });
  return result;
};

const DynamicExpenseManagerModal: React.FC<DynamicExpenseManagerModalProps> = ({ userProfile }) => {
  const [expenseInput, setExpenseInput] = useState('');
  const [expenses, setExpenses] = useState(getInitialExpenses());
  const [budgets, setBudgets] = useState(getInitialBudgets());
  const [budgetInput, setBudgetInput] = useState<Record<string, string>>({});
  const [tips, setTips] = useState<string[]>([]);
  const [myBudgets, setMyBudgets] = useState<Record<string, number>>({});
  const [mySmartTips, setMySmartTips] = useState<string[]>([]);

  // Use exact salary from onboarding
  const exactSalary = userProfile?.exactMonthlyIncome;
  if (!exactSalary || Number(exactSalary) <= 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md max-w-md w-full mx-auto text-center">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Please complete onboarding and enter your exact monthly salary.</h3>
      </div>
    );
  }

  // Handle logging expenses
  const handleLogExpenses = () => {
    const parsed = parseExpenses(expenseInput);
    setExpenses(prev => {
      const next = { ...prev };
      Object.entries(parsed).forEach(([cat, amt]) => {
        if (next[cat] !== undefined) next[cat] += amt;
        else next['Others'] += amt;
      });
      return next;
    });
    setExpenseInput('');
  };

  // Handle setting budgets
  const handleSetBudgets = () => {
    setBudgets(prev => {
      const next = { ...prev };
      Object.entries(budgetInput).forEach(([cat, amt]) => {
        if (!isNaN(Number(amt))) next[cat] = Number(amt);
      });
      return next;
    });
    setMyBudgets(budgets => ({ ...budgets, ...Object.fromEntries(Object.entries(budgetInput).map(([cat, amt]) => [cat, Number(amt)])) }));
    setBudgetInput({});
  };

  // AI-powered tips (mocked)
  React.useEffect(() => {
    const total = Object.values(expenses).reduce((a, b) => a + b, 0);
    const tipsArr: string[] = [];
    if (expenses['Groceries'] > 0.3 * total) tipsArr.push('You spend over 30% on groceries. Try meal planning to save more!');
    if (expenses['Transport'] > 0.2 * total) tipsArr.push('Transport is a big part of your spending. Consider carpooling or public transport.');
    if (total > 0 && Object.values(budgets).some(b => b > 0)) {
      Object.entries(budgets).forEach(([cat, limit]) => {
        if (limit > 0 && expenses[cat] > 0.9 * limit) tipsArr.push(`You are close to your ${cat} budget!`);
      });
    }
    setTips(tipsArr);
  }, [expenses, budgets]);

  return (
    <div className="space-y-6">
      {/* My Budgets Section */}
      {Object.values(myBudgets).some(v => v > 0) && (
        <div className="bg-pink-50 rounded-xl p-4">
          <h5 className="font-semibold text-pink-800 mb-3">My Budgets</h5>
          <div className="space-y-2">
            {Object.entries(myBudgets).map(([cat, amt]) => amt > 0 && (
              <div key={cat} className="bg-white rounded-lg p-3 border border-pink-200 flex justify-between items-center">
                <span className="font-medium text-gray-800">{cat}</span>
                <span className="text-gray-600 text-sm">₹{amt}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* My Smart Tips Section */}
      {mySmartTips.length > 0 && (
        <div className="bg-blue-50 rounded-xl p-4">
          <h5 className="font-semibold text-blue-800 mb-3">My Smart Tips</h5>
          <ul className="list-disc pl-5 text-blue-700 text-sm">
            {mySmartTips.map((tip, i) => <li key={i}>{tip}</li>)}
          </ul>
        </div>
      )}
      {/* Log Expenses */}
      <div className="bg-white p-6 rounded-xl shadow-md max-w-md w-full mx-auto">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Log Your Expenses</h3>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-pink-200 focus:border-transparent"
          placeholder="e.g. Groceries 500, Bus 40"
          value={expenseInput}
          onChange={e => setExpenseInput(e.target.value)}
        />
        <button
          className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors w-full"
          onClick={handleLogExpenses}
          disabled={!expenseInput.trim()}
        >
          Add Expenses
        </button>
      </div>
      {/* Set Budgets */}
      <div className="bg-white p-6 rounded-xl shadow-md max-w-md w-full mx-auto">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Set Monthly Budgets</h3>
        <div className="space-y-3">
          {defaultCategories.map(cat => (
            <div key={cat} className="flex items-center justify-between">
              <span className="text-gray-700">{cat}</span>
              <input
                type="number"
                className="w-32 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-200 focus:border-transparent"
                placeholder="₹0"
                value={budgetInput[cat] || ''}
                onChange={e => setBudgetInput(input => ({ ...input, [cat]: e.target.value }))}
              />
            </div>
          ))}
        </div>
        <button
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors w-full mt-4"
          onClick={handleSetBudgets}
        >
          Save Budgets
        </button>
      </div>
      {/* Expense Summary & Progress */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6">
        <h4 className="font-semibold text-gray-800 mb-4">This Month's Summary</h4>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-pink-600">₹{Object.values(expenses).reduce((a, b) => a + b, 0)}</p>
            <p className="text-gray-600 text-sm">Total Spent</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">₹{Number(exactSalary) - Object.values(expenses).reduce((a, b) => a + b, 0)}</p>
            <p className="text-gray-600 text-sm">Remaining</p>
          </div>
        </div>
        <div className="space-y-3">
          {defaultCategories.map((cat, index) => {
            const spent = expenses[cat];
            const limit = budgets[cat];
            const percent = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
            const color = percent >= 90 ? 'bg-red-500' : percent >= 70 ? 'bg-yellow-500' : 'bg-pink-500';
            return (
              <div key={cat} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full ${color} mr-3`}></div>
                  <span className="text-gray-700">{cat}</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-gray-800">₹{spent}</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                    <div className={`${color} h-2 rounded-full`} style={{ width: `${percent}%` }}></div>
                  </div>
                  {limit > 0 && <span className="text-xs text-gray-500 ml-2">{percent}% of ₹{limit}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* AI-powered Tips */}
      {tips.length > 0 && (
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="flex items-center mb-2">
            <Lightbulb className="w-5 h-5 text-blue-600 mr-2" />
            <span className="font-semibold text-blue-800">Smart Tips</span>
          </div>
          <ul className="list-disc pl-5 text-blue-700 text-sm mb-2">
            {tips.map((tip, i) => (
              <li key={i} className="flex items-center justify-between">
                <span>{tip}</span>
                <button
                  className="ml-2 text-xs text-pink-600 underline"
                  onClick={() => setMySmartTips(tipsArr => tipsArr.includes(tip) ? tipsArr : [...tipsArr, tip])}
                >
                  Save Tip
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DynamicExpenseManagerModal; 