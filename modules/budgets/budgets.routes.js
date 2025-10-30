const express = require('express');
const { body, validationResult } = require('express-validator');
const Budget = require('./budgets.model');
const { v4: uuidv4 } = require('uuid');
const { search } = require('../auth/auth.Routes');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            sortBy = 'month_year',
            sortOrder = 'desc',
            search,
            user_id,
            category
        } = req.query;

    const filter = {};
    if (user_id) filter.user_id = user_id;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { category: { $regex: search, $options: 'i' } },
        { month_year: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

        const budgets = await Budget.find(filter)
            .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Budget.countDocuments(filter);

        res.json({
            success: true,
            data: budgets,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
});

router.post('/', [
    body('user_id').notEmpty().withMessage('user_id is required'),
    body('category').notEmpty().withMessage('category is required'),
    body('monthly_limit').isFloat({ min: 0 }).withMessage('monthly_limit must be a non-negative number'),
    body('month_year').notEmpty().withMessage('month_year is required'),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        const budgetData = {
            ...req.body,
            budget_id: uuidv4()
        };

        const budget = new Budget(budgetData);
        await budget.save();
        res.status(201).json({ success: true, message: 'Budget created sucessfully', data: budget });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error creating budget', error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const budget = await Budget.findOneAndUpdate(
            { budget_id: req.params.id },
            req.body,
            { new: true }
        );

        if (!budget) {
            return res.status(404).json({ success: false, message: 'Budget not found' });
        }

        res.json({ success: true, message: 'Budget updated successfully', data: budget });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating budget', error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const budget = await Budget.findOneAndDelete({ budget_id: req.params.id });
        if (!budget) {
            return res.status(404).json({ success: false, message: 'Budget not found' });
        }
        res.json({ success: true, message: 'Budget deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting budget', error: error.message });
    }
});

module.exports = router;