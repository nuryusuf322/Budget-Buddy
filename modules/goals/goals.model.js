const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  goal_id: {
    type: String,
    required: true,
    unique: true
  },
  user_id: {
    type: String,
    required: true,
    index: true
  },
  goal_name: {
    type: String,
    required: true,
    trim: true
  },
  target_amount: {
    type: Number,
    required: true,
    min: 0
  },
  current_amount: {
    type: Number,
    default: 0,
    min: 0
  },
  target_date: {
    type: Date,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Goal', goalSchema);