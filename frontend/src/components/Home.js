import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home-container">
      <div className="home-hero">
        <h1>Welcome to Budget Buddy</h1>
        <p className="home-subtitle">Your Personal Finance Management Solution</p>
        <p className="home-description">
          Track your income and expenses, set budgets, manage financial goals, and take control of your finances.
        </p>
        {user ? (
          <div className="home-actions">
            <Link to="/transactions" className="btn btn-primary btn-large">
              View Transactions
            </Link>
          </div>
        ) : (
          <div className="home-actions">
            <Link to="/register" className="btn btn-primary btn-large">
              Get Started
            </Link>
            <Link to="/login" className="btn btn-secondary btn-large">
              Login
            </Link>
          </div>
        )}
      </div>

      <div className="home-features">
        <div className="feature-card">
          <h3>💰 Track Transactions</h3>
          <p>Record and manage all your income and expenses with detailed categorization.</p>
        </div>
        <div className="feature-card">
          <h3>📊 Budget Management</h3>
          <p>Set spending limits by category (e.g., Groceries, Entertainment) and set an overall monthly budget limit. Get automatic warnings when you exceed your budgets.</p>
        </div>
        <div className="feature-card">
          <h3>🏷️ Category Management</h3>
          <p>Create and organize your expense and income categories with automatic color coding. Use categories to track and filter your transactions.</p>
        </div>
        <div className="feature-card">
          <h3>📈 Analytics</h3>
          <p>View comprehensive spending insights including total income vs spending, average per transaction, net balance, and track your financial health. Search, filter, and paginate through your transactions.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;








