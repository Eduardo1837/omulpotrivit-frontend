<script setup lang="ts">
import { onMounted, ref } from 'vue';
import api from '@/services/api';

interface CategoryItem {
  id: number;
  name?: string;
}

interface HomeListingItem {
  id: number;
  titlu?: string;
  descriere?: string;
  pret_afisat?: string;
  categorie?: string;
  oras?: string;
  este_promovat?: boolean;
}

const categories = ref<CategoryItem[]>([]);
const recentListings = ref<HomeListingItem[]>([]);
const loading = ref(true);

function truncate(text: string | undefined, limit = 80): string {
  const value = text || 'No description provided.';
  return value.length > limit ? `${value.slice(0, limit)}...` : value;
}

onMounted(async () => {
  try {
    const response = await api.get('/home');
    categories.value = response.data.categories ?? [];
    recentListings.value = response.data.recentListings ?? [];
  } catch {
    categories.value = [];
    recentListings.value = [];
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <!-- Hero Section -->
  <div class="bg-blue-600 py-20 px-4 sm:px-6 lg:px-8 text-center text-white">
    <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
      Find the best services &amp; products in your city.
    </h1>
    <p class="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
      Browse through hundreds of listings, read reviews, and connect directly with providers.
    </p>
    <RouterLink
      to="/listings"
      class="inline-block bg-white text-blue-600 font-bold text-lg px-8 py-3 rounded-full shadow-lg hover:bg-gray-100 transition"
    >
      Start Exploring
    </RouterLink>
  </div>

  <!-- Categories Section -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <h2 class="text-2xl font-bold text-gray-800 mb-6">Browse by Category</h2>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <template v-if="loading">
        <p class="text-gray-500 col-span-4">Loading categories...</p>
      </template>
      <template v-else-if="categories.length > 0">
        <div
          v-for="category in categories"
          :key="category.id"
          class="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center hover:shadow-md transition cursor-pointer"
        >
          <h3 class="font-semibold text-gray-800">
            {{ category.name || `Category ${category.id}` }}
          </h3>
        </div>
      </template>
      <template v-else>
        <p class="text-gray-500 col-span-4">No categories available yet.</p>
      </template>
    </div>
  </div>

  <!-- Recent Listings Section -->
  <div id="fresh-listings" class="bg-white py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Fresh Listings</h2>
        <RouterLink to="/listings" class="text-blue-600 hover:text-blue-800 font-medium">
          View all &rarr;
        </RouterLink>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <template v-if="loading">
          <p class="text-gray-500 col-span-3">Loading listings...</p>
        </template>
        <template v-else-if="recentListings.length > 0">
          <div
            v-for="listing in recentListings"
            :key="listing.id"
            class="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition flex flex-col"
          >
            <div class="h-48 bg-gray-200 flex items-center justify-center text-gray-400">
              <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div class="p-5 flex-1 flex flex-col">
              <div class="flex justify-between items-start mb-2 gap-2">
                <h3 class="text-lg font-bold text-gray-900">
                  {{ listing.titlu || `Listing #${listing.id}` }}
                </h3>
                <span class="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded shrink-0">
                  {{ listing.pret_afisat || '0.00 RON' }}
                </span>
              </div>
              <p class="text-gray-600 text-sm mb-4 flex-1">
                {{ truncate(listing.descriere, 80) }}
              </p>
              <RouterLink
                :to="`/listings/${listing.id}`"
                class="text-blue-600 hover:text-blue-800 text-sm font-semibold uppercase tracking-wider"
              >
                View Details
              </RouterLink>
            </div>
          </div>
        </template>
        <template v-else>
          <p class="text-gray-500 col-span-3">No listings available yet.</p>
        </template>
      </div>
    </div>
  </div>
</template>
