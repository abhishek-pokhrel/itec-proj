const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Attachment = require('../models/Attachment');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

// Upload attachment
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    const { taskId } = req.body;

    if (!taskId || !req.file) {
      return res.status(400).json({ message: 'Task ID and file required' });
    }

    // Verify task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const attachment = new Attachment({
      taskId,
      userId: req.userId,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      fileUrl: `/uploads/${req.file.filename}`,
    });

    await attachment.save();
    await attachment.populate('userId', 'name email');

    res.json(attachment);
  } catch (error) {
    res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
});

// Get attachments for a task
router.get('/task/:taskId', auth, async (req, res) => {
  try {
    const attachments = await Attachment.find({ taskId: req.params.taskId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json(attachments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attachments', error: error.message });
  }
});

// Delete attachment
router.delete('/:id', auth, async (req, res) => {
  try {
    const attachment = await Attachment.findById(req.params.id);
    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    // Only uploader can delete
    if (attachment.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this attachment' });
    }

    // TODO: Delete file from disk
    await Attachment.findByIdAndDelete(req.params.id);

    res.json({ message: 'Attachment deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting attachment', error: error.message });
  }
});

module.exports = router;
