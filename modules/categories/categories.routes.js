const express = require('express');
const { body, validationResult } = require('express-validator');
const Category = require('./categories.model');
const { v4: uuidv4 } = require('uuid');
const { authenticate, authorize } = require('../../shared/middlewares/auth');

const router = express.Router();

// Protected route - requires authentication
router.get('/', authenticate, async (req, res) => {
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
    // Users can only see their own categories, admins/managers can see all
    if (['admin', 'manager'].includes(req.user.role)) {
      if (user_id) filter.user_id = user_id;
    } else {
      filter.user_id = req.user.user_id; // Regular users can only see their own
    }
    if (type) filter.type = type;
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    const categories = await Category.find(filter)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(limitNum);
    
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


// Protected route - requires authentication
router.get('/:id', authenticate, async (req, res) => {
  try {
    const category = await Category.findOne({ category_id: req.params.id });
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Users can only access their own categories, admins/managers can access any
    if (!['admin', 'manager'].includes(req.user.role) && category.user_id !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own categories.'
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

// Protected route - requires authentication
router.post('/', authenticate, [
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
      user_id: req.user.user_id, // Set from authenticated user
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

// Protected route - requires authentication
router.put('/:id', authenticate, async (req, res) => {
  try {
    const existingCategory = await Category.findOne({ category_id: req.params.id });
    
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Users can only update their own categories, admins/managers can update any
    if (!['admin', 'manager'].includes(req.user.role) && existingCategory.user_id !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own categories.'
      });
    }

    // Prevent users from changing user_id
    const updateData = { ...req.body };
    if (!['admin', 'manager'].includes(req.user.role)) {
      delete updateData.user_id;
    }

    const category = await Category.findOneAndUpdate(
      { category_id: req.params.id },
      updateData,
      { new: true, runValidators: true }
    );

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

// Protected route - requires authentication
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const category = await Category.findOne({ 
      category_id: req.params.id 
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Users can only delete their own categories, admins/managers can delete any
    if (!['admin', 'manager'].includes(req.user.role) && category.user_id !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own categories.'
      });
    }

    await Category.findOneAndDelete({ category_id: req.params.id });

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