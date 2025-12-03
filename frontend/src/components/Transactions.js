import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { transactionsAPI, budgetsAPI } from '../services/api';
import Message from './Message';
import TransactionForm from './TransactionForm';
import './Transactions.css';

const Transactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    category: '',
    startDate: '',
    endDate: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [budgetWarnings, setBudgetWarnings] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState({
    totalSpending: 0,
    totalIncome: 0,
    averageDailySpending: 0,
    averagePerTransaction: 0,
    transactionCount: 0,
    netBalance: 0,
    spendingRatio: 0,
  });

  const fetchTransactions = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const params = {
        user_id: user.user_id,
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      };

      // Remove empty filters
      Object.keys(params).forEach((key) => {
        if (params[key] === '') {
          delete params[key];
        }
      });

      const response = await transactionsAPI.getAll(params);
      if (response.data.success) {
        setTransactions(response.data.data);
        setPagination((prev) => ({
          ...prev,
          total: response.data.pagination.total,
          pages: response.data.pagination.pages,
        }));
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to fetch transactions',
      });
    } finally {
      setLoading(false);
    }
  }, [user, filters, pagination.page, pagination.limit]);

  const fetchBudgetWarnings = useCallback(async () => {
    if (!user) return;

    try {
      const response = await budgetsAPI.getWarnings({ user_id: user.user_id });
      if (response.data.success) {
        setBudgetWarnings(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch budget warnings:', error);
    }
  }, [user]);

  const fetchMonthlyStats = useCallback(async () => {
    if (!user) return;

    try {
      // Get current month start and end dates
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const startDate = new Date(year, month, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

      // Fetch all transactions for the current month (no pagination)
      const response = await transactionsAPI.getAll({
        user_id: user.user_id,
        startDate: startDate,
        endDate: endDate,
        limit: 1000, // Get all transactions for the month
      });

      if (response.data.success) {
        const allTransactions = response.data.data;
        const expenses = allTransactions.filter(t => t.type === 'expense');
        const income = allTransactions.filter(t => t.type === 'income');

        // Calculate totals
        const totalSpending = expenses.reduce((sum, t) => sum + t.amount, 0);
        const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
        const transactionCount = expenses.length;

        // Calculate averages
        const currentDay = now.getDate();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // Get unique days that have transactions (more realistic)
        const transactionDays = new Set();
        expenses.forEach(t => {
          const date = new Date(t.date);
          transactionDays.add(date.getUTCDate()); // Get the day of month
        });
        const daysWithTransactions = transactionDays.size;
        
        // Average spending per day that actually had transactions
        const averageDailySpending = daysWithTransactions > 0 ? totalSpending / daysWithTransactions : 0;
        const averagePerTransaction = transactionCount > 0 ? totalSpending / transactionCount : 0;
        
        // Calculate net balance (earnings vs spending)
        const netBalance = totalIncome - totalSpending;
        const spendingRatio = totalIncome > 0 ? (totalSpending / totalIncome) * 100 : 0;

        setMonthlyStats({
          totalSpending,
          totalIncome,
          averageDailySpending,
          averagePerTransaction,
          transactionCount,
          netBalance,
          spendingRatio,
        });
      }
    } catch (error) {
      console.error('Failed to fetch monthly stats:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchTransactions();
      fetchBudgetWarnings();
      fetchMonthlyStats();
    }
  }, [user, fetchTransactions, fetchBudgetWarnings, fetchMonthlyStats]);

  const handleCreate = async (transactionData) => {
    try {
      const response = await transactionsAPI.create(transactionData);
      if (response.data.success) {
        let messageText = 'Transaction created successfully!';
        
        // Check for budget warning
        if (response.data.budgetWarning && transactionData.type === 'expense') {
          const warning = response.data.budgetWarning;
          
          // Check if it's a monthly budget warning
          if (warning.type === 'monthly') {
            messageText = `⚠️ Your monthly expense budget has been exceeded by $${warning.exceeded_by.toFixed(2)}! Total spending: $${warning.current_spent.toFixed(2)} / Limit: $${warning.monthly_limit.toFixed(2)}`;
            setMessage({ type: 'error', text: messageText });
          } else if (warning.category) {
            // Category budget warning
            messageText = `⚠️ Transaction created, but you've exceeded your ${warning.category} budget by $${warning.exceeded_by.toFixed(2)}!`;
            setMessage({ type: 'error', text: messageText });
          } else {
            setMessage({ type: 'success', text: messageText });
          }
        } else {
          setMessage({ type: 'success', text: messageText });
        }
        
        setShowForm(false);
        fetchTransactions();
        fetchBudgetWarnings(); // Refresh warnings after creating transaction
        fetchMonthlyStats(); // Refresh monthly stats
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to create transaction',
      });
    }
  };

  const handleUpdate = async (id, transactionData) => {
    try {
      const response = await transactionsAPI.update(id, transactionData);
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Transaction updated successfully!' });
        setEditingTransaction(null);
        setShowForm(false);
        fetchTransactions();
        fetchMonthlyStats(); // Refresh monthly stats
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update transaction',
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      const response = await transactionsAPI.delete(id);
      if (response.data.success) {
        // Clear any error messages
        setMessage({ type: '', text: '' });
        // Refresh transactions
        fetchTransactions();
        // Refresh budget warnings to update/remove warnings
        fetchBudgetWarnings();
        // Refresh monthly stats
        fetchMonthlyStats();
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to delete transaction',
      });
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      type: '',
      category: '',
      startDate: '',
      endDate: '',
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const formatDate = (dateString) => {
    // Handle date to avoid timezone issues
    // Extract date components from UTC date to avoid timezone conversion
    const date = new Date(dateString);
    
    // Use UTC methods to get the date components, avoiding timezone shifts
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const day = date.getUTCDate();
    
    // Create a local date with the UTC date components
    const localDate = new Date(year, month, day);
    
    return localDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (!user) {
    return <div>Please login to view transactions.</div>;
  }

  return (
    <div className="transactions-container">
      <div className="transactions-header">
        <h1>Transactions</h1>
        <button className="btn btn-primary" onClick={() => {
          setEditingTransaction(null);
          setShowForm(true);
        }}>
          + Add Transaction
        </button>
      </div>

      <Message
        type={message.type}
        message={message.text}
        onClose={() => setMessage({ type: '', text: '' })}
      />

      {/* Monthly Spending Summary */}
      <div className="monthly-stats-section">
        <h2>📊 Monthly Spending Overview</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Spending</div>
            <div className="stat-value stat-expense">{formatCurrency(monthlyStats.totalSpending)}</div>
            <div className="stat-subtext">This month</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Income</div>
            <div className="stat-value stat-income">{formatCurrency(monthlyStats.totalIncome)}</div>
            <div className="stat-subtext">This month</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Average Per Transaction</div>
            <div className="stat-value">{formatCurrency(monthlyStats.averagePerTransaction)}</div>
            <div className="stat-subtext">{monthlyStats.transactionCount} expense{monthlyStats.transactionCount !== 1 ? 's' : ''}</div>
          </div>
          <div className={`stat-card ${monthlyStats.netBalance >= 0 ? 'stat-card-positive' : 'stat-card-negative'}`}>
            <div className="stat-label">Net Balance</div>
            <div className={`stat-value ${monthlyStats.netBalance >= 0 ? 'stat-positive' : 'stat-negative'}`}>
              {formatCurrency(monthlyStats.netBalance)}
            </div>
            <div className="stat-subtext">
              {monthlyStats.netBalance >= 0 
                ? `✅ Spending ${monthlyStats.spendingRatio.toFixed(1)}% of income`
                : `⚠️ Overspending by ${formatCurrency(Math.abs(monthlyStats.netBalance))}`
              }
            </div>
          </div>
        </div>
      </div>

      {/* Budget Warnings Banner */}
      {budgetWarnings.length > 0 && (
        <div className="budget-warnings-banner">
          <h3>⚠️ Budget Warnings</h3>
          {budgetWarnings.map((warning, index) => (
            <div key={warning.budget_id || `monthly-${index}`} className="warning-item">
              {warning.type === 'monthly' ? (
                <>
                  <strong>Monthly Budget</strong> - Exceeded by {formatCurrency(warning.exceeded_by)} 
                  ({warning.percentage}% of {formatCurrency(warning.monthly_limit)} limit)
                  <br />
                  <small>Total spending: {formatCurrency(warning.current_spent)}</small>
                </>
              ) : (
                <>
                  <strong>{warning.category}</strong> - Exceeded by {formatCurrency(warning.exceeded_by)} 
                  ({warning.percentage}% of {formatCurrency(warning.monthly_limit)} limit)
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <TransactionForm
          user={user}
          transaction={editingTransaction}
          onSave={(data) => {
            if (editingTransaction) {
              handleUpdate(editingTransaction.transaction_id, data);
            } else {
              handleCreate(data);
            }
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingTransaction(null);
          }}
        />
      )}

      <div className="filters-section">
        <h3>Filters</h3>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Search</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search description or category..."
            />
          </div>
          <div className="filter-group">
            <label>Type</label>
            <select name="type" value={filters.type} onChange={handleFilterChange}>
              <option value="">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Category</label>
            <input
              type="text"
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              placeholder="Filter by category..."
            />
          </div>
          <div className="filter-group">
            <label>Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </div>
          <div className="filter-group">
            <label>End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>
          <div className="filter-group">
            <button className="btn btn-secondary" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading transactions...</div>
      ) : transactions.length === 0 ? (
        <div className="empty-state">No transactions found. Create your first transaction!</div>
      ) : (
        <>
          <div className="transactions-table-container">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.transaction_id}>
                    <td>{formatDate(transaction.date)}</td>
                    <td>{transaction.description || '-'}</td>
                    <td>{transaction.category}</td>
                    <td>
                      <span className={`badge badge-${transaction.type}`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className={transaction.type === 'income' ? 'amount-income' : 'amount-expense'}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td>{transaction.payment_method}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-edit"
                        onClick={() => handleEdit(transaction)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-delete"
                        onClick={() => handleDelete(transaction.transaction_id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.pages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-secondary"
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
              >
                Previous
              </button>
              <span>
                Page {pagination.page} of {pagination.pages} (Total: {pagination.total})
              </span>
              <button
                className="btn btn-secondary"
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= pagination.pages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Transactions;





