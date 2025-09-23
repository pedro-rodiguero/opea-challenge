import { createRouter, createWebHistory } from 'vue-router'
import CompaniesPage from '../pages/CompaniesPage.vue'
import CompanyCreatePage from '../pages/CompanyCreatePage.vue'
import CompanyEditPage from '../pages/CompanyEditPage.vue'


const routes = [
{ path: '/', redirect: '/companies' },
{ path: '/companies', component: CompaniesPage },
{ path: '/companies/new', name: 'CompanyCreate', component: CompanyCreatePage },
{ path: '/companies/:id/edit', name: 'CompanyEdit', component: CompanyEditPage }
]


const router = createRouter({
    history: createWebHistory(),
    routes
})


export default router