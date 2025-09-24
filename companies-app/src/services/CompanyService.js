import initialCompanies from '/data/companies.json';

let companies = [...initialCompanies];
let nextId = companies.length > 0 ? Math.max(...companies.map(c => c.id)) + 1 : 1;

const api = {
    get(path, { params } = {}) {
        return new Promise(resolve => {
            let data = [...companies];
            if (params) {
                if (params.name) {
                    data = data.filter(c => c.name.toLowerCase().includes(params.name.toLowerCase()));
                }
                if (params.cnpj) {
                    data = data.filter(c => c.cnpj === params.cnpj.replace(/\D/g, ''));
                }
                if (params.email) {
                    data = data.filter(c => c.email.toLowerCase() === params.email.toLowerCase());
                }
            }
            if (path.includes('/companies/')) {
                const id = parseInt(path.split('/').pop());
                data = data.find(c => c.id === id);
            }
            setTimeout(() => resolve({ data: { companies: data } }), 200); // Simula latência da rede
        });
    },
    post(path, payload) {
        return new Promise(resolve => {
            const newCompany = { ...payload, id: nextId++ };
            companies.push(newCompany);
            setTimeout(() => resolve({ data: newCompany }), 200);
        });
    },
    put(path, payload) {
        return new Promise(resolve => {
            const id = parseInt(path.split('/').pop());
            const index = companies.findIndex(c => c.id === id);
            if (index !== -1) {
                companies[index] = { ...companies[index], ...payload };
                setTimeout(() => resolve({ data: companies[index] }), 200);
            }
        });
    },
    delete(path) {
        return new Promise(resolve => {
            const id = parseInt(path.split('/').pop());
            companies = companies.filter(c => c.id !== id);
            setTimeout(() => resolve({ status: 204 }), 200);
        });
    }
};

export default {
    // params: { name: 'foo' } or { text: 'foo' }
    list(params = {}) {
        return api.get('/companies', { params });
    },
    get(id) {
        return api.get(`/companies/${id}`);
    },
    create(payload) {
        return api.post('/companies', payload);
    },
    update(id, payload) {
        return api.put(`/companies/${id}`, payload);
    },
    delete(id) {
        return api.delete(`/companies/${id}`);
    }
}