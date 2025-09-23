<template>
  <div class="company-form-page">
    <h2>{{ isEdit ? 'Editar' : 'Nova' }} Empresa</h2>
    <CompanyForm
      v-model="form"
      @submit="submit"
      :api-errors="apiErrors"
      :loading="loading"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import CompanyService from '../services/CompanyService'
import CompanyForm from '../components/CompanyForm.vue'
import { formatCnpj } from '../utils/formatters.js'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const id = route.params.id
const isEdit = !!id

const form = ref({ name: '', email: '', cnpj: '' })
const apiErrors = ref({})
const loading = ref(false)

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
      toast.error('Erro ao carregar empresa')
    }
  }
})

async function submit(data) {
  loading.value = true
  apiErrors.value = {} // Clear previous errors

  try {
    const cnpjClean = data.cnpj.replace(/\D/g, '')

    // 1. Perform duplicate checks in parallel
    const [emailRes, cnpjRes] = await Promise.all([
      CompanyService.list({ email: data.email }),
      CompanyService.list({ cnpj: cnpjClean })
    ])

    // Helper to check for duplicates, handling different API response structures
    const isDuplicate = (response, currentId) => {
      const items = response.data.companies || response.data
      return items.length > 0 && (!isEdit || items[0].id !== Number(currentId))
    }

    if (isDuplicate(emailRes, id)) {
      apiErrors.value.email = 'Este email já está em uso.'
    }

    if (isDuplicate(cnpjRes, id)) {
      apiErrors.value.cnpj = 'Este CNPJ já está cadastrado.'
    }

    if (Object.keys(apiErrors.value).length > 0) {
      return // Stop submission if there are errors
    }

    // 2. Save the data
    const payload = {
      name: data.name,
      email: data.email,
      cnpj: cnpjClean
    }

    if (isEdit) {
      await CompanyService.update(id, payload)
      toast.success('Empresa atualizada com sucesso!')
    } else {
      await CompanyService.create(payload)
      toast.success('Empresa criada com sucesso!')
    }
    router.push('/companies')
  } catch (err) {
    console.error(err)
    if (err.response && err.response.status === 409) {
      const errorMessage = err.response.data?.message || 'Recurso já existe.'
      if (errorMessage.toLowerCase().includes('email')) {
        apiErrors.value.email = 'Este email já está em uso.'
        toast.error('O email informado já está cadastrado.')
      } else if (errorMessage.toLowerCase().includes('cnpj')) {
        apiErrors.value.cnpj = 'Este CNPJ já está cadastrado.'
        toast.error('O CNPJ informado já está cadastrado.')
      } else {
        toast.error(errorMessage)
      }
    } else {
      toast.error('Erro ao salvar empresa.')
    }
  } finally {
    loading.value = false
  }
}
</script>
