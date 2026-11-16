<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

const router = useRouter();
const { login } = useAuth();

const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

async function handleSubmit() {
  error.value = '';
  loading.value = true;
  try {
    await login({ email: email.value, password: password.value });
    await router.push('/');
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Autentificarea a eșuat.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="auth-card">
    <h1>Autentificare</h1>
    <form @submit.prevent="handleSubmit" class="auth-form">
      <label>
        Email
        <input v-model="email" type="email" required autocomplete="email" placeholder="nume@exemplu.ro" />
      </label>

      <label>
        Parolă
        <input v-model="password" type="password" required autocomplete="current-password" />
      </label>

      <p v-if="error" class="error">{{ error }}</p>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Se autentifică...' : 'Intră în cont' }}
      </button>
    </form>

    <p class="switch-link">
      Nu ai cont? <RouterLink to="/register">Creează un cont</RouterLink>
    </p>
  </div>
</template>

<style scoped>
.auth-card {
  max-width: 400px;
  margin: 40px auto;
  padding: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
}
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
}
input {
  padding: 8px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}
button {
  padding: 10px;
  border: none;
  border-radius: 6px;
  background: #2563eb;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.error {
  color: #b91c1c;
  font-size: 14px;
  margin: 0;
}
.switch-link {
  margin-top: 16px;
  font-size: 14px;
  text-align: center;
}
</style>
