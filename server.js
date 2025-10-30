require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./shared/middlewares/connect-db');
const authRoutes = require('./modules/auth/auth.Routes');
const transactionRoutes = require('./modules/transactions/transaction.routes'); 
const budgetRoutes = require('./modules/budgets/budgets.routes');
const goalRoutes = require('./modules/goals/goals.routes');
const categoryRoutes = require('./modules/categories/categories.routes');

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to Budget Buddy API');
  res.json({ message: 'Budget Buddy API is working!',timestamp: new Date().toISOString(), database: 'MongoDB connected' });
});

app.get('/api/test', (req, res) => {
  res.json({ success: true,message: 'API test route is working!', database: 'MongoDB connected' });
});

app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ success: false, message: 'Internal Server Error', error: process.env.NODE_ENV === 'development' ? error.message : {}});
});

app.listen(PORT, () => {
   console.log(`🚀 Budget Buddy server running on http://localhost:${PORT}`);
  console.log(`📊 Database: MongoDB Atlas`);
  console.log(`✅ Test the API: http://localhost:3000/api/test`);
  console.log(`✅ Auth routes: http://localhost:3000/api/auth/users`);
  console.log(`✅ Transaction routes: http://localhost:3000/api/transactions`);
  console.log(`✅ Budget routes: http://localhost:3000/api/budgets`);
  console.log(`✅ Goal routes: http://localhost:3000/api/goals`);
  console.log(`✅ Category routes: http://localhost:3000/api/categories`);
});

