<template>
<div>
<h1>Empresas</h1>


<div style="margin-bottom:12px">
<input v-model="search" @keyup.enter="fetch()" placeholder="Buscar por nome ou CNPJ" />
<button @click="fetch">Buscar</button>
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
<button @click="remove(c.id)" style="margin-left:8px">Excluir</button>
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
import { ref, onMounted } from 'vue'
import CompanyService from '../services/CompanyService'


const companies = ref([])
const search = ref('')


async function fetch() {
try {
const params = {}
if (search.value) {
// tenta o parâmetro `name` e `text` (depende da API)
params.name = search.value
// params.text = search.value
}
const res = await CompanyService.list(params)
companies.value = res.data
} catch (err) {
console.error(err)
alert('Erro ao carregar empresas')
}
}


async function remove(id) {
if (!confirm('Confirma exclusão?')) return
try {
await CompanyService.delete(id)
fetch()
} catch (err) {
console.error(err)
alert('Erro ao excluir')
}
}


onMounted(fetch)
</script>