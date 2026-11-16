<script setup lang="ts">
import { onMounted, ref } from 'vue';
import api from '@/services/api';

interface ListingItem {
  id: number;
  title?: string;
  description?: string;
  price?: number | string;
}

const listings = ref<ListingItem[]>([]);
const loading = ref(true);
const error = ref('');

onMounted(async () => {
  try {
    const response = await api.get('/listings');
    listings.value = Array.isArray(response.data) ? response.data : response.data.data ?? [];
  } catch {
    error.value = 'Nu s-au putut încărca anunțurile de la backend.';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <section class="home">
    <h1>Anunțuri OmulPotrivit</h1>
    <p v-if="loading">Se încarcă...</p>
    <p v-else-if="error" class="error">{{ error }}</p>
    <p v-else-if="listings.length === 0">Nu există anunțuri active momentan.</p>
    <ul v-else class="listing-list">
      <li v-for="item in listings" :key="item.id" class="listing-card">
        <strong>{{ item.title || `Anunț #${item.id}` }}</strong>
        <p v-if="item.description">{{ item.description }}</p>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.home {
  max-width: 800px;
  margin: 0 auto;
}
.error {
  color: #b91c1c;
}
.listing-list {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 12px;
}
.listing-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px 16px;
}
</style>
