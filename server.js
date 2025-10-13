const express = require('express');
const cors = require('cors');

// Import routes
const authRoutes = require('./modules/auth/auth.Routes');
const transactionRoutes = require('./modules/transactions/transaction.routes');
const budgetRoutes = require('./modules/budgets/budgets.routes');
const goalRoutes = require('./modules/goals/goals.routes');
const categoryRoutes = require('./modules/categories/categories.routes');


const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/categories', categoryRoutes);

// Simple test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Budget Buddy API is working!',
    timestamp: new Date().toISOString()
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true,
    message: 'API test route is working!'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Budget Buddy server running on http://localhost:${PORT}`);
  console.log(`✅ Test the API: http://localhost:3000/api/test`);
  console.log(`✅ Auth routes: http://localhost:3000/api/auth/users`);
  console.log(`✅ Transaction routes: http://localhost:3000/api/transactions`);
  console.log(`✅ Budget routes: http://localhost:3000/api/budgets`);
  console.log(`✅ Goal routes: http://localhost:3000/api/goals`);
  console.log(`✅ Category routes: http://localhost:3000/api/categories`); // ← ADD THIS LINE
});