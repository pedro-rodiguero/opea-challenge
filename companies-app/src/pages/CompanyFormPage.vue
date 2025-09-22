<template>
  <div class="company-form-page">
    <h2>{{ isEdit ? 'Editar' : 'Nova' }} Empresa</h2>
    <CompanyForm v-model="form" @submit="submit" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CompanyService from '../services/CompanyService'
import CompanyForm from '../components/CompanyForm.vue'

const route = useRoute()
const router = useRouter()
const id = route.params.id
const isEdit = !!id

const form = ref({ name: '', email: '', cnpj: '' })

onMounted(async () => {
  if (isEdit) {
    try {
      const res = await CompanyService.get(id)
      Object.assign(form.value, res.data)
    } catch (err) {
      console.error(err)
      alert('Erro ao carregar empresa')
    }
  }
})

async function submit(data) {
  try {
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
