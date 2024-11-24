const express = require('express');
const router = express.Router();
const Task = require('../models/task');
const User = require('../models/user');

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

// GET /tasks
router.get('/', async (req, res) => {
  try {
    const options = buildQueryOptions(req);
    let query = Task.find(options.where || {})
      .sort(options.sort)
      .select(options.select)
      .skip(options.skip)
      .limit(options.limit);
    if (options.count) {
      const count = await Task.countDocuments(options.where || {});
      res.status(200).json({ message: 'OK', data: count });
    } else {
      const tasks = await query.exec();
      res.status(200).json({ message: 'OK', data: tasks });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', data: error.message });
  }
});

// POST /tasks
router.post('/', async (req, res) => {
  try {
    const { name, deadline, assignedUser, assignedUserName } = req.body;
    if (!name || !deadline) {
      return res.status(400).json({ message: 'Name and deadline are required', data: null });
    }
    const newTask = new Task(req.body);
    const savedTask = await newTask.save();
    if (assignedUser) {
      await User.findByIdAndUpdate(assignedUser, { $push: { pendingTasks: savedTask._id } });
    }
    res.status(201).json({ message: 'Task Created', data: savedTask });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', data: error.message });
  }
});

// GET /tasks/:id
router.get('/:id', async (req, res) => {
  try {
    const options = buildQueryOptions(req);
    const task = await Task.findById(req.params.id).select(options.select || {}).exec();
    if (task) {
      res.status(200).json({ message: 'OK', data: task });
    } else {
      res.status(404).json({ message: 'Task Not Found', data: null });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', data: error.message });
  }
});

// PUT /tasks/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, deadline, assignedUser, assignedUserName } = req.body;
    if (!name || !deadline) {
      return res.status(400).json({ message: 'Name and deadline are required', data: null });
    }
    const existingTask = await Task.findById(req.params.id);
    if (!existingTask) {
      return res.status(404).json({ message: 'Task Not Found', data: null });
    }
    if (existingTask.assignedUser !== assignedUser) {
      if (existingTask.assignedUser) {
        await User.findByIdAndUpdate(existingTask.assignedUser, {
          $pull: { pendingTasks: existingTask._id },
        });
      }
      if (assignedUser) {
        await User.findByIdAndUpdate(assignedUser, {
          $push: { pendingTasks: existingTask._id },
        });
      }
    }
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ message: 'Task Updated', data: updatedTask });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', data: error.message });
  }
});

// DELETE /tasks/:id
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (task) {
      if (task.assignedUser) {
        await User.findByIdAndUpdate(task.assignedUser, {
          $pull: { pendingTasks: task._id },
        });
      }
      await Task.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: 'Task Deleted', data: null });
    } else {
      res.status(404).json({ message: 'Task Not Found', data: null });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', data: error.message });
  }
});

module.exports = router;
