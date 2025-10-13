const fs = require('fs').promises;
const path = require('path');

const dataPath = path.join(__dirname, '../../data/categories.json');

const readCategories = async () => {
  try {
    const data = await fs.readFile(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeCategories = async (categories) => {
  try {
    await fs.writeFile(dataPath, JSON.stringify(categories, null, 2));
  } catch (error) {
    throw new Error('Error saving categories');
  }
};

const getAllCategories = async (filters = {}) => {
  try {
    let categories = await readCategories();
    
    if (filters.user_id) {
      categories = categories.filter(c => c.user_id === filters.user_id);
    }
    if (filters.type) {
      categories = categories.filter(c => c.type === filters.type);
    }
    
    return categories;
  } catch (error) {
    throw error;
  }
};

const getCategoryById = async (id) => {
  try {
    const categories = await readCategories();
    return categories.find(c => c.category_id === id) || null;
  } catch (error) {
    throw error;
  }
};

const addNewCategory = async (categoryData) => {
  try {
    const categories = await readCategories();
    const newId = 'cat' + Date.now();
    
    const newCategory = {
      category_id: newId,
      ...categoryData
    };
    
    categories.push(newCategory);
    await writeCategories(categories);
    return newCategory;
  } catch (error) {
    throw error;
  }
};

const updateExistingCategory = async (id, updateData) => {
  try {
    const categories = await readCategories();
    const categoryIndex = categories.findIndex(c => c.category_id === id);
    
    if (categoryIndex === -1) return null;
    
    categories[categoryIndex] = {
      ...categories[categoryIndex],
      ...updateData,
      category_id: id
    };
    
    await writeCategories(categories);
    return categories[categoryIndex];
  } catch (error) {
    throw error;
  }
};

const deleteCategory = async (id) => {
  try {
    const categories = await readCategories();
    const categoryIndex = categories.findIndex(c => c.category_id === id);
    
    if (categoryIndex === -1) return null;
    
    const deletedCategory = categories.splice(categoryIndex, 1)[0];
    await writeCategories(categories);
    return deletedCategory;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  addNewCategory,
  updateExistingCategory,
  deleteCategory
};