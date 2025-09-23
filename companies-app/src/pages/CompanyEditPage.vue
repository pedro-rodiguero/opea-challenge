<template>
  <div class="company-form-page">
    <h2>Editar Empresa</h2>
    <CompanyEditForm :id="id" />
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import CompanyEditForm from '../components/CompanyEditForm.vue'

const route = useRoute()
const id = route.params.id
</script>