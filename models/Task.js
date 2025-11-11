const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

/**
 * Task Model
 * Represents tasks created by users
 */
const Task = sequelize.define(
  'Task',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Title cannot be empty'
        },
        len: {
          args: [1, 255],
          msg: 'Title must be between 1 and 255 characters'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    priority: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'medium',
      validate: {
        isIn: {
          args: [['low', 'medium', 'high']],
          msg: 'Priority must be low, medium, or high'
        }
      }
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'end_date',
      validate: {
        isDate: {
          msg: 'End date must be a valid date'
        }
      }
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'updated_at'
    }
  },
  {
    tableName: 'tasks',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

module.exports = Task;

