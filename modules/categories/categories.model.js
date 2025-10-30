const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  category_id: {
    type: String,
    required: true,
    unique: true
  },
  user_id: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['income', 'expense']
  },
  color: {
    type: String,
    default: '#4CAF50'
  },
  icon: {
    type: String,
    default: 'shopping-cart'
  },
  monthly_limit: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true  
});

module.exports = mongoose.model('Category', categorySchema);