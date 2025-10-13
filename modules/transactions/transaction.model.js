const fs = require('fs').promises;
const path = require('path');

const dataPath = path.join(__dirname, '../../data/transactions.json');

const readTransactions = async () => {
  try {
    const data = await fs.readFile(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeTransactions = async (transactions) => {
  try {
    await fs.writeFile(dataPath, JSON.stringify(transactions, null, 2));
  } catch (error) {
    throw new Error('Error saving transactions');
  }
};

const getAllTransactions = async (filters = {}) => {
  try {
    let transactions = await readTransactions();
    
    if (filters.user_id) {
      transactions = transactions.filter(t => t.user_id === filters.user_id);
    }
    if (filters.type) {
      transactions = transactions.filter(t => t.type === filters.type);
    }
    
    return transactions;
  } catch (error) {
    throw error;
  }
};

const getTransactionById = async (id) => {
  try {
    const transactions = await readTransactions();
    return transactions.find(t => t.transaction_id === id) || null;
  } catch (error) {
    throw error;
  }
};

const addNewTransaction = async (transactionData) => {
  try {
    const transactions = await readTransactions();
    const newId = 'trans' + Date.now();
    
    const newTransaction = {
      transaction_id: newId,
      ...transactionData,
      date: transactionData.date || new Date().toISOString().split('T')[0]
    };
    
    transactions.push(newTransaction);
    await writeTransactions(transactions);
    return newTransaction;
  } catch (error) {
    throw error;
  }
};

const updateExistingTransaction = async (id, updateData) => {
  try {
    const transactions = await readTransactions();
    const transactionIndex = transactions.findIndex(t => t.transaction_id === id);
    
    if (transactionIndex === -1) return null;
    
    transactions[transactionIndex] = {
      ...transactions[transactionIndex],
      ...updateData,
      transaction_id: id
    };
    
    await writeTransactions(transactions);
    return transactions[transactionIndex];
  } catch (error) {
    throw error;
  }
};

const deleteTransaction = async (id) => {
  try {
    const transactions = await readTransactions();
    const transactionIndex = transactions.findIndex(t => t.transaction_id === id);
    
    if (transactionIndex === -1) return null;
    
    const deletedTransaction = transactions.splice(transactionIndex, 1)[0];
    await writeTransactions(transactions);
    return deletedTransaction;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAllTransactions,
  getTransactionById,
  addNewTransaction,
  updateExistingTransaction,
  deleteTransaction
};