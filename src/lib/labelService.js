import API from './api'

export const LabelService = {
  // Get all labels for a project
  getProjectLabels: (projectId) => {
    return API.get(`/labels/project/${projectId}`).then(res => res.data)
  },

  // Create label
  createLabel: (name, color, projectId) => {
    return API.post('/labels', { name, color, projectId }).then(res => res.data)
  },

  // Update label
  updateLabel: (id, name, color) => {
    return API.patch(`/labels/${id}`, { name, color }).then(res => res.data)
  },

  // Delete label
  deleteLabel: (id) => {
    return API.delete(`/labels/${id}`).then(res => res.data)
  },
}
