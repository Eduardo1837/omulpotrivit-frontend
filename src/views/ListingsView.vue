<script setup lang="ts">
import { onMounted, ref } from 'vue';
import api from '@/services/api';
import { useAuth } from '@/composables/useAuth';

interface ListingItem {
  id: number;
  titlu: string;
  descriere: string;
  pret_afisat: string;
  tip_pret: string;
  oras: string;
  categorie: string;
  este_promovat: boolean;
  status: string;
}

const { isAuthenticated } = useAuth();
const listings = ref<ListingItem[]>([]);
const loading = ref(true);
const error = ref('');

onMounted(async () => {
  try {
    const response = await api.get('/listings');
    listings.value = Array.isArray(response.data) ? response.data : response.data.data ?? [];
  } catch {
    error.value = 'Nu s-au putut încărca anunțurile.';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <!-- Page Header -->
  <div class="bg-white border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 class="font-semibold text-2xl text-gray-800 leading-tight">
          Toate Anunțurile
        </h2>
        <p class="text-sm text-gray-500 mt-1">
          Descoperă meșteri și servicii verificate din comunitatea noastră.
        </p>
      </div>

      <RouterLink
        v-if="isAuthenticated"
        to="/listings/create"
        class="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg text-sm shadow-sm transition self-start sm:self-auto"
      >
        + Publică Anunț
      </RouterLink>
      <RouterLink
        v-else
        to="/login"
        class="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg text-sm shadow-sm transition self-start sm:self-auto"
      >
        Autentificare pentru a posta
      </RouterLink>
    </div>
  </div>

  <!-- Listings Grid -->
  <div class="py-10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <p v-if="loading" class="text-gray-500">Se încarcă anunțurile...</p>
      <p v-else-if="error" class="text-red-600 text-sm">{{ error }}</p>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <template v-if="listings.length > 0">
          <div
            v-for="item in listings"
            :key="item.id"
            class="bg-white rounded-xl shadow-sm border border-gray-200/80 overflow-hidden hover:shadow-md transition flex flex-col justify-between"
          >
            <div class="p-6">
              <div class="flex items-center justify-between gap-2 mb-3">
                <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">
                  {{ item.categorie }}
                </span>
                <span
                  v-if="item.este_promovat"
                  class="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1"
                >
                  ★ Promovat
                </span>
              </div>

              <h3 class="text-lg font-bold text-gray-900 line-clamp-1 hover:text-indigo-600 transition">
                <RouterLink :to="`/listings/${item.id}`">
                  {{ item.titlu }}
                </RouterLink>
              </h3>

              <p class="text-sm text-gray-600 mt-2 line-clamp-3 leading-relaxed">
                {{ item.descriere }}
              </p>

              <div class="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span class="flex items-center gap-1">
                  <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {{ item.oras }}
                </span>
                <span class="font-semibold text-gray-700 capitalize">
                  {{ item.tip_pret }}
                </span>
              </div>
            </div>

            <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <div>
                <span class="text-xs text-gray-400 block font-medium">Preț estimat</span>
                <span class="text-lg font-black text-indigo-600">{{ item.pret_afisat }}</span>
              </div>
              <RouterLink
                :to="`/listings/${item.id}`"
                class="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 shadow-sm transition"
              >
                Detalii &rarr;
              </RouterLink>
            </div>
          </div>
        </template>

        <div
          v-else
          class="col-span-full bg-white rounded-xl p-12 text-center border border-gray-200"
        >
          <svg class="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <h4 class="text-lg font-semibold text-gray-800">Nu a fost găsit niciun anunț</h4>
          <p class="text-sm text-gray-500 mt-1">Fii primul care adaugă un anunț în această platformă!</p>
        </div>
      </div>
    </div>
  </div>
</template>
