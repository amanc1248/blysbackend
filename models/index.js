const User = require('./User');
const Task = require('./Task');

/**
 * Define Model Associations
 * User has many Tasks, Task belongs to User
 */
User.hasMany(Task, {
  foreignKey: 'userId',
  as: 'tasks',
  onDelete: 'CASCADE'
});

Task.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

module.exports = {
  User,
  Task
};

