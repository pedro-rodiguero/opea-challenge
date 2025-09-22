<template>
  <div>
    <div style="margin-bottom:12px">
      <input v-model="search" @keyup.enter="onSearch" placeholder="Buscar por nome ou CNPJ" />
      <button @click="onSearch">Buscar</button>
      <router-link to="/companies/new" style="margin-left:8px">+ Nova Empresa</router-link>
    </div>

    <table border="1" cellpadding="8" cellspacing="0">
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
          <td>
            <router-link :to="`/companies/${c.id}/edit`">Editar</router-link>
            <button @click="$emit('delete', c.id)" style="margin-left:8px">Excluir</button>
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
