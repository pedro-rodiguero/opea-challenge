<template>
  <div class="companies-page">
    <h1>Empresas</h1>
    <CompanyList
      :companies="companies"
      :loading="loading"
      :deleting-id="deletingId"
      @search="fetch"
      @delete="remove"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import CompanyService from '../services/CompanyService'
import CompanyList from '../components/CompanyList.vue'

const companies = ref([])
const toast = useToast()
const loading = ref(false)
const deletingId = ref(null)

async function fetch(query = '') {
  loading.value = true
  try {
    const params = {}
    if (query) params.name = query
    const res = await CompanyService.list(params)
    // Note: The API response structure was inconsistent.
    // The error indicates that `res.data` is an object. The array should be inside it.
    companies.value = res.data.companies || res.data
  } catch (err) {
    console.error(err)
    toast.error('Erro ao carregar empresas')
  } finally {
    loading.value = false
  }
}

async function remove(id) {
  if (!confirm('Confirma exclusão?')) return
  deletingId.value = id
  try {
    await CompanyService.delete(id)
    toast.success('Empresa excluída com sucesso!')
    await fetch()
  } catch (err) {
    console.error(err)
    toast.error('Erro ao excluir empresa.')
  } finally {
    deletingId.value = null
  }
}

onMounted(() => {
  fetch()
})

</script>
