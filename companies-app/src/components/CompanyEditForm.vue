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
import { reactive, ref, watch, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { validateCnpj } from '../utils/validators'
import { formatCnpj } from '../utils/formatters.js'
import CompanyService from '../services/CompanyService'

const props = defineProps({
  id: {
    type: String,
    required: true
  }
})

const router = useRouter()
const toast = useToast()

const form = reactive({ name: '', email: '', cnpj: '' })
const originalData = ref({ name: '', email: '', cnpj: '' })
const touched = reactive({ name: false, email: false, cnpj: false })
const errors = reactive({ name: '', email: '', cnpj: '' })
const apiErrors = ref({})
const loading = ref(false)

onMounted(async () => {
  try {
    const { data: fetchedData } = await CompanyService.get(props.id)
    originalData.value = { ...fetchedData }
    form.name = fetchedData.name
    form.email = fetchedData.email
    form.cnpj = fetchedData.cnpj ? formatCnpj(fetchedData.cnpj) : ''
  } catch (err) {
    console.error(err)
    toast.error('Erro ao carregar dados da empresa.')
    router.push('/companies')
  }
})

watch(form, () => {
  validate()
}, { deep: true })

// Clear API errors on input change
watch(() => form.email, () => {
  if (apiErrors.value.email) apiErrors.value.email = ''
})
watch(() => form.cnpj, () => {
  if (apiErrors.value.cnpj) apiErrors.value.cnpj = ''
})

watch(apiErrors, (newErrors) => {
  Object.assign(errors, newErrors)
}, { deep: true })

const isNameValid = computed(() => !!form.name.trim())
const isEmailValid = computed(() => form.email.includes('@'))
const isCnpjValid = computed(() => validateCnpj(form.cnpj))

const isFormValid = computed(() => {
  return (
    isNameValid.value &&
    isEmailValid.value &&
    isCnpjValid.value &&
    Object.values(apiErrors.value).every(e => !e)
  )
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

    // verifica duplicidade apenas se mudou
    if (form.email !== originalData.value.email) {
      const { data: emailRes } = await CompanyService.list({ email: form.email })
      const emailExists = (emailRes.companies || emailRes).some(
        c => c.email === form.email && String(c.id) !== props.id
      )
      if (emailExists) {
        apiErrors.value.email = 'Este email já está em uso.'
      }
    }

    if (cnpjClean !== originalData.value.cnpj) {
      const { data: cnpjRes } = await CompanyService.list({ cnpj: cnpjClean })
      const cnpjExists = (cnpjRes.companies || cnpjRes).some(
        c => c.cnpj === cnpjClean && String(c.id) !== props.id
      )
      if (cnpjExists) {
        apiErrors.value.cnpj = 'Este CNPJ já está cadastrado.'
      }
    }

    if (Object.keys(apiErrors.value).length > 0) {
      return
    }

    const hasChanged =
      form.name !== originalData.value.name ||
      form.email !== originalData.value.email ||
      cnpjClean !== originalData.value.cnpj

    if (!hasChanged) {
      toast.info('Nenhuma alteração para salvar.')
      router.push('/companies')
      return
    }

    const payload = {
      name: form.name,
      email: form.email,
      cnpj: cnpjClean
    }

    await CompanyService.update(props.id, payload)

    // sobrescreve originalData com os dados salvos
    originalData.value = {
      name: form.name,
      email: form.email,
      cnpj: cnpjClean
    }

    toast.success('Empresa atualizada com sucesso!')
    router.push('/companies')
  } catch (err) {
    console.error(err)
    toast.error('Erro ao atualizar empresa.')
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
