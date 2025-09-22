<template>
  <div class="company-form-page">
    <h2>{{ isEdit ? 'Editar' : 'Nova' }} Empresa</h2>
    <CompanyForm v-model="form" @submit="submit" :api-errors="apiErrors" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CompanyService from '../services/CompanyService'
import CompanyForm from '../components/CompanyForm.vue'
import { formatCnpj } from '../utils/formatters.js'

const route = useRoute()
const router = useRouter()
const id = route.params.id
const isEdit = !!id

const form = ref({ name: '', email: '', cnpj: '' })
const apiErrors = ref({})

onMounted(async () => {
  if (isEdit) {
    try {
      const res = await CompanyService.get(id)
      const companyData = res.data
      // Format CNPJ for display
      if (companyData.cnpj) {
        companyData.cnpj = formatCnpj(companyData.cnpj)
      }
      Object.assign(form.value, companyData)
    } catch (err) {
      console.error(err)
      alert('Erro ao carregar empresa')
    }
  }
})

async function submit(data) {
  apiErrors.value = {} // Clear previous errors

  // 1. Check for duplicate Email
  const { data: byEmail } = await CompanyService.list({ email: data.email })
  if (byEmail.length > 0 && (!isEdit || byEmail[0].id !== Number(id))) {
    apiErrors.value.email = 'Este email já está em uso.'
  }

  // 2. Check for duplicate CNPJ
  const cnpjClean = data.cnpj.replace(/\D/g, '')
  const { data: byCnpj } = await CompanyService.list({ cnpj: cnpjClean })
  if (byCnpj.length > 0 && (!isEdit || byCnpj[0].id !== Number(id))) {
    apiErrors.value.cnpj = 'Este CNPJ já está cadastrado.'
  }

  if (Object.keys(apiErrors.value).length > 0) {
    return // Stop submission if there are errors
  }

  // 3. Save the data
  try {
    data.cnpj = cnpjClean // Save the CNPJ without formatting
    if (isEdit) {
      await CompanyService.update(id, data)
    } else {
      await CompanyService.create(data)
    }
    router.push('/companies')
  } catch (err) {
    console.error(err)
    alert('Erro ao salvar')
  }
}
</script>
