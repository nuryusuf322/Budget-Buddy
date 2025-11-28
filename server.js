require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./shared/middlewares/connect-db');
const authRoutes = require('./modules/auth/auth.routes');
const transactionRoutes = require('./modules/transactions/transaction.routes'); 
const budgetRoutes = require('./modules/budgets/budgets.routes');
const goalRoutes = require('./modules/goals/goals.routes');
const categoryRoutes = require('./modules/categories/categories.routes');

const app = express();
const PORT = process.env.PORT || 3001;

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Budget Buddy API is working!', timestamp: new Date().toISOString(), database: 'MongoDB connected' });
});

app.get('/api/test', (req, res) => {
  res.json({ success: true,message: 'API test route is working!', database: 'MongoDB connected' });
});

app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((error, req, res, next) => {
  console.error('Error:', error);
  // Check if response has already been sent
  if (res.headersSent) {
    return next(error);
  }
  res.status(500).json({ success: false, message: 'Internal Server Error', error: process.env.NODE_ENV === 'development' ? error.message : {}});
});

app.listen(PORT, () => {
  console.log(`🚀 Budget Buddy server running on http://localhost:${PORT}`);
  console.log(`📊 Database: MongoDB Atlas`);
  console.log(`\n📝 API Endpoints:`);
  console.log(`   ✅ Test the API: http://localhost:${PORT}/api/test`);
  console.log(`   ✅ Auth routes: http://localhost:${PORT}/api/auth/users`);
  console.log(`   ✅ Transaction routes: http://localhost:${PORT}/api/transactions`);
  console.log(`   ✅ Budget routes: http://localhost:${PORT}/api/budgets`);
  console.log(`   ✅ Goal routes: http://localhost:${PORT}/api/goals`);
  console.log(`   ✅ Category routes: http://localhost:${PORT}/api/categories`);
  console.log(`\n🌐 Frontend: Start the React app in the 'frontend' directory`);
  console.log(`   Run: cd frontend && npm start`);
  console.log(`   Frontend will run on http://localhost:3000`);
});

