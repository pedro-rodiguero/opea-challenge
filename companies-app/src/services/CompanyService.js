import axios from 'axios'


const baseURL = import.meta.env.VITE_API_BASE_URL || '/' // configurável via .env


const api = axios.create({
baseURL,
headers: { 'Content-Type': 'application/json' }
})


export default {
// params: { name: 'foo' } or { text: 'foo' }
list(params = {}) {
return api.get('companies', { params })
},
get(id) {
return api.get(`companies/${id}`)
},
create(payload) {
return api.post('companies', payload)
},
update(id, payload) {
return api.put(`companies/${id}`, payload)
},
delete(id) {
return api.delete(`companies/${id}`)
}
}