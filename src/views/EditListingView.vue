<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/services/api';

interface CategoryItem {
  id: number;
  name: string;
}

const route = useRoute();
const router = useRouter();
const listingId = route.params.id;

const categories = ref<CategoryItem[]>([]);
const title = ref('');
const description = ref('');
const price = ref<number | string>('');
const priceType = ref('fix');
const city = ref('');
const categoryId = ref<number | string>('');
const isFeatured = ref(false);

const loading = ref(true);
const submitting = ref(false);
const error = ref('');

onMounted(async () => {
  try {
    const [categoriesRes, listingRes] = await Promise.all([
      api.get('/categories'),
      api.get(`/my-listings/${listingId}`),
    ]);

    categories.value = Array.isArray(categoriesRes.data)
      ? categoriesRes.data
      : categoriesRes.data.data ?? [];

    const data = listingRes.data;
    title.value = data.title ?? '';
    description.value = data.description ?? '';
    price.value = data.price ?? '';
    priceType.value = data.priceType ?? 'fix';
    city.value = data.city ?? '';
    categoryId.value = data.category_id ?? '';
    isFeatured.value = Boolean(data.is_featured);
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Nu s-au putut încărca datele anunțului.';
  } finally {
    loading.value = false;
  }
});

async function handleSubmit() {
  error.value = '';
  submitting.value = true;
  try {
    await api.put(`/listings/${listingId}`, {
      title: title.value,
      description: description.value,
      price: Number(price.value),
      priceType: priceType.value,
      city: city.value,
      category_id: Number(categoryId.value),
      is_featured: isFeatured.value,
    });
    await router.push('/my-listings');
  } catch (err: any) {
    const errors = err.response?.data?.errors;
    if (errors) {
      error.value = Object.values(errors).flat().join(' ');
    } else {
      error.value = err.response?.data?.message || 'Nu s-a putut actualiza anunțul.';
    }
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <!-- Header -->
  <div class="bg-white border-b border-gray-200">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
      <div>
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
          Editează Anunțul
        </h2>
        <p v-if="title" class="text-xs text-gray-500 mt-0.5">{{ title }}</p>
      </div>
      <RouterLink
        to="/my-listings"
        class="text-sm font-semibold text-gray-600 hover:text-gray-900 transition"
      >
        &larr; Înapoi la Anunțurile Mele
      </RouterLink>
    </div>
  </div>

  <!-- Form -->
  <div class="py-10">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <p v-if="loading" class="text-gray-500">Se încarcă datele anunțului...</p>

      <template v-else>
        <div
          v-if="error"
          class="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm font-medium"
        >
          {{ error }}
        </div>

        <div class="bg-white overflow-hidden shadow-sm sm:rounded-xl border border-gray-200/80 p-6 md:p-8">
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <div>
              <label for="title" class="block text-sm font-bold text-gray-700 mb-1">
                Titlu Anunț *
              </label>
              <input
                id="title"
                v-model="title"
                type="text"
                required
                class="w-full border border-gray-300 rounded-lg shadow-sm px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label for="description" class="block text-sm font-bold text-gray-700 mb-1">
                Descriere detaliată *
              </label>
              <textarea
                id="description"
                v-model="description"
                rows="4"
                required
                class="w-full border border-gray-300 rounded-lg shadow-sm px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label for="price" class="block text-sm font-bold text-gray-700 mb-1">
                  Preț (RON) *
                </label>
                <input
                  id="price"
                  v-model="price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  class="w-full border border-gray-300 rounded-lg shadow-sm px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label for="priceType" class="block text-sm font-bold text-gray-700 mb-1">
                  Tip Preț *
                </label>
                <select
                  id="priceType"
                  v-model="priceType"
                  required
                  class="w-full border border-gray-300 rounded-lg shadow-sm px-3 py-2 text-sm bg-white focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="fix">Fix</option>
                  <option value="pe ora">Pe oră</option>
                  <option value="negociabil">Negociabil</option>
                </select>
              </div>

              <div>
                <label for="city" class="block text-sm font-bold text-gray-700 mb-1">
                  Oraș / Locație *
                </label>
                <input
                  id="city"
                  v-model="city"
                  type="text"
                  required
                  class="w-full border border-gray-300 rounded-lg shadow-sm px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label for="category_id" class="block text-sm font-bold text-gray-700 mb-1">
                Categorie *
              </label>
              <select
                id="category_id"
                v-model="categoryId"
                required
                class="w-full border border-gray-300 rounded-lg shadow-sm px-3 py-2 text-sm bg-white focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
              </select>
            </div>

            <div class="pt-2">
              <label class="inline-flex items-center gap-2 cursor-pointer">
                <input
                  v-model="isFeatured"
                  type="checkbox"
                  class="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                />
                <span class="text-sm font-medium text-gray-700">
                  Marchează ca Anunț Promovat (Featured)
                </span>
              </label>
            </div>

            <div class="flex items-center justify-between pt-6 border-t border-gray-100">
              <RouterLink
                to="/my-listings"
                class="text-sm font-semibold text-gray-600 hover:text-gray-900 transition"
              >
                Anulează
              </RouterLink>
              <button
                type="submit"
                :disabled="submitting"
                class="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm text-sm transition cursor-pointer disabled:opacity-50"
              >
                {{ submitting ? 'Se salvează...' : 'Salvează Modificările' }}
              </button>
            </div>
          </form>
        </div>
      </template>
    </div>
  </div>
</template>
