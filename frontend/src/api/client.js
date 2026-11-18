import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const client = axios.create({ baseURL: API_BASE })

client.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const ticketApi = {
  list:   ()         => client.get('/tickets').then(r => r.data),
  create: data       => client.post('/tickets', data).then(r => r.data),
  get:    id         => client.get(`/tickets/${id}`).then(r => r.data),
  update: (id, data) => client.patch(`/tickets/${id}`, data).then(r => r.data),
}

export const commentApi = {
  list: ticketId       => client.get(`/tickets/${ticketId}/comments`).then(r => r.data),
  add:  (ticketId, body) => client.post(`/tickets/${ticketId}/comments`, { body }).then(r => r.data),
}

export default client
