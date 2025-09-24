import { createRouter, createWebHistory } from 'vue-router'
import CompaniesPage from '../pages/CompaniesPage.vue'
import CompanyCreatePage from '../pages/CompanyCreatePage.vue'
import CompanyEditPage from '../pages/CompanyEditPage.vue'


const routes = [
{ path: '/', redirect: '/opea-challenge/companies' },
{ path: '/opea-challenge/companies', component: CompaniesPage },
{ path: '/opea-challenge/companies/new', name: 'CompanyCreate', component: CompanyCreatePage },
{ path: '/opea-challenge/companies/:id/edit', name: 'CompanyEdit', component: CompanyEditPage }
]


const router = createRouter({
    history: createWebHistory(),
    routes
})


export default router