import React, { useState, useEffect } from 'react';
import { validateTransaction } from '../utils/validation';
import './TransactionForm.css';

const TransactionForm = ({ user, transaction, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    user_id: user?.user_id || '',
    amount: '',
    type: 'expense',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (transaction) {
      const transactionDate = new Date(transaction.date).toISOString().split('T')[0];
      setFormData({
        user_id: transaction.user_id,
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        description: transaction.description || '',
        date: transactionDate,
        payment_method: transaction.payment_method,
      });
    }
  }, [transaction]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    // Client-side validation
    const validation = validateTransaction(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Convert amount to number
    const transactionData = {
      ...formData,
      amount: parseFloat(formData.amount),
    };

    onSave(transactionData);
  };

  return (
    <div className="form-overlay">
      <div className="form-modal">
        <h2>{transaction ? 'Edit Transaction' : 'Add New Transaction'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="type">Type *</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={errors.type ? 'error' : ''}
                required
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
              {errors.type && <span className="error-text">{errors.type}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="amount">Amount *</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                step="0.01"
                min="0.01"
                className={errors.amount ? 'error' : ''}
                required
              />
              {errors.amount && <span className="error-text">{errors.amount}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={errors.category ? 'error' : ''}
                placeholder="e.g., Food, Salary, Rent"
                required
              />
              {errors.category && <span className="error-text">{errors.category}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="payment_method">Payment Method *</label>
              <select
                id="payment_method"
                name="payment_method"
                value={formData.payment_method}
                onChange={handleChange}
                className={errors.payment_method ? 'error' : ''}
                required
              >
                <option value="cash">Cash</option>
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="online">Online</option>
                <option value="other">Other</option>
              </select>
              {errors.payment_method && <span className="error-text">{errors.payment_method}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Date *</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={errors.date ? 'error' : ''}
                required
              />
              {errors.date && <span className="error-text">{errors.date}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <input
                type="text"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Optional description"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {transaction ? 'Update' : 'Create'} Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;





