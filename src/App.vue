<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

const router = useRouter();
const { user, isAuthenticated, fetchUser, logout } = useAuth();
const currentYear = new Date().getFullYear();

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
  <div class="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans antialiased">
    <!-- Navigation Bar -->
    <nav class="bg-white border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <!-- Logo -->
            <div class="shrink-0 flex items-center">
              <RouterLink to="/" class="text-xl font-bold text-gray-800 tracking-tight">
                OmulPotrivit
              </RouterLink>
            </div>

            <!-- Navigation Links -->
            <div class="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex items-center">
              <RouterLink
                to="/"
                class="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 transition"
                exact-active-class="border-blue-600 text-gray-900"
              >
                Acasă
              </RouterLink>
              <RouterLink
                to="/listings"
                class="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 transition"
                active-class="border-blue-600 text-gray-900"
              >
                Anunțuri
              </RouterLink>
            </div>
          </div>

          <!-- Auth / Guest Links -->
          <div class="flex items-center space-x-4">
            <template v-if="isAuthenticated">
              <span class="text-sm font-medium text-gray-700">
                {{ user?.name || 'Contul meu' }}
              </span>
              <button
                type="button"
                @click="handleLogout"
                class="text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded-md transition cursor-pointer"
              >
                Deconectare
              </button>
            </template>
            <template v-else>
              <RouterLink
                to="/login"
                class="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2"
              >
                Log in
              </RouterLink>
              <RouterLink
                to="/register"
                class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md transition"
              >
                Register
              </RouterLink>
            </template>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="flex-1">
      <RouterView />
    </main>

    <!-- Footer -->
    <footer class="bg-gray-800 text-gray-300 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
        &copy; {{ currentYear }} OmulPotrivit. All rights reserved.
      </div>
    </footer>
  </div>
</template>
