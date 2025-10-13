const fs = require('fs').promises;
const path = require('path');

const dataPath = path.join(__dirname, '../../data/goals.json');

const readGoals = async () => {
  try {
    const data = await fs.readFile(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeGoals = async (goals) => {
  try {
    await fs.writeFile(dataPath, JSON.stringify(goals, null, 2));
  } catch (error) {
    throw new Error('Error saving goals');
  }
};

const getAllGoals = async (filters = {}) => {
  try {
    let goals = await readGoals();
    
    if (filters.user_id) {
      goals = goals.filter(g => g.user_id === filters.user_id);
    }
    if (filters.priority) {
      goals = goals.filter(g => g.priority === filters.priority);
    }
    
    return goals;
  } catch (error) {
    throw error;
  }
};

const getGoalById = async (id) => {
  try {
    const goals = await readGoals();
    return goals.find(g => g.goal_id === id) || null;
  } catch (error) {
    throw error;
  }
};

const addNewGoal = async (goalData) => {
  try {
    const goals = await readGoals();
    const newId = 'goal' + Date.now();
    
    const newGoal = {
      goal_id: newId,
      ...goalData,
      current_amount: goalData.current_amount || 0
    };
    
    goals.push(newGoal);
    await writeGoals(goals);
    return newGoal;
  } catch (error) {
    throw error;
  }
};

const updateExistingGoal = async (id, updateData) => {
  try {
    const goals = await readGoals();
    const goalIndex = goals.findIndex(g => g.goal_id === id);
    
    if (goalIndex === -1) return null;
    
    goals[goalIndex] = {
      ...goals[goalIndex],
      ...updateData,
      goal_id: id
    };
    
    await writeGoals(goals);
    return goals[goalIndex];
  } catch (error) {
    throw error;
  }
};

const deleteGoal = async (id) => {
  try {
    const goals = await readGoals();
    const goalIndex = goals.findIndex(g => g.goal_id === id);
    
    if (goalIndex === -1) return null;
    
    const deletedGoal = goals.splice(goalIndex, 1)[0];
    await writeGoals(goals);
    return deletedGoal;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAllGoals,
  getGoalById,
  addNewGoal,
  updateExistingGoal,
  deleteGoal
};