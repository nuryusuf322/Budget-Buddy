import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { budgetsAPI, categoriesAPI } from '../services/api';
import Message from './Message';
import './Budgets.css';

const Budgets = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showForm, setShowForm] = useState(false);
  const [budgetType, setBudgetType] = useState('category'); // 'category' or 'monthly'
  const [formData, setFormData] = useState({
    category: '',
    monthly_limit: '',
    month_year: new Date().toISOString().slice(0, 7), // YYYY-MM format
  });
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [monthlyBudget, setMonthlyBudget] = useState(null);

  const fetchCategories = useCallback(async () => {
    if (!user) return;

    try {
      const response = await categoriesAPI.getAll({ user_id: user.user_id, type: 'expense' });
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  }, [user]);

  const fetchBudgets = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await budgetsAPI.getAll({ user_id: user.user_id });
      if (response.data.success) {
        // Auto-recalculate all budgets to ensure they're up to date
        const budgets = response.data.data;
        for (const budget of budgets) {
          try {
            await budgetsAPI.recalculate(budget.budget_id);
          } catch (err) {
            // Silently fail for individual recalculations
            console.error(`Failed to recalculate budget ${budget.budget_id}:`, err);
          }
        }
        // Fetch budgets again after recalculation
        const updatedResponse = await budgetsAPI.getAll({ user_id: user.user_id });
        if (updatedResponse.data.success) {
          setBudgets(updatedResponse.data.data);
        }
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to fetch budgets',
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchWarnings = useCallback(async () => {
    if (!user) return;

    try {
      const response = await budgetsAPI.getWarnings({ user_id: user.user_id });
      if (response.data.success) {
        setWarnings(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch warnings:', error);
    }
  }, [user]);

  const fetchMonthlyBudget = useCallback(async () => {
    if (!user) return;

    try {
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      const response = await budgetsAPI.getMonthlyBudget(currentMonth);
      if (response.data.success) {
        setMonthlyBudget(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch monthly budget:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchCategories();
      fetchBudgets();
      fetchWarnings();
      fetchMonthlyBudget();
    }
  }, [user, fetchCategories, fetchBudgets, fetchWarnings, fetchMonthlyBudget]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleBudgetTypeChange = (e) => {
    setBudgetType(e.target.value);
    // Reset form when switching types
    setFormData({
      category: '',
      monthly_limit: '',
      month_year: new Date().toISOString().slice(0, 7),
    });
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage({ type: '', text: '' });

    // Validation
    if (!formData.monthly_limit || !formData.month_year) {
      setErrors({ general: 'Monthly limit and month/year are required' });
      return;
    }

    if (budgetType === 'category' && !formData.category) {
      setErrors({ category: 'Category is required for category budgets' });
      return;
    }

    if (parseFloat(formData.monthly_limit) <= 0) {
      setErrors({ monthly_limit: 'Monthly limit must be greater than 0' });
      return;
    }

    setLoading(true);
    try {
      if (budgetType === 'category') {
        // Create category budget
        const response = await budgetsAPI.create({
          category: formData.category,
          monthly_limit: parseFloat(formData.monthly_limit),
          month_year: formData.month_year,
        });
        if (response.data.success) {
          setMessage({ type: 'success', text: 'Category budget created successfully!' });
          setShowForm(false);
          setFormData({
            category: '',
            monthly_limit: '',
            month_year: new Date().toISOString().slice(0, 7),
          });
          fetchBudgets();
          fetchWarnings();
        }
      } else {
        // Create monthly budget
        const response = await budgetsAPI.createMonthlyBudget({
          monthly_limit: parseFloat(formData.monthly_limit),
          month_year: formData.month_year,
        });
        if (response.data.success) {
          setMessage({ type: 'success', text: 'Monthly budget set successfully!' });
          setShowForm(false);
          setFormData({
            category: '',
            monthly_limit: '',
            month_year: new Date().toISOString().slice(0, 7),
          });
          fetchMonthlyBudget();
          fetchWarnings();
        }
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to create budget',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async (id) => {
    setLoading(true);
    try {
      const response = await budgetsAPI.recalculate(id);
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Budget recalculated successfully!' });
        // Refresh budgets and warnings
        const budgetsResponse = await budgetsAPI.getAll({ user_id: user.user_id });
        if (budgetsResponse.data.success) {
          setBudgets(budgetsResponse.data.data);
        }
        fetchWarnings();
      }
    } catch (error) {
      console.error('Recalculate error:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to recalculate budget. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return;

    try {
      const response = await budgetsAPI.delete(id);
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Budget deleted successfully!' });
        fetchBudgets();
        fetchWarnings();
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to delete budget',
      });
    }
  };

  const getPercentage = (current, limit) => {
    return Math.round((current / limit) * 100);
  };

  const getStatusColor = (percentage) => {
    if (percentage >= 100) return '#e74c3c'; // Red - exceeded
    if (percentage >= 80) return '#f39c12'; // Orange - warning
    return '#27ae60'; // Green - good
  };


  const handleDeleteMonthlyBudget = async () => {
    if (!window.confirm('Are you sure you want to delete the monthly budget for this month?')) return;

    try {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const response = await budgetsAPI.deleteMonthlyBudget(currentMonth);
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Monthly budget deleted successfully!' });
        setMonthlyBudget(null);
        fetchWarnings();
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to delete monthly budget',
      });
    }
  };

  return (
    <div className="budgets-container">
      <div className="budgets-header">
        <h1>Budgets</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Budget'}
        </button>
      </div>

      <Message type={message.type} message={message.text} />

      {/* Unified Budget Form */}
      {showForm && (
        <div className="budget-form-card">
          <h2>Add New Budget</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="budget_type">Budget Type *</label>
              <select
                id="budget_type"
                name="budget_type"
                value={budgetType}
                onChange={handleBudgetTypeChange}
                required
              >
                <option value="category">Category Budget (Limit for a specific category)</option>
                <option value="monthly">Monthly Budget (Total spending limit for the month)</option>
              </select>
              <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '5px' }}>
                {budgetType === 'category' 
                  ? '💡 Set a spending limit for a specific expense category (e.g., Groceries, Entertainment)'
                  : '💡 Set a total spending limit for all expenses in a month'}
              </small>
            </div>

            {budgetType === 'category' && (
              <div className="form-group">
                <label htmlFor="category">Category *</label>
                {categories.length > 0 ? (
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.category_id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div>
                    <input
                      type="text"
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      placeholder="No expense categories yet. Type category name or create one in Categories page"
                    />
                    <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '5px' }}>
                      💡 Create expense categories in the Categories page to use dropdowns
                    </small>
                  </div>
                )}
                {errors.category && <span className="error-text">{errors.category}</span>}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="monthly_limit">Monthly Limit ($) *</label>
              <input
                type="number"
                id="monthly_limit"
                name="monthly_limit"
                value={formData.monthly_limit}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
                placeholder="0.00"
              />
              {errors.monthly_limit && (
                <span className="error-text">{errors.monthly_limit}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="month_year">Month & Year *</label>
              <input
                type="month"
                id="month_year"
                name="month_year"
                value={formData.month_year}
                onChange={handleChange}
                required
              />
            </div>

            {errors.general && (
              <div className="error-text">{errors.general}</div>
            )}

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Creating...' : budgetType === 'category' ? 'Create Category Budget' : 'Set Monthly Budget'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowForm(false);
                  setErrors({});
                  setBudgetType('category');
                  setFormData({
                    category: '',
                    monthly_limit: '',
                    month_year: new Date().toISOString().slice(0, 7),
                  });
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Monthly Budget Display Section */}
      {monthlyBudget && (
        <div className="monthly-budget-section">
          <div className="monthly-budget-header">
            <h2>Monthly Budget Limit</h2>
            <button className="btn btn-secondary btn-sm" onClick={() => {
              setBudgetType('monthly');
              setFormData({
                category: '',
                monthly_limit: monthlyBudget.monthly_limit,
                month_year: monthlyBudget.month_year,
              });
              setShowForm(true);
            }}>
              Edit
            </button>
          </div>

          <div className="monthly-budget-card">
            <div className="monthly-budget-info">
              <div>
                <h3>Total Monthly Spending</h3>
                <p className="monthly-budget-month">{monthlyBudget.month_year}</p>
              </div>
              {monthlyBudget.current_spent > monthlyBudget.monthly_limit && (
                <span className="exceeded-badge">⚠️ Exceeded</span>
              )}
            </div>

            <div className="monthly-budget-progress">
              <div className="progress-bar-container">
                <div
                  className="progress-bar"
                  style={{
                    width: `${Math.min((monthlyBudget.current_spent / monthlyBudget.monthly_limit) * 100, 100)}%`,
                    backgroundColor: monthlyBudget.current_spent > monthlyBudget.monthly_limit ? '#e74c3c' : 
                                    (monthlyBudget.current_spent / monthlyBudget.monthly_limit) >= 0.8 ? '#f39c12' : '#27ae60',
                  }}
                />
              </div>
              <div className="monthly-budget-amounts">
                <span className="spent">${monthlyBudget.current_spent.toFixed(2)}</span>
                <span className="limit">/ ${monthlyBudget.monthly_limit.toFixed(2)}</span>
                <span className="percentage" style={{
                  color: monthlyBudget.current_spent > monthlyBudget.monthly_limit ? '#e74c3c' : 
                        (monthlyBudget.current_spent / monthlyBudget.monthly_limit) >= 0.8 ? '#f39c12' : '#27ae60'
                }}>
                  ({Math.round((monthlyBudget.current_spent / monthlyBudget.monthly_limit) * 100)}%)
                </span>
              </div>
            </div>

            {monthlyBudget.current_spent > monthlyBudget.monthly_limit && (
              <div className="monthly-budget-warning">
                <strong>⚠️ Monthly Budget Exceeded!</strong>
                <p>
                  You've exceeded your monthly budget by ${(monthlyBudget.current_spent - monthlyBudget.monthly_limit).toFixed(2)}.
                </p>
              </div>
            )}

            <div className="monthly-budget-actions">
              <button
                className="btn btn-danger btn-sm"
                onClick={handleDeleteMonthlyBudget}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {!monthlyBudget && (
        <div className="monthly-budget-section">
          <div className="monthly-budget-header">
            <h2>Monthly Budget Limit</h2>
          </div>
          <p className="empty-monthly-budget">No monthly budget set for this month. Click "Add Budget" and select "Monthly Budget" to set a total spending limit for all expenses.</p>
        </div>
      )}

      {/* Budget Warnings */}
      {warnings.length > 0 && (
        <div className="budget-warnings">
          <h2>⚠️ Budget Warnings</h2>
          {warnings.map((warning) => (
            <div key={warning.budget_id} className="warning-card">
              <div className="warning-header">
                <strong>{warning.category}</strong>
                <span className="warning-badge">Exceeded by ${warning.exceeded_by.toFixed(2)}</span>
              </div>
              <div className="warning-details">
                <p>
                  Limit: ${warning.monthly_limit.toFixed(2)} | 
                  Spent: ${warning.current_spent.toFixed(2)} | 
                  {warning.percentage}% of limit
                </p>
                <p className="warning-month">{warning.month_year}</p>
              </div>
            </div>
          ))}
        </div>
      )}


      {/* Category Budgets Section */}
      <div className="category-budgets-section">
        <h2>Category Budgets</h2>
        <p className="section-description">Set spending limits for specific expense categories (e.g., Groceries, Entertainment)</p>
      </div>

      {/* Budgets List */}
      <div className="budgets-list">
        {loading && budgets.length === 0 ? (
          <p>Loading budgets...</p>
        ) : budgets.length === 0 ? (
          <p className="empty-state">No budgets set. Create one to start tracking your spending limits!</p>
        ) : (
          budgets.map((budget) => {
            const percentage = getPercentage(budget.current_spent || 0, budget.monthly_limit);
            const statusColor = getStatusColor(percentage);
            const isExceeded = percentage >= 100;

            return (
              <div key={budget.budget_id} className="budget-card">
                <div className="budget-header">
                  <div>
                    <h3>{budget.category}</h3>
                    <p className="budget-month">{budget.month_year}</p>
                  </div>
                  {isExceeded && <span className="exceeded-badge">⚠️ Exceeded</span>}
                </div>

                <div className="budget-progress">
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar"
                      style={{
                        width: `${Math.min(percentage, 100)}%`,
                        backgroundColor: statusColor,
                      }}
                    />
                  </div>
                  <div className="budget-amounts">
                    <span className="spent">${(budget.current_spent || 0).toFixed(2)}</span>
                    <span className="limit">/ ${budget.monthly_limit.toFixed(2)}</span>
                    <span className="percentage" style={{ color: statusColor }}>
                      ({percentage}%)
                    </span>
                  </div>
                </div>

                {isExceeded && (
                  <div className="budget-warning">
                    <strong>⚠️ Budget Exceeded!</strong>
                    <p>
                      You've spent ${(budget.current_spent - budget.monthly_limit).toFixed(2)} over your limit.
                    </p>
                  </div>
                )}

                <div className="budget-actions">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleRecalculate(budget.budget_id)}
                    disabled={loading}
                    title="Recalculate spending from transactions"
                  >
                    🔄 Recalculate
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(budget.budget_id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Budgets;

