# App de Cadastro de Empresas

Este é um projeto simples de uma aplicação Vue 3 para gerenciar um CRUD (Criar, Ler, Atualizar, Deletar) de empresas. A aplicação foi desenvolvida como parte de um desafio e demonstra conceitos importantes de desenvolvimento front-end, como componentização, validação de formulários, comunicação com API e boas práticas de organização de código.

## Tecnologias Utilizadas

- **Vue 3** (com Composition API e `<script setup>`)
- **Vite** como ferramenta de build e servidor de desenvolvimento
- **Vue Router** para gerenciamento de rotas
- **Axios** para requisições HTTP à API
- **Vue Toastification** para notificações (toasts)

## Estrutura do Projeto

O projeto segue uma estrutura padrão para aplicações Vue:

- `src/components`: Contém os componentes reutilizáveis da aplicação.
  - `CompanyList.vue`: Exibe a lista de empresas, com opções de busca, edição e exclusão.
  - `CompanyCreateForm.vue`: Formulário dedicado à criação de novas empresas.
  - `CompanyEditForm.vue`: Formulário dedicado à edição de empresas existentes.
- `src/pages`: Contém as páginas da aplicação, que são renderizadas pelo Vue Router.
  - `CompaniesPage.vue`: Página principal que renderiza a `CompanyList`.
  - `CompanyCreatePage.vue`: Página que renderiza o `CompanyCreateForm`.
  - `CompanyEditPage.vue`: Página que renderiza o `CompanyEditForm`.
- `src/services`: Camada de serviço para comunicação com a API.
  - `CompanyService.js`: Encapsula todas as chamadas Axios relacionadas a empresas.
- `src/utils`: Funções utilitárias.
  - `formatters.js`: Funções para formatação de dados (ex: CNPJ).
  - `validators.js`: Funções para validação de dados (ex: CNPJ).
- `src/router`: Configuração das rotas da aplicação.

## Desafios e Soluções Implementadas

Durante o desenvolvimento, enfrentamos alguns desafios comuns que nos levaram a refatorar e melhorar a qualidade do código.

### 1. Refatoração: Separação dos Formulários de Criação e Edição

**Problema:** Inicialmente, tínhamos um único componente de formulário (`CompanyForm.vue`) e uma única página (`CompanyFormPage.vue`) que tentavam lidar tanto com a criação quanto com a edição de empresas. Isso resultou em um código complexo, cheio de condicionais (`v-if="isEdit"`) e com uma lógica de validação difícil de gerenciar.

**Solução:**

1.  **Separação de Páginas:** Primeiro, separamos a página única em `CompanyCreatePage.vue` e `CompanyEditPage.vue`. Isso já isolou a lógica de buscar dados para edição da lógica de um formulário em branco.

2.  **Separação de Formulários:** Em seguida, movemos a lógica de validação e submissão para dentro de componentes de formulário dedicados: `CompanyCreateForm.vue` e `CompanyEditForm.vue`.

    -   `CompanyCreateForm.vue` agora é totalmente autônomo: ele gerencia seu próprio estado, validação e a chamada `POST` para a API.
    -   `CompanyEditForm.vue` também é autônomo: ele recebe um `id`, busca os dados da empresa no `onMounted`, gerencia seu estado e validação, e faz a chamada `PUT` para a API.

**Resultado:** Essa refatoração tornou as páginas (`Create` e `Edit`) extremamente simples, servindo apenas como "cascas" para os formulários. Os componentes de formulário ficaram mais coesos, seguindo o **Princípio da Responsabilidade Única**, e a lógica de validação para cada caso de uso ficou muito mais clara e fácil de manter.

### 2. Lógica de Validação de Duplicidade na Edição

**Problema:** O formulário de edição acusava um erro de "e-mail já cadastrado" ou "CNPJ já cadastrado" mesmo quando o usuário não alterava esses campos. Isso acontecia porque a validação verificava a existência do dado na API e encontrava a própria empresa que estava sendo editada.

**Solução:**

