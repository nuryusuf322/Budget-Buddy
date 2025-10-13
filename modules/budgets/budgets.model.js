const fs = require('fs').promises;
const path = require('path');

const dataPath = path.join(__dirname, '../../data/budgets.json');

const readBudgets = async () => {
  try {
    const data = await fs.readFile(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeBudgets = async (budgets) => {
  try {
    await fs.writeFile(dataPath, JSON.stringify(budgets, null, 2));
  } catch (error) {
    throw new Error('Error saving budgets');
  }
};

const getAllBudgets = async (filters = {}) => {
  try {
    let budgets = await readBudgets();
    
    if (filters.user_id) {
      budgets = budgets.filter(b => b.user_id === filters.user_id);
    }
    if (filters.category) {
      budgets = budgets.filter(b => b.category === filters.category);
    }
    
    return budgets;
  } catch (error) {
    throw error;
  }
};

const getBudgetById = async (id) => {
  try {
    const budgets = await readBudgets();
    return budgets.find(b => b.budget_id === id) || null;
  } catch (error) {
    throw error;
  }
};

const addNewBudget = async (budgetData) => {
  try {
    const budgets = await readBudgets();
    const newId = 'budget' + Date.now();
    
    const newBudget = {
      budget_id: newId,
      ...budgetData,
      current_spent: budgetData.current_spent || 0
    };
    
    budgets.push(newBudget);
    await writeBudgets(budgets);
    return newBudget;
  } catch (error) {
    throw error;
  }
};

const updateExistingBudget = async (id, updateData) => {
  try {
    const budgets = await readBudgets();
    const budgetIndex = budgets.findIndex(b => b.budget_id === id);
    
    if (budgetIndex === -1) return null;
    
    budgets[budgetIndex] = {
      ...budgets[budgetIndex],
      ...updateData,
      budget_id: id
    };
    
    await writeBudgets(budgets);
    return budgets[budgetIndex];
  } catch (error) {
    throw error;
  }
};

const deleteBudget = async (id) => {
  try {
    const budgets = await readBudgets();
    const budgetIndex = budgets.findIndex(b => b.budget_id === id);
    
    if (budgetIndex === -1) return null;
    
    const deletedBudget = budgets.splice(budgetIndex, 1)[0];
    await writeBudgets(budgets);
    return deletedBudget;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAllBudgets,
  getBudgetById,
  addNewBudget,
  updateExistingBudget,
  deleteBudget
};