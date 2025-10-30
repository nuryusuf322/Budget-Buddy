const express = require('express');
const { body, validationResult } = require('express-validator');
const Category = require('./categories.model');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// GET all categories with search, sort, pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortOrder = 'asc',
      search,
      user_id,
      type
    } = req.query;

    const filter = {};
    if (user_id) filter.user_id = user_id;
    if (type) filter.type = type;
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;
    
    const categories = await Category.find(filter)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Category.countDocuments(filter);
    
    res.json({
      success: true,
      data: categories,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findOne({ category_id: req.params.id });
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching category',
      error: error.message
    });
  }
});

// CREATE new category
router.post('/', [
  body('user_id').notEmpty(),
  body('name').notEmpty(),
  body('type').isIn(['income', 'expense'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const categoryData = {
      ...req.body,
      category_id: uuidv4()
    };

    const category = new Category(categoryData);
    await category.save();

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating category',
      error: error.message
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const category = await Category.findOneAndUpdate(
      { category_id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating category',
      error: error.message
    });
  }
});

// DELETE category
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({ 
      category_id: req.params.id 
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting category',
      error: error.message
    });
  }
});

module.exports = router;