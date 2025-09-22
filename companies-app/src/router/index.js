import { createRouter, createWebHistory } from 'vue-router'
import CompaniesPage from '../pages/CompaniesPage.vue'
import CompanyFormPage from '../pages/CompaniesForm.vue'


const routes = [
{ path: '/', redirect: '/companies' },
{ path: '/companies', component: CompaniesPage },
{ path: '/companies/new', component: CompanyFormPage },
{ path: '/companies/:id/edit', component: CompanyFormPage, props: true }
]


const router = createRouter({
history: createWebHistory(),
routes
})


export default router