<template>
  <div class="company-form-page">
    <h2>Editar Empresa</h2>
    <CompanyForm
      v-model="form"
      @submit="submit"
      :api-errors="apiErrors"
      :loading="loading"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import CompanyService from '../services/CompanyService'
import CompanyForm from '../components/CompanyForm.vue'
import { formatCnpj } from '../utils/formatters.js'

// Helper for debouncing to prevent excessive API calls
function debounce(fn, delay) {
  let timeoutId
  return function(...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn.apply(this, args), delay)
  }
}

const route = useRoute()
const router = useRouter()
const toast = useToast()
const id = route.params.id

const form = ref({ name: '', email: '', cnpj: '' })
const apiErrors = ref({})
const originalData = ref({ name: '', email: '', cnpj: '' })
const loading = ref(false)

onMounted(async () => {
  try {
    const { data: fetchedData } = await CompanyService.get(id)

    originalData.value = { ...fetchedData }

    form.value = {
      ...fetchedData,
      cnpj: fetchedData.cnpj ? formatCnpj(fetchedData.cnpj) : ''
    }
  } catch (err) {
    console.error(err)
    toast.error('Erro ao carregar dados da empresa.')
    router.push('/companies')
  }
})

/**
 * Performs API-based validation for a given field (e.g., checking for uniqueness).
 */
async function validateField(field, value) {
  // Clear previous API error for this field before re-validating
  delete apiErrors.value[field]

  if (!value) {
    // The "required" validation is handled by the form component.
    return;
  }

  try {
    if (field === 'email') {
      const { data } = await CompanyService.list({ email: value })
      const companies = data.companies || data
      if (companies.length > 0 && String(companies[0].id) !== id) {
        apiErrors.value.email = 'Este email já está em uso.'
      }
    }

    if (field === 'cnpj') {
      const cleanCnpj = value.replace(/\D/g, '')
      if (cleanCnpj.length < 14) return // Avoids query before the user finishes typing

      const { data } = await CompanyService.list({ cnpj: cleanCnpj })
      const companies = data.companies || data
      if (companies.length > 0 && String(companies[0].id) !== id) {
        apiErrors.value.cnpj = 'Este CNPJ já está cadastrado.'
      }
    }
  } catch (err) {
    console.error(`Erro ao validar ${field}:`, err)
    toast.error(`Erro ao validar ${field}.`)
  }
}

/**
 * Reactive watchers with debounce for better performance and user experience.
 */
const debouncedValidateEmail = debounce((newVal) => validateField('email', newVal), 500)
const debouncedValidateCnpj = debounce((newVal) => validateField('cnpj', newVal), 500)

watch(() => form.value.email, (newVal, oldVal) => {
  if (newVal !== oldVal) debouncedValidateEmail(newVal)
})

watch(() => form.value.cnpj, (newVal, oldVal) => {
  if (newVal !== oldVal) debouncedValidateCnpj(newVal)
})

async function submit(data) {
  loading.value = true
  // Clear errors before final validation
  apiErrors.value = {}

  // Re-run validations on submit for robustness
  await Promise.all([
    validateField('email', data.email),
    validateField('cnpj', data.cnpj)
  ])

  // Check if any errors were set by the final validation
  if (Object.keys(apiErrors.value).length > 0) {
    loading.value = false
    return
  }

  try {
    const cnpjClean = data.cnpj.replace(/\D/g, '')

    const payload = {
      name: data.name,
      email: data.email,
      cnpj: cnpjClean
    }

    await CompanyService.update(id, payload)
    toast.success('Empresa atualizada com sucesso!')
    router.push('/companies')
  } catch (err) {
    console.error(err)
    // Handle potential API errors on submit (e.g., server-side race condition)
    if (err.response && err.response.status === 409) {
        const message = err.response.data?.message || 'Conflito de dados.'
        toast.error(message)
    } else {
        toast.error('Erro ao atualizar empresa.')
    }
  } finally {
    loading.value = false
  }
}
</script>
