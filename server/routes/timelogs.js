const express = require('express');
const router = express.Router();
const TimeLog = require('../models/TimeLog');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

// Log time for a task
router.post('/', auth, async (req, res) => {
  try {
    const { taskId, duration, note, date } = req.body;

    if (!taskId || !duration) {
      return res.status(400).json({ message: 'Task ID and duration required' });
    }

    // Verify task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const timeLog = new TimeLog({
      taskId,
      userId: req.userId,
      duration: parseInt(duration), // in minutes
      note: note || '',
      date: date ? new Date(date) : new Date(),
    });

    await timeLog.save();
    await timeLog.populate('userId', 'name email');

    // Update task's actual hours
    const totalMinutes = await TimeLog.aggregate([
      { $match: { taskId: task._id } },
      { $group: { _id: null, total: { $sum: '$duration' } } },
    ]);

    if (totalMinutes.length > 0) {
      task.actualHours = totalMinutes[0].total / 60;
      await task.save();
    }

    res.json(timeLog);
  } catch (error) {
    res.status(500).json({ message: 'Error logging time', error: error.message });
  }
});

// Get time logs for a task
router.get('/task/:taskId', auth, async (req, res) => {
  try {
    const timeLogs = await TimeLog.find({ taskId: req.params.taskId })
      .populate('userId', 'name email')
      .sort({ date: -1 });

    const totalMinutes = timeLogs.reduce((sum, log) => sum + log.duration, 0);

    res.json({
      logs: timeLogs,
      totalHours: (totalMinutes / 60).toFixed(2),
      totalMinutes,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching time logs', error: error.message });
  }
});

// Get user's time logs
router.get('/user/stats', auth, async (req, res) => {
  try {
    const timeLogs = await TimeLog.find({ userId: req.userId })
      .populate('taskId', 'title')
      .sort({ date: -1 });

    // Group by task
    const byTask = {};
    timeLogs.forEach((log) => {
      const taskId = log.taskId._id.toString();
      if (!byTask[taskId]) {
        byTask[taskId] = {
          taskId: log.taskId._id,
          taskTitle: log.taskId.title,
          logs: [],
          totalMinutes: 0,
        };
      }
      byTask[taskId].logs.push(log);
      byTask[taskId].totalMinutes += log.duration;
    });

    const stats = Object.values(byTask).map((task) => ({
      ...task,
      totalHours: (task.totalMinutes / 60).toFixed(2),
    }));

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching time logs', error: error.message });
  }
});

// Update time log
router.patch('/:id', auth, async (req, res) => {
  try {
    const timeLog = await TimeLog.findById(req.params.id);
    if (!timeLog) {
      return res.status(404).json({ message: 'Time log not found' });
    }

    // Only logger can edit
    if (timeLog.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this time log' });
    }

    timeLog.duration = req.body.duration || timeLog.duration;
    timeLog.note = req.body.note || timeLog.note;
    timeLog.date = req.body.date ? new Date(req.body.date) : timeLog.date;

    await timeLog.save();
    await timeLog.populate('userId', 'name email');

    // Update task's actual hours
    const totalMinutes = await TimeLog.aggregate([
      { $match: { taskId: timeLog.taskId } },
      { $group: { _id: null, total: { $sum: '$duration' } } },
    ]);

    const task = await Task.findById(timeLog.taskId);
    if (task && totalMinutes.length > 0) {
      task.actualHours = totalMinutes[0].total / 60;
      await task.save();
    }

    res.json(timeLog);
  } catch (error) {
    res.status(500).json({ message: 'Error updating time log', error: error.message });
  }
});

// Delete time log
router.delete('/:id', auth, async (req, res) => {
  try {
    const timeLog = await TimeLog.findById(req.params.id);
    if (!timeLog) {
      return res.status(404).json({ message: 'Time log not found' });
    }

    // Only logger can delete
    if (timeLog.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this time log' });
    }

    const taskId = timeLog.taskId;
    await TimeLog.findByIdAndDelete(req.params.id);

    // Update task's actual hours
    const totalMinutes = await TimeLog.aggregate([
      { $match: { taskId } },
      { $group: { _id: null, total: { $sum: '$duration' } } },
    ]);

    const task = await Task.findById(taskId);
    if (task) {
      task.actualHours = totalMinutes.length > 0 ? totalMinutes[0].total / 60 : 0;
      await task.save();
    }

    res.json({ message: 'Time log deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting time log', error: error.message });
  }
});

module.exports = router;
