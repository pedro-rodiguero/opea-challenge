<template>
  <div>
    <nav class="navbar">
      <img src="./assets/opea_logo.svg" alt="Opea Logo" style="height:32px; margin-right:16px;" />
      <a href="/">Home</a>
      <router-link to="/companies">Empresas</router-link>
    </nav>

    <main style="padding:16px">
      <router-view />
    </main>
  </div>
</template>