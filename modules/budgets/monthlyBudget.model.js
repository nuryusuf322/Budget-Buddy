const mongoose = require('mongoose');

const monthlyBudgetSchema = new mongoose.Schema({
  monthly_budget_id: {
    type: String,
    required: true,
    unique: true
  },
  user_id: {
    type: String,
    required: true,
    index: true
  },
  monthly_limit: {
    type: Number,
    required: true,
    min: 0
  },
  current_spent: {
    type: Number,
    default: 0,
    min: 0
  },
  month_year: {
    type: String,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  }
}, {
  timestamps: true
});

// Compound index to ensure one monthly budget per user per month
monthlyBudgetSchema.index({ user_id: 1, month_year: 1 }, { unique: true });

module.exports = mongoose.model('MonthlyBudget', monthlyBudgetSchema);

