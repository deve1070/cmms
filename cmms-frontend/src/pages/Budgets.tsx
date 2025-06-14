import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { budgetsApi } from '../services/api';
import { Budget } from '../types/budget';
import { toast } from 'react-hot-toast';
import {
  DollarSign,
  BarChart,
  Plus,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import AddBudgetForm from '../components/AddBudgetForm';

const Budgets: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [showAddForm, setShowAddForm] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchBudgets();
  }, [selectedYear]);

  const fetchBudgets = async () => {
    try {
      const data = await budgetsApi.getAll();
      const filteredData = (data as Budget[]).filter(
        budget => budget.year === Number(selectedYear)
      );
      setBudgets(filteredData);
    } catch (error) {
      toast.error('Failed to fetch budgets');
    } finally {
      setLoading(false);
    }
  };

  const getUtilizationPercentage = (allocated: number, spent: number) => {
    return (spent / allocated) * 100;
  };

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Budget Management</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => fetchBudgets()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Refresh
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Budget
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Add New Budget</h2>
            <AddBudgetForm
              onSuccess={() => {
                setShowAddForm(false);
                fetchBudgets();
              }}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <label htmlFor="year" className="text-sm font-medium text-gray-700">
            Year:
          </label>
          <select
            id="year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="mt-1 block w-32 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            {[2023, 2024, 2025].map((year) => (
              <option key={year} value={year.toString()}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {budgets.map((budget) => {
            const utilization = getUtilizationPercentage(budget.allocated, budget.spent);
            return (
              <li key={budget.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <DollarSign className="h-6 w-6 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-blue-600 truncate">
                          {budget.category}
                        </p>
                        <p className="text-sm text-gray-500">
                          {budget.month} {budget.year}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          ${budget.spent.toLocaleString()} / ${budget.allocated.toLocaleString()}
                        </p>
                        <p className={`text-sm font-medium ${getUtilizationColor(utilization)}`}>
                          {utilization.toFixed(1)}% utilized
                        </p>
                      </div>
                      {utilization >= 90 && (
                        <div className="flex items-center text-sm text-red-600">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Near Limit
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                            Progress
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                        <div
                          style={{ width: `${Math.min(utilization, 100)}%` }}
                          className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                            utilization >= 90 ? 'bg-red-500' : utilization >= 75 ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    <p>Department: {budget.department}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Budgets;