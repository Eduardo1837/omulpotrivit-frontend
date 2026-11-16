<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

const router = useRouter();
const { register } = useAuth();

const name = ref('');
const email = ref('');
const phone = ref('');
const city = ref('');
const password = ref('');
const passwordConfirmation = ref('');
const error = ref('');
const loading = ref(false);

async function handleSubmit() {
  error.value = '';
  loading.value = true;
  try {
    await register({
      name: name.value,
      email: email.value,
      phone: phone.value || undefined,
      city: city.value || undefined,
      password: password.value,
      password_confirmation: passwordConfirmation.value,
    });
    await router.push('/');
  } catch (err: any) {
    const errors = err.response?.data?.errors;
    if (errors) {
      error.value = Object.values(errors).flat().join(' ');
    } else {
      error.value = err.response?.data?.message || 'Înregistrarea a eșuat.';
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="auth-card">
    <h1>Înregistrare</h1>
    <form @submit.prevent="handleSubmit" class="auth-form">
      <label>
        Nume complet
        <input v-model="name" type="text" required autocomplete="name" />
      </label>

      <label>
        Email
        <input v-model="email" type="email" required autocomplete="email" />
      </label>

      <label>
        Telefon (opțional)
        <input v-model="phone" type="tel" autocomplete="tel" />
      </label>

      <label>
        Oraș (opțional)
        <input v-model="city" type="text" />
      </label>

      <label>
        Parolă (minim 8 caractere)
        <input v-model="password" type="password" required minlength="8" autocomplete="new-password" />
      </label>

      <label>
        Confirmă parola
        <input v-model="passwordConfirmation" type="password" required minlength="8" autocomplete="new-password" />
      </label>

      <p v-if="error" class="error">{{ error }}</p>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Se creează contul...' : 'Creează cont' }}
      </button>
    </form>

    <p class="switch-link">
      Ai deja cont? <RouterLink to="/login">Autentifică-te</RouterLink>
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
