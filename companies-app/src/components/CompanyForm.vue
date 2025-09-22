<template>
  <form class="company-form" @submit.prevent="submit">
    <div>
      <label>Nome</label><br />
      <input v-model="localForm.name" />
    </div>

    <div>
      <label>Email</label><br />
      <input
        v-model="localForm.email"
        type="email"
        @blur="emailTouched = true"
      />
      <div
        v-if="emailTouched && localForm.email && !isEmailValid"
        style="color: #b00020; font-size: 0.9em; margin-top: 2px;"
      >
        O email deve conter "@"
      </div>
    </div>

    <div>
      <label>CNPJ</label><br />
      <input
        v-model="localForm.cnpj"
        @input="onCnpjInput"
        maxlength="18"
        placeholder="00.000.000/0000-00"
      />
    </div>

    <div class="form-actions">
      <button type="submit" :disabled="!isEmailValid">Salvar</button>
      <router-link to="/companies">Cancelar</router-link>
    </div>
  </form>
</template>

<script setup>
import { reactive, watch, computed, ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ name: '', email: '', cnpj: '' })
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])

const localForm = reactive({ ...props.modelValue })
const emailTouched = ref(false)

watch(localForm, (val) => {
  emit('update:modelValue', val)
}, { deep: true })

const isEmailValid = computed(() => localForm.email.includes('@'))

function submit() {
  emailTouched.value = true
  if (!isEmailValid.value) {
    alert('Por favor, insira um email válido contendo "@"')
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