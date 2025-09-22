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
      <input
        v-model="localForm.cnpj"
        @input="onCnpjInput"
        maxlength="18"
        placeholder="00.000.000/0000-00"
      />
    </div>

    <div class="form-actions">
      <button type="submit">Salvar</button>
      <router-link to="/companies">Cancelar</router-link>
    </div>
  </form>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ name: '', email: '', cnpj: '' })
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])

const localForm = reactive({ ...props.modelValue })

watch(localForm, (val) => {
  emit('update:modelValue', val)
}, { deep: true })

function submit() {
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