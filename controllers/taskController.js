const { Task } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/db');

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks for authenticated user with pagination and sorting
 * @access  Private
 * @query   page, limit, sortBy, order
 */
const getTasks = async (req, res) => {
  try {
    // Pagination parameters with defaults
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Sorting parameters with defaults
    const sortBy = req.query.sortBy || 'end_date';
    const order = req.query.order || 'asc';

    // Map sortBy to actual database column names
    const sortMapping = {
      end_date: 'endDate',
      priority: 'priority',
      created_at: 'createdAt'
    };

    // Custom sorting for priority (high > medium > low)
    let orderClause;
    if (sortBy === 'priority') {
      // Custom priority ordering using CASE statement
      orderClause = [
        [
          sequelize.literal(`
            CASE 
              WHEN priority = 'high' THEN 1
              WHEN priority = 'medium' THEN 2
              WHEN priority = 'low' THEN 3
            END
          `),
          order
        ]
      ];
    } else {
      orderClause = [[sortMapping[sortBy] || 'endDate', order.toUpperCase()]];
    }

    // Fetch tasks for authenticated user
    const { count, rows: tasks } = await Task.findAndCountAll({
      where: { userId: req.user.id },
      limit,
      offset,
      order: orderClause,
      attributes: [
        'id',
        'title',
        'description',
        'priority',
        'endDate',
        'createdAt',
        'updatedAt'
      ]
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      success: true,
      count: tasks.length,
      pagination: {
        currentPage: page,
        totalPages,
        totalTasks: count,
        limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      tasks
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Could not fetch tasks.'
    });
  }
};

/**
 * @route   GET /api/tasks/:id
 * @desc    Get single task by ID
 * @access  Private
 */
const getTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id // Ensure user owns the task
      }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or you do not have permission to view it.'
      });
    }

    res.status(200).json({
      success: true,
      task
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Could not fetch task.'
    });
  }
};

/**
 * @route   POST /api/tasks
 * @desc    Create new task
 * @access  Private
 */
const createTask = async (req, res) => {
  try {
    const { title, description, priority, endDate } = req.body;

    // Create task associated with authenticated user
    const task = await Task.create({
      userId: req.user.id,
      title,
      description,
      priority,
      endDate
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    console.error('Create task error:', error);

    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error. Could not create task.'
    });
  }
};

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update task
 * @access  Private
 */
const updateTask = async (req, res) => {
  try {
    const { title, description, priority, endDate } = req.body;

    // Find task and verify ownership
    const task = await Task.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or you do not have permission to update it.'
      });
    }

    // Update task fields
    task.title = title || task.title;
    task.description = description !== undefined ? description : task.description;
    task.priority = priority || task.priority;
    task.endDate = endDate || task.endDate;

    await task.save();

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task
    });
  } catch (error) {
    console.error('Update task error:', error);

    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error. Could not update task.'
    });
  }
};

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete task
 * @access  Private
 */
const deleteTask = async (req, res) => {
  try {
    // Find task and verify ownership
    const task = await Task.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or you do not have permission to delete it.'
      });
    }

    await task.destroy();

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Could not delete task.'
    });
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
};

