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
    // 1. Check for duplicate Email
    const { data: emailRes } = await CompanyService.list({ email: data.email })
    const byEmail = emailRes.companies || emailRes
    if (byEmail.length > 0 && (!isEdit || byEmail[0].id !== Number(id))) {
      apiErrors.value.email = 'Este email já está em uso.'
    }

    // 2. Check for duplicate CNPJ
    const cnpjClean = data.cnpj.replace(/\D/g, '')
    const { data: cnpjRes } = await CompanyService.list({ cnpj: cnpjClean })
    const byCnpj = cnpjRes.companies || cnpjRes
    if (byCnpj.length > 0 && (!isEdit || byCnpj[0].id !== Number(id))) {
      apiErrors.value.cnpj = 'Este CNPJ já está cadastrado.'
    }

    if (Object.keys(apiErrors.value).length > 0) {
      return // Stop submission if there are errors
    }

    // 3. Save the data
    data.cnpj = cnpjClean // Save the CNPJ without formatting
    if (isEdit) {
      await CompanyService.update(id, data)
      toast.success('Empresa atualizada com sucesso!')
    } else {
      await CompanyService.create(data)
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
