import api from './api';

const ProjectMemberService = {
  getMembers: async (projectId) => {
    const response = await api.get(`/projects/${projectId}/members`);
    return response.data;
  },

  addMember: async (projectId, userId, role) => {
    const response = await api.post(`/projects/${projectId}/members`, {
      userId,
      role,
    });
    return response.data;
  },

  updateRole: async (projectId, memberId, role) => {
    const response = await api.patch(`/projects/${projectId}/members/${memberId}`, {
      role,
    });
    return response.data;
  },

  removeMember: async (projectId, memberId) => {
    const response = await api.delete(`/projects/${projectId}/members/${memberId}`);
    return response.data;
  },
};

export default ProjectMemberService;
