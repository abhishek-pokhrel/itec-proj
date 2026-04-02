import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Shield, User } from 'lucide-react';
import ProjectMemberService from '../lib/projectMemberService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';

const TeamMembers = ({ projectId }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberId, setNewMemberId] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('member');

  useEffect(() => {
    fetchMembers();
  }, [projectId]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await ProjectMemberService.getMembers(projectId);
      setMembers(data);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberId.trim()) return;

    try {
      const member = await ProjectMemberService.addMember(
        projectId,
        newMemberId,
        newMemberRole
      );
      setMembers([...members, member]);
      setNewMemberId('');
      setNewMemberRole('member');
      setShowAddMember(false);
    } catch (error) {
      console.error('Error adding member:', error);
      alert('Error adding member. Make sure the user ID is correct.');
    }
  };

  const handleUpdateRole = async (memberId, newRole) => {
    try {
      const updated = await ProjectMemberService.updateRole(
        projectId,
        memberId,
        newRole
      );
      setMembers(members.map((m) => (m._id === memberId ? updated : m)));
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (window.confirm('Remove this member?')) {
      try {
        await ProjectMemberService.removeMember(projectId, memberId);
        setMembers(members.filter((m) => m._id !== memberId));
      } catch (error) {
        console.error('Error removing member:', error);
      }
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800',
      member: 'bg-blue-100 text-blue-800',
      viewer: 'bg-slate-100 text-slate-800',
    };
    return colors[role] || colors.member;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-slate-600" />
          <h3 className="font-semibold text-gray-900">Team Members</h3>
          <span className="text-sm text-slate-500">({members.length})</span>
        </div>
        <Button
          onClick={() => setShowAddMember(!showAddMember)}
          className="text-sm flex items-center gap-1"
        >
          <Plus size={14} /> Add Member
        </Button>
      </div>

      {/* Add Member Form */}
      {showAddMember && (
        <Card className="bg-slate-50 p-4">
          <form onSubmit={handleAddMember} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                User ID
              </label>
              <Input
                value={newMemberId}
                onChange={(e) => setNewMemberId(e.target.value)}
                placeholder="Enter user ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Role
              </label>
              <select
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="text-sm flex-1">
                Add Member
              </Button>
              <button
                type="button"
                onClick={() => setShowAddMember(false)}
                className="px-3 py-2 text-sm text-slate-700 hover:bg-slate-200 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Members List */}
      {loading ? (
        <div className="text-center py-4 text-slate-500">Loading members...</div>
      ) : members.length === 0 ? (
        <div className="text-center py-4 text-slate-500">No members yet</div>
      ) : (
        <div className="space-y-2">
          {members.map((member) => (
            <Card key={member._id} className="p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-900 to-blue-900 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {member.userId.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {member.userId.name}
                    </p>
                    <p className="text-xs text-slate-500">{member.userId.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={member.role}
                    onChange={(e) =>
                      handleUpdateRole(member._id, e.target.value)
                    }
                    className={`text-xs px-2 py-1 rounded font-medium border-0 ${getRoleColor(
                      member.role
                    )}`}
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  <button
                    onClick={() => handleRemoveMember(member._id)}
                    className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamMembers;
