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
          <p>Set monthly budgets for different categories and track your spending.</p>
        </div>
        <div className="feature-card">
          <h3>🎯 Financial Goals</h3>
          <p>Set and track your financial goals with target dates and amounts.</p>
        </div>
        <div className="feature-card">
          <h3>📈 Analytics</h3>
          <p>View your financial data with search, filter, and pagination features.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;


