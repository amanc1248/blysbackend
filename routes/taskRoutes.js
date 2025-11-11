const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');
const {
  taskValidation,
  paginationValidation,
  validate
} = require('../utils/validation');
const { protect } = require('../middleware/authMiddleware');

/**
 * Task Routes
 * All routes require authentication
 */

// @route   GET /api/tasks
// @desc    Get all tasks for authenticated user with pagination
// @access  Private
router.get('/', protect, paginationValidation, validate, getTasks);

// @route   POST /api/tasks
// @desc    Create new task
// @access  Private
router.post('/', protect, taskValidation, validate, createTask);

// @route   GET /api/tasks/:id
// @desc    Get single task
// @access  Private
router.get('/:id', protect, getTask);

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private
router.put('/:id', protect, taskValidation, validate, updateTask);

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private
router.delete('/:id', protect, deleteTask);

module.exports = router;

