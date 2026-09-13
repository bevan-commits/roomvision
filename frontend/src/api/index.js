import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

export const register = (data) => api.post('/auth/register', data)
export const login = (data) => api.post('/auth/login', data)
export const getMe = () => api.get('/auth/me')

export const createProject = (data) => api.post('/projects', data)
export const getProjects = () => api.get('/projects')
export const getProject = (id) => api.get(`/projects/${id}`)
export const deleteProject = (id) => api.delete(`/projects/${id}`)
export const getSuggestion = (id) => api.get(`/projects/${id}/suggestion`)

export const uploadImages = (projectId, files, imageType) => {
  const formData = new FormData()
  files.forEach((file) => formData.append('files', file))
  return api.post(`/upload/${projectId}?image_type=${imageType}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const analyzeProject = (projectId) => api.post(`/analyze/${projectId}`)

export default api
export const createLandscapeProject = (data) => api.post('/landscape/projects', data)
export const getLandscapeProjects = () => api.get('/landscape/projects')
export const getLandscapeProject = (id) => api.get(`/landscape/projects/${id}`)
export const deleteLandscapeProject = (id) => api.delete(`/landscape/projects/${id}`)
export const uploadLandscapeImages = (projectId, files, imageType) => {
  const formData = new FormData()
  files.forEach((file) => formData.append('files', file))
  return api.post(`/landscape/upload/${projectId}?image_type=${imageType}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
export const analyzeLandscapeProject = (projectId) => api.post(`/landscape/analyze/${projectId}`)
export const getLandscapeSuggestion = (id) => api.get(`/landscape/projects/${id}/suggestion`)