<template>
  <div>
    <nav class="navbar">
      <router-link to="/">
        <img src="./assets/opea-logo.svg" alt="Opea Logo" style="height:32px; margin-right:16px;" />
      </router-link>
      <router-link to="/">Home</router-link>
      <router-link to="/companies">Empresas</router-link>
    </nav>

    <main style="padding:16px">
      <router-view />
    </main>
  </div>
</template>