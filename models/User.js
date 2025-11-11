const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcrypt');

/**
 * User Model
 * Represents authenticated users in the system
 */
const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Name cannot be empty'
        },
        len: {
          args: [2, 100],
          msg: 'Name must be between 2 and 100 characters'
        }
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: {
        msg: 'Email already exists'
      },
      validate: {
        isEmail: {
          msg: 'Must be a valid email address'
        }
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: {
          args: [6, 255],
          msg: 'Password must be at least 6 characters'
        }
      }
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    }
  },
  {
    tableName: 'users',
    timestamps: false, // We manage createdAt manually
    hooks: {
      /**
       * Hash password before saving to database
       * Using bcrypt with 10 salt rounds for security
       */
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  }
);

/**
 * Compare entered password with hashed password in database
 * @param {string} enteredPassword - Plain text password from login
 * @returns {Promise<boolean>} True if passwords match
 */
User.prototype.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = User;

