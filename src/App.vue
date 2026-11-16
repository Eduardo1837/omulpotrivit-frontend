<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

const router = useRouter();
const { user, isAuthenticated, fetchUser, logout } = useAuth();

onMounted(() => {
  if (isAuthenticated.value) {
    fetchUser();
  }
});

async function handleLogout() {
  await logout();
  await router.push('/login');
}
</script>

<template>
  <header class="navbar">
    <nav class="nav-inner">
      <RouterLink to="/" class="brand">OmulPotrivit</RouterLink>
      <div class="nav-links">
        <RouterLink to="/">Acasă</RouterLink>
        <template v-if="isAuthenticated">
          <span class="user-name">{{ user?.name || 'Contul meu' }}</span>
          <button type="button" @click="handleLogout" class="logout-btn">Deconectare</button>
        </template>
        <template v-else>
          <RouterLink to="/login">Autentificare</RouterLink>
          <RouterLink to="/register">Înregistrare</RouterLink>
        </template>
      </div>
    </nav>
  </header>

  <main class="container">
    <RouterView />
  </main>
</template>

<style scoped>
.navbar {
  border-bottom: 1px solid #e5e7eb;
  padding: 12px 20px;
}
.nav-inner {
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.brand {
  font-weight: 700;
  font-size: 18px;
  text-decoration: none;
  color: #111827;
}
.nav-links {
  display: flex;
  align-items: center;
  gap: 16px;
}
.nav-links a {
  text-decoration: none;
  color: #374151;
}
.nav-links a.router-link-active {
  color: #2563eb;
  font-weight: 600;
}
.user-name {
  font-size: 14px;
  color: #111827;
}
.logout-btn {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
}
.container {
  padding: 20px;
}
</style>
