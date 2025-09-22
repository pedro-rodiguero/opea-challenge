<template>
  <div>
    <div class="company-list-search">
      <input v-model="search" @keyup.enter="onSearch" placeholder="Buscar por nome ou CNPJ" type="text" />
      <button @click="onSearch">Buscar</button>
      <router-link to="/companies/new">+ Nova Empresa</router-link>
    </div>

    <table class="company-list-table">
      <thead>
        <tr>
          <th>Nome</th>
          <th>Email</th>
          <th>CNPJ</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in companies" :key="c.id">
          <td>{{ c.name }}</td>
          <td>{{ c.email }}</td>
          <td>{{ c.cnpj }}</td>
          <td class="company-list-actions">
            <router-link :to="`/companies/${c.id}/edit`">Editar</router-link>
            <button @click="$emit('delete', c.id)">Excluir</button>
          </td>
        </tr>
        <tr v-if="companies.length===0">
          <td colspan="4">Nenhuma empresa encontrada.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  companies: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['search', 'delete'])

const search = ref('')

function onSearch() {
  emit('search', search.value)
}
</script>