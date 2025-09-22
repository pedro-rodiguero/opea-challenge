<template>
  <div class="companies-page">
    <h1>Empresas</h1>
    <CompanyList
      :companies="companies"
      @search="fetch"
      @delete="remove"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import CompanyService from '../services/CompanyService'
import CompanyList from '../components/CompanyList.vue'

const companies = ref([])

async function fetch(query = '') {
  try {
    const params = {}
    if (query) params.name = query
    const res = await CompanyService.list(params)
    companies.value = res.data
  } catch (err) {
    console.error(err)
    alert('Erro ao carregar empresas')
  }
}

async function remove(id) {
  if (!confirm('Confirma exclusão?')) return
  try {
    await CompanyService.delete(id)
    fetch()
  } catch (err) {
    console.error(err)
    alert('Erro ao excluir')
  }
}

onMounted(fetch)
</script>
