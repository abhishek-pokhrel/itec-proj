const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// Get user notifications
router.get('/', auth, async (req, res) => {
  try {
    const { unreadOnly } = req.query;
    const query = { userId: req.userId };

    if (unreadOnly === 'true') {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .populate('taskId', 'title')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      userId: req.userId,
      read: false,
    });

    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
});

// Mark notification as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Only recipient can mark as read
    if (notification.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    notification.read = true;
    notification.readAt = new Date();
    await notification.save();

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Error updating notification', error: error.message });
  }
});

// Mark all notifications as read
router.patch('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.userId, read: false },
      { read: true, readAt: new Date() }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notifications', error: error.message });
  }
});

// Delete notification
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Only recipient can delete
    if (notification.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Notification.findByIdAndDelete(req.params.id);

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting notification', error: error.message });
  }
});

// Clear all notifications
router.delete('/clear-all', auth, async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.userId });

    res.json({ message: 'All notifications cleared' });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing notifications', error: error.message });
  }
});

module.exports = router;
