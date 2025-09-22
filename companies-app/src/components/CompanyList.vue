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
          <img src="../assets/icons/search-icon.svg" alt="Buscar" />
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
          <router-link :to="`/companies/${c.id}/edit`" class="action-icon" title="Editar">
            <img src="../assets/icons/edit.svg" alt="Editar" />
          </router-link>
          <button @click="$emit('delete', c.id)" class="action-icon" title="Excluir">
            <img src="../assets/icons/trash.svg" alt="Excluir" />
          </button>
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

<style scoped>
.company-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-end;
}

.action-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: transparent;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  text-decoration: none;
}

.action-icon:hover {
  background-color: #e9ecef;
}

.action-icon img {
  width: 16px;
  height: 16px;
}

button.action-icon {
  padding: 0;
}
</style>