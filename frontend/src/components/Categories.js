import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { categoriesAPI } from '../services/api';
import Message from './Message';
import './Categories.css';

const Categories = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense',
  });
  const [errors, setErrors] = useState({});
  const [filterType, setFilterType] = useState('all'); // 'all', 'income', 'expense'

  const fetchCategories = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const params = { user_id: user.user_id };
      if (filterType !== 'all') {
        params.type = filterType;
      }
      const response = await categoriesAPI.getAll(params);
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to fetch categories',
      });
    } finally {
      setLoading(false);
    }
  }, [user, filterType]);

  useEffect(() => {
    if (user) {
      fetchCategories();
    }
  }, [user, fetchCategories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Get color based on type
  const getColorByType = (type) => {
    return type === 'income' ? '#27ae60' : '#e74c3c'; // Green for income, Red for expense
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage({ type: '', text: '' });

    // Validation
    if (!formData.name.trim()) {
      setErrors({ name: 'Category name is required' });
      return;
    }

    setLoading(true);
    try {
      // Automatically set color based on type
      const categoryData = {
        ...formData,
        color: getColorByType(formData.type),
      };
      const response = await categoriesAPI.create(categoryData);
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Category created successfully!' });
        setShowForm(false);
        setFormData({
          name: '',
          type: 'expense',
        });
        fetchCategories();
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to create category',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? This will not delete transactions, but they may not match budgets correctly.')) return;

    try {
      const response = await categoriesAPI.delete(id);
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Category deleted successfully!' });
        fetchCategories();
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to delete category',
      });
    }
  };

  const expenseCategories = categories.filter(cat => cat.type === 'expense');
  const incomeCategories = categories.filter(cat => cat.type === 'income');

  return (
    <div className="categories-container">
      <div className="categories-header">
        <h1>Categories</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Category'}
        </button>
      </div>

      <Message type={message.type} message={message.text} />

      {/* Filter */}
      <div className="filter-section">
        <label>Filter by type: </label>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="all">All Categories</option>
          <option value="expense">Expenses Only</option>
          <option value="income">Income Only</option>
        </select>
      </div>

      {/* Category Form */}
      {showForm && (
        <div className="category-form-card">
          <h2>Create New Category</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Category Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., Groceries, Salary, Rent"
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="type">Type *</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
              <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '5px' }}>
                Color will be automatically set: {formData.type === 'income' ? '🟢 Green' : '🔴 Red'}
              </small>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Creating...' : 'Create Category'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowForm(false);
                  setErrors({});
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
      <div className="categories-list">
        {loading && categories.length === 0 ? (
          <p>Loading categories...</p>
        ) : categories.length === 0 ? (
          <p className="empty-state">No categories found. Create one to get started!</p>
        ) : (
          <>
            {expenseCategories.length > 0 && (
              <div className="category-section">
                <h2>Expense Categories</h2>
                <div className="category-grid">
                  {expenseCategories.map((category) => (
                    <div key={category.category_id} className="category-card" style={{ borderLeftColor: category.color }}>
                      <div className="category-header">
                        <h3>{category.name}</h3>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(category.category_id)}
                        >
                          Delete
                        </button>
                      </div>
                      <div className="category-info">
                        <span className="category-type expense">Expense</span>
                        <span className="category-color" style={{ backgroundColor: category.color }}></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {incomeCategories.length > 0 && (
              <div className="category-section">
                <h2>Income Categories</h2>
                <div className="category-grid">
                  {incomeCategories.map((category) => (
                    <div key={category.category_id} className="category-card" style={{ borderLeftColor: category.color }}>
                      <div className="category-header">
                        <h3>{category.name}</h3>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(category.category_id)}
                        >
                          Delete
                        </button>
                      </div>
                      <div className="category-info">
                        <span className="category-type income">Income</span>
                        <span className="category-color" style={{ backgroundColor: category.color }}></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Categories;

