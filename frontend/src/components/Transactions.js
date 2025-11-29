import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { transactionsAPI } from '../services/api';
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

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user, fetchTransactions]);

  const handleCreate = async (transactionData) => {
    try {
      const response = await transactionsAPI.create(transactionData);
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Transaction created successfully!' });
        setShowForm(false);
        fetchTransactions();
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
        setMessage({ type: 'success', text: 'Transaction deleted successfully!' });
        fetchTransactions();
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
    return new Date(dateString).toLocaleDateString('en-US', {
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





