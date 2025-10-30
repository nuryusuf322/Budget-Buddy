const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  budget_id: {
    type: String,
    required: true,
    unique: true
  },
  user_id: {
    type: String,
    required: true,
    index: true
  },
  category: {
    type: String,
    required: true
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

module.exports = mongoose.model('Budget', budgetSchema);