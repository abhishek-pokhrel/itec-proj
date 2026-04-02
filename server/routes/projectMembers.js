const express = require('express');
const router = express.Router({ mergeParams: true });
const ProjectMember = require('../models/ProjectMember');
const Project = require('../models/Project');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get project members
router.get('/', auth, async (req, res) => {
  try {
    const { projectId } = req.params;

    // Verify user is member of project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const members = await ProjectMember.find({ projectId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json(members);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching members', error: error.message });
  }
});

// Add member to project
router.post('/', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId, role } = req.body;

    // Verify project exists and user is admin
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const adminMember = await ProjectMember.findOne({
      projectId,
      userId: req.userId,
      role: 'admin',
    });

    if (!adminMember) {
      return res.status(403).json({ message: 'Only admins can add members' });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already member
    const existing = await ProjectMember.findOne({ projectId, userId });
    if (existing) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    const member = new ProjectMember({
      projectId,
      userId,
      role: role || 'member',
    });

    await member.save();
    await member.populate('userId', 'name email');

    res.json(member);
  } catch (error) {
    res.status(500).json({ message: 'Error adding member', error: error.message });
  }
});

// Update member role
router.patch('/:memberId', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { role } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Verify user is admin
    const adminMember = await ProjectMember.findOne({
      projectId,
      userId: req.userId,
      role: 'admin',
    });

    if (!adminMember) {
      return res.status(403).json({ message: 'Only admins can change roles' });
    }

    const member = await ProjectMember.findById(req.params.memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    member.role = role || member.role;
    await member.save();
    await member.populate('userId', 'name email');

    res.json(member);
  } catch (error) {
    res.status(500).json({ message: 'Error updating member', error: error.message });
  }
});

// Remove member from project
router.delete('/:memberId', auth, async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Verify user is admin
    const adminMember = await ProjectMember.findOne({
      projectId,
      userId: req.userId,
      role: 'admin',
    });

    if (!adminMember) {
      return res.status(403).json({ message: 'Only admins can remove members' });
    }

    const member = await ProjectMember.findById(req.params.memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Can't remove last admin
    if (member.role === 'admin') {
      const adminCount = await ProjectMember.countDocuments({
        projectId,
        role: 'admin',
      });

      if (adminCount === 1) {
        return res.status(400).json({ message: 'Project must have at least one admin' });
      }
    }

    await ProjectMember.findByIdAndDelete(req.params.memberId);

    res.json({ message: 'Member removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing member', error: error.message });
  }
});

module.exports = router;
