<template>
<form @submit.prevent="submit">
<div>
<label>Nome</label><br />
<input v-model="form.name" />
</div>

<div>
<label>Email</label><br />
<input v-model="form.email" type="email" />
</div>

<div>
<label>CNPJ</label><br />
<input v-model="form.cnpj" />
</div>

<div style="margin-top:12px">
<button type="submit">Salvar</button>
<router-link to="/companies" style="margin-left:8px">Cancelar</router-link>
</div>
</form>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CompanyService from '../services/CompanyService'


const route = useRoute()
const router = useRouter()
const id = route.params.id
const isEdit = !!id


const form = ref({ name: '', email: '', cnpj: '' })


onMounted(async () => {
if (isEdit) {
try {
const res = await CompanyService.get(id)
// adapte conforme o shape que a API retorna
Object.assign(form.value, res.data)
} catch (err) {
console.error(err)
alert('Erro ao carregar empresa')
}
}
})


async function submit() {
// validação básica
if (!form.value.name || !form.value.email || !form.value.cnpj) {
alert('Preencha todos os campos')
return
}


try {
if (isEdit) {
await CompanyService.update(id, form.value)
} else {
await CompanyService.create(form.value)
}
router.push('/companies')
} catch (err) {
console.error(err)
alert('Erro ao salvar')
}
}
</script>