<template>
  <div class="company-list">
    <!-- Barra de busca -->
    <div class="company-list-search">
      <div class="search-input-wrapper">
        <input
          v-model="search"
          @keyup.enter="onSearch"
          placeholder="Buscar empresa..."
          type="text"
        />
        <button @click="onSearch" class="btn-search">
          <img src="./assets/search-icon.svg" alt="Buscar" />
        </button>
      </div>
      <router-link to="/companies/new" class="btn-new">Adicionar Empresa</router-link>
    </div>

    <!-- Lista de empresas -->
    <div class="company-cards">
      <div
        v-for="c in companies"
        :key="c.id"
        class="company-card"
      >
        <div class="company-icon">
          <i class="fas fa-building"></i>
        </div>
        <div class="company-info">
          <h3>{{ c.name }}</h3>
          <p>CNPJ: {{ c.cnpj }} - Email: {{ c.email }}</p>
        </div>
        <div class="company-actions">
          <router-link :to="`/companies/${c.id}/edit`" class="btn-edit">Editar</router-link>
          <button @click="$emit('delete', c.id)" class="btn-delete">Excluir</button>
        </div>
      </div>

      <div v-if="companies.length === 0" class="no-results">
        Nenhuma empresa encontrada.
      </div>
    </div>
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