import API from './api'

export const ProjectService = {
  // Get all projects
  getAllProjects: async () => {
    try {
      const res = await API.get('/projects')
      return res.data
    } catch (err) {
      console.error('Error fetching projects:', err)
      throw err
    }
  },

  // Get single project
  getProject: async (projectId) => {
    try {
      const res = await API.get(`/projects/${projectId}`)
      return res.data
    } catch (err) {
      console.error('Error fetching project:', err)
      throw err
    }
  },

  // Create project
  createProject: async (projectData) => {
    try {
      const res = await API.post('/projects', projectData)
      return res.data
    } catch (err) {
      console.error('Error creating project:', err)
      throw err
    }
  },

  // Update project
  updateProject: async (projectId, projectData) => {
    try {
      const res = await API.put(`/projects/${projectId}`, projectData)
      return res.data
    } catch (err) {
      console.error('Error updating project:', err)
      throw err
    }
  },

  // Delete project
  deleteProject: async (projectId) => {
    try {
      const res = await API.delete(`/projects/${projectId}`)
      return res.data
    } catch (err) {
      console.error('Error deleting project:', err)
      throw err
    }
  },
}
