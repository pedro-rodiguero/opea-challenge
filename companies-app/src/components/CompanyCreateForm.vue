<template>
  <form class="company-form" @submit.prevent="submit">
    <div>
      <label>Nome</label><br />
      <input v-model="form.name" @blur="touched.name = true" />
      <div v-if="errors.name" class="error-message">{{ errors.name }}</div>
    </div>

    <div>
      <label>Email</label><br />
      <input
        v-model="form.email"
        type="email"
        @blur="touched.email = true"
      />
      <div v-if="errors.email" class="error-message">{{ errors.email }}</div>
    </div>

    <div>
      <label>CNPJ</label><br />
      <input
        v-model="form.cnpj"
        @input="onCnpjInput"
        @blur="touched.cnpj = true"
        maxlength="18"
        placeholder="00.000.000/0000-00"
      />
      <div v-if="errors.cnpj" class="error-message">{{ errors.cnpj }}</div>
    </div>

    <div class="form-actions">
      <button type="submit" :disabled="!isFormValid || loading">
        <span v-if="loading" class="spinner"></span>
        <span>{{ loading ? 'Salvando...' : 'Salvar' }}</span>
      </button>
      <button type="button" @click="$router.push('/companies')">Cancelar</button>
    </div>
  </form>
</template>

<script setup>
import { reactive, ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { validateCnpj } from '../utils/validators'
import CompanyService from '../services/CompanyService'

const router = useRouter()
const toast = useToast()

const form = reactive({ name: '', email: '', cnpj: '' })
const touched = reactive({ name: false, email: false, cnpj: false })
const errors = reactive({ name: '', email: '', cnpj: '' })
const apiErrors = ref({})
const loading = ref(false)

watch(form, () => {
  validate()
}, { deep: true })

watch(apiErrors, (newErrors) => {
  Object.assign(errors, newErrors)
}, { deep: true })

const isNameValid = computed(() => !!form.name.trim())
const isEmailValid = computed(() => form.email.includes('@'))
const isCnpjValid = computed(() => validateCnpj(form.cnpj))

const isFormValid = computed(() => {
  return isNameValid.value && isEmailValid.value && isCnpjValid.value && Object.values(apiErrors.value).every(e => !e)
})

function validate() {
  // Name
  if (touched.name && !isNameValid.value) {
    errors.name = 'O nome é obrigatório.'
  } else {
    errors.name = ''
  }

  // Email
  if (touched.email && form.email && !isEmailValid.value) {
    errors.email = 'O email deve ser válido.'
  } else if (!apiErrors.value.email) {
    errors.email = ''
  }

  // CNPJ
  if (touched.cnpj && form.cnpj && !isCnpjValid.value) {
    errors.cnpj = 'O CNPJ é inválido.'
  } else if (!apiErrors.value.cnpj) {
    errors.cnpj = ''
  }
}

async function submit() {
  Object.keys(touched).forEach(key => touched[key] = true)
  validate()

  if (!isFormValid.value) {
    toast.error('Por favor, corrija os erros no formulário.')
    return
  }

  loading.value = true
  apiErrors.value = {}

  try {
    const cnpjClean = form.cnpj.replace(/\D/g, '')

    // Validação final antes do envio
    const [emailRes, cnpjRes] = await Promise.all([
      CompanyService.list({ email: form.email }),
      CompanyService.list({ cnpj: cnpjClean })
    ])

    const companiesByEmail = emailRes.data.companies || emailRes.data;
    if (companiesByEmail.some(c => c.email === form.email)) {
      apiErrors.value.email = 'Este email já está em uso.'
    }

    const companiesByCnpj = cnpjRes.data.companies || cnpjRes.data;
    if (companiesByCnpj.some(c => c.cnpj === cnpjClean)) {
      apiErrors.value.cnpj = 'Este CNPJ já está cadastrado.'
    }

    if (Object.keys(apiErrors.value).length > 0) {
      return // Para a submissão
    }

    const payload = { name: form.name, email: form.email, cnpj: cnpjClean }
    await CompanyService.create(payload)
    toast.success('Empresa criada com sucesso!')
    router.push('/companies')
  } catch (err) {
    console.error(err)
    toast.error('Erro ao criar empresa.')
  } finally {
    loading.value = false
  }
}

// CNPJ mask handler
function onCnpjInput(e) {
  let v = e.target.value.replace(/\D/g, '').slice(0, 14)
  v = v.replace(/^(\d{2})(\d)/, '$1.$2')
  v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
  v = v.replace(/\.(\d{3})(\d)/, '.$1/$2')
  v = v.replace(/(\d{4})(\d)/, '$1-$2')
  form.cnpj = v
}
</script>

<style scoped>
.form-actions button[type="submit"] {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.spinner {
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  display: inline-block;
  animation: spinner-spin 0.75s linear infinite;
}

@keyframes spinner-spin {
  to {
    transform: rotate(1turn);
  }
}
</style>