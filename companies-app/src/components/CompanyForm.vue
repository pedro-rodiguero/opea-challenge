<template>
  <form class="company-form" @submit.prevent="submit">
    <div>
      <label>Nome</label><br />
      <input v-model="localForm.name" />
    </div>

    <div>
      <label>Email</label><br />
      <input v-model="localForm.email" type="email" />
    </div>

    <div>
      <label>CNPJ</label><br />
      <input v-model="localForm.cnpj" />
    </div>

    <div class="form-actions">
      <button type="submit">Salvar</button>
      <router-link to="/companies">Cancelar</router-link>
    </div>
  </form>
</template>

<script setup>
import { reactive, watch, toRefs } from 'vue'

// Props: o formulário recebe dados iniciais
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ name: '', email: '', cnpj: '' })
  }
})

// Emite eventos pro pai (submit, update:modelValue)
const emit = defineEmits(['update:modelValue', 'submit'])

const localForm = reactive({ ...props.modelValue })

// Sincroniza com o pai sempre que localForm mudar
watch(localForm, (val) => {
  emit('update:modelValue', val)
}, { deep: true })

function submit() {
  emit('submit', { ...localForm })
}
</script>