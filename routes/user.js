const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Task = require('../models/task');

// Utility function to build query options
const buildQueryOptions = (req) => {
  const options = {};
  if (req.query.where) options.where = JSON.parse(req.query.where);
  if (req.query.sort) options.sort = JSON.parse(req.query.sort);
  if (req.query.select) options.select = JSON.parse(req.query.select);
  if (req.query.skip) options.skip = parseInt(req.query.skip);
  if (req.query.limit) options.limit = parseInt(req.query.limit) || 100;
  if (req.query.count) options.count = req.query.count === 'true';
  return options;
};

// GET /users
router.get('/', async (req, res) => {
  try {
    const options = buildQueryOptions(req);
    let query = User.find(options.where || {})
      .sort(options.sort)
      .select(options.select)
      .skip(options.skip)
      .limit(options.limit);
    if (options.count) {
      const count = await User.countDocuments(options.where || {});
      res.status(200).json({ message: 'OK', data: count });
    } else {
      const users = await query.exec();
      res.status(200).json({ message: 'OK', data: users });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', data: error.message });
  }
});

// POST /users
router.post('/', async (req, res) => {
    try {
      const { name, email, pendingTasks } = req.body;
      if (!name || !email) {
        return res.status(400).json({ message: 'Name and email are required', data: null });
      }
      const newUser = new User({ name, email, pendingTasks: pendingTasks || [] });
      await newUser.save();
      if (pendingTasks && pendingTasks.length > 0) {
        await Task.updateMany(
          { _id: { $in: pendingTasks } },
          { assignedUser: newUser._id.toString(), assignedUserName: newUser.name }
        );
      }
      res.status(201).json({ message: 'User Created', data: newUser });
    } catch (error) {
      res.status(500).json({ message: 'Server Error', data: error.message });
    }
  });

// GET /users/:id
router.get('/:id', async (req, res) => {
  try {
    const options = buildQueryOptions(req);
    const user = await User.findById(req.params.id).select(options.select || {}).exec();
    if (user) {
      res.status(200).json({ message: 'OK', data: user });
    } else {
      res.status(404).json({ message: 'User Not Found', data: null });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', data: error.message });
  }
});

// PUT /users/:id
router.put('/:id', async (req, res) => {
    try {
      const { name, email, pendingTasks } = req.body;
      if (!name || !email) {
        return res.status(400).json({ message: 'Name and email are required', data: null });
      }
      const existingUser = await User.findById(req.params.id);
      if (!existingUser) {
        return res.status(404).json({ message: 'User Not Found', data: null });
      }
      existingUser.name = name;
      existingUser.email = email;
      existingUser.pendingTasks = pendingTasks || [];
      await existingUser.save();
      const oldPendingTasks = existingUser.pendingTasks.map((taskId) => taskId.toString());
      const newPendingTasks = pendingTasks || [];
      const tasksToAdd = newPendingTasks.filter((id) => !oldPendingTasks.includes(id));
      const tasksToRemove = oldPendingTasks.filter((id) => !newPendingTasks.includes(id));
      await Task.updateMany(
        { _id: { $in: tasksToAdd } },
        { assignedUser: existingUser._id.toString(), assignedUserName: existingUser.name }
      );
      await Task.updateMany(
        { _id: { $in: tasksToRemove } },
        { assignedUser: '', assignedUserName: 'unassigned' }
      );
      res.status(200).json({ message: 'User Updated', data: existingUser });
    } catch (error) {
      res.status(500).json({ message: 'Server Error', data: error.message });
    }
  });

// DELETE /users/:id
router.delete('/:id', async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (user) {
        await Task.updateMany(
          { assignedUser: user._id.toString() },
          { assignedUser: '', assignedUserName: 'unassigned' }
        );
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'User Deleted', data: null });
      } else {
        res.status(404).json({ message: 'User Not Found', data: null });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Server Error', data: error.message });
    }
  });

module.exports = router;