-   **Guardar o Estado Original:** No `CompanyEditForm.vue`, ao buscar os dados da empresa no `onMounted`, guardamos uma cópia dos dados originais em uma variável `originalData`.
-   **Validação Condicional:** Na função `submit`, antes de fazer a chamada à API para verificar duplicidade, comparamos o valor atual do campo (e-mail ou CNPJ) com o valor original. A verificação de duplicidade só é disparada se o valor do campo foi **efetivamente alterado**.

```javascript
// Em CompanyEditForm.vue

// Só verifica duplicidade de e-mail se o campo foi alterado
if (form.email !== originalData.value.email) {
  // ... faz a chamada à API
}

// Só verifica duplicidade de CNPJ se o campo foi alterado
if (cnpjClean !== originalData.value.cnpj) {
  // ... faz a chamada à API
}
```

### 3. Melhoria na Experiência do Usuário (UX)

**Problema:** Após uma tentativa de salvar com um dado duplicado, a mensagem de erro permanecia no campo mesmo que o usuário começasse a corrigi-lo. O erro só desaparecia após uma nova tentativa de submissão.

**Solução:**

-   **`watchers` Reativos:** Adicionamos `watchers` nos campos de `email` e `cnpj` em ambos os formulários. Assim que o usuário digita algo nesses campos, o `watcher` correspondente é acionado e limpa a mensagem de erro da API (`apiErrors`).

```javascript
// Em CompanyCreateForm.vue e CompanyEditForm.vue

watch(() => form.email, () => {
  if (apiErrors.value.email) {
    apiErrors.value.email = ''
  }
})
```

**Resultado:** A interface agora fornece um feedback imediato ao usuário, melhorando a usabilidade do formulário.

### 4. Correção de Bug: Erro 400 (Bad Request) na Edição

**Problema:** Ao clicar em "Salvar" no formulário de edição sem ter feito nenhuma alteração, a aplicação enviava um `PUT` para a API com um payload vazio (`{}`), o que resultava em um erro `400 Bad Request`.

**Solução:**

-   **Verificação de Alterações:** Antes de fazer a chamada `CompanyService.update`, verificamos se algum dado foi de fato alterado. Se o `payload` a ser enviado estiver vazio, simplesmente exibimos uma notificação informativa ("Nenhuma alteração para salvar") e redirecionamos o usuário, evitando uma chamada desnecessária e errônea à API.

```javascript
// Em CompanyEditForm.vue

const hasChanged =
  form.name !== originalData.value.name ||
  form.email !== originalData.value.email ||
  cnpjClean !== originalData.value.cnpj

if (!hasChanged) {
  toast.info('Nenhuma alteração para salvar.')
  router.push('/companies')
  return
}

const payload = { /* ... */ }
await CompanyService.update(props.id, payload)
```

## Como Executar o Projeto

1.  **Instale as dependências:**
    ```bash
    npm install
    ```

2.  **Configure as variáveis de ambiente:**
    - Crie um arquivo `.env` na raiz do projeto.
    - Adicione a variável `VITE_API_BASE_URL` com a URL da sua API. Exemplo:
      ```
      VITE_API_BASE_URL=https://sua-api.com/dev/
      ```

3.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

A aplicação estará disponível em `http://localhost:5173`.

## Deploy no GitHub Pages

Para fazer o deploy deste projeto no GitHub Pages, siga os passos abaixo.

### 1. Configurar o `vite.config.js`

O arquivo `vite.config.js` na raiz do projeto (`companies-app/`) deve ter a propriedade `base` configurada com o nome do seu repositório.

```javascript
// vite.config.js
export default {
  // ...
  base: '/<NOME_DO_REPOSITORIO>/',
}
```

### 2. Configurar o Repositório no GitHub

1.  Vá para o seu repositório no GitHub.
2.  Clique em **Settings** (Configurações) > **Pages**.
3.  Na seção "Build and deployment", em "Source", selecione **GitHub Actions**.

Após configurar, a cada `push` na sua branch principal, a Action será executada, fará o build do projeto e o publicará no GitHub Pages. A URL será algo como `https://<SEU_USUARIO>.github.io/<NOME_DO_REPOSITORIO>/`.
