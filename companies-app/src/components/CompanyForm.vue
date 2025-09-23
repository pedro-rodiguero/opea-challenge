<template>
  <form class="company-form" @submit.prevent="submit">
    <div>
      <label>Nome</label><br />
      <input v-model="localForm.name" @blur="touched.name = true" />
      <div v-if="errors.name" class="error-message">{{ errors.name }}</div>
    </div>

    <div>
      <label>Email</label><br />
      <input
        v-model="localForm.email"
        type="email"
        @blur="touched.email = true"
      />
      <div v-if="errors.email" class="error-message">{{ errors.email }}</div>
    </div>

    <div>
      <label>CNPJ</label><br />
      <input
        v-model="localForm.cnpj"
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
      <button @click="$router.push('/companies')">Cancelar</button>
    </div>
  </form>
</template>

<script setup>
import { reactive, watch, computed } from 'vue'
import { validateCnpj } from '../utils/validators'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ name: '', email: '', cnpj: '' })
  },
  apiErrors: {
    type: Object,
    default: () => ({})
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])

const localForm = reactive({ ...props.modelValue })
const touched = reactive({ name: false, email: false, cnpj: false })
const errors = reactive({ name: '', email: '', cnpj: '' })

watch(() => props.modelValue, (newVal) => {
  // Sync external modelValue changes with localForm
  Object.assign(localForm, newVal)
}, { deep: true })

watch(localForm, (val) => {
  emit('update:modelValue', val)
  validate()
}, { deep: true })

watch(() => props.apiErrors, (newErrors) => {
  Object.assign(errors, newErrors)
}, { deep: true })

const isNameValid = computed(() => !!localForm.name.trim())
const isEmailValid = computed(() => localForm.email.includes('@'))
const isCnpjValid = computed(() => validateCnpj(localForm.cnpj))

const isFormValid = computed(() => {
  return isNameValid.value && isEmailValid.value && isCnpjValid.value
})

function validate() {
  // Name
  if (touched.name && !isNameValid.value) {
    errors.name = 'O nome é obrigatório.'
  } else {
    errors.name = ''
  }

  // Email
  if (touched.email && localForm.email && !isEmailValid.value) {
    errors.email = 'O email deve ser válido.'
  } else if (!props.apiErrors.email) { // Clear api error if user changes the input
    errors.email = ''
  }

  // CNPJ
  if (touched.cnpj && localForm.cnpj && !isCnpjValid.value) {
    errors.cnpj = 'O CNPJ é inválido.'
  } else if (!props.apiErrors.cnpj) { // Clear api error if user changes the input
    errors.cnpj = ''
  }
}

function submit() {
  Object.keys(touched).forEach(key => touched[key] = true)
  validate()

  if (!isFormValid.value) {
    alert('Por favor, corrija os erros no formulário.')
    return
  }
  emit('submit', { ...localForm })
}

// CNPJ mask handler
function onCnpjInput(e) {
  let v = e.target.value.replace(/\D/g, '').slice(0, 14)
  v = v.replace(/^(\d{2})(\d)/, '$1.$2')
  v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
  v = v.replace(/\.(\d{3})(\d)/, '.$1/$2')
  v = v.replace(/(\d{4})(\d)/, '$1-$2')
  localForm.cnpj = v
}
</script>

<style scoped>
.error-message {
  color: #b00020;
  font-size: 0.9em;
  margin-top: 4px;
}

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