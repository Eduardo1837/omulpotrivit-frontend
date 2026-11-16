<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/services/api';
import { useAuth } from '@/composables/useAuth';

interface ReviewItem {
  id: number;
  author_id: number;
  author_name: string;
  rating: number;
  comment: string;
  created_at: string | null;
}

interface ListingDetail {
  id: number;
  titlu: string;
  descriere: string;
  pret_afisat: string;
  tip_pret: string;
  oras: string;
  categorie: string;
  este_promovat: boolean;
  status: string;
  reviews?: ReviewItem[];
}

const route = useRoute();
const { user, isAuthenticated, fetchUser } = useAuth();

const listing = ref<ListingDetail | null>(null);
const reviews = ref<ReviewItem[]>([]);
const loading = ref(true);
const error = ref('');

const feedback = ref<{ type: 'success' | 'error'; message: string } | null>(null);

// New review form
const newRating = ref(5);
const newComment = ref('');
const submittingReview = ref(false);

// Edit review state
const editingId = ref<number | null>(null);
const editRating = ref(5);
const editComment = ref('');
const savingEdit = ref(false);

const userHasReview = computed(() => {
  if (!isAuthenticated.value || !user.value) return false;
  return reviews.value.some((r) => r.author_id === user.value?.id);
});

const averageRating = computed(() => {
  if (reviews.value.length === 0) return '0.0';
  const sum = reviews.value.reduce((acc, r) => acc + r.rating, 0);
  return (sum / reviews.value.length).toFixed(1);
});

function renderStars(rating: number): string {
  const clamped = Math.max(0, Math.min(5, Math.round(rating)));
  return '★'.repeat(clamped) + '☆'.repeat(5 - clamped);
}

async function submitReview() {
  if (!listing.value) return;
  feedback.value = null;
  submittingReview.value = true;
  try {
    const { data } = await api.post('/reviews', {
      listing_id: listing.value.id,
      rating: newRating.value,
      comment: newComment.value,
    });
    if (data.review) {
      reviews.value.unshift(data.review);
    }
    newComment.value = '';
    newRating.value = 5;
    feedback.value = { type: 'success', message: data.message || 'Recenzia a fost adăugată!' };
  } catch (err: any) {
    feedback.value = {
      type: 'error',
      message: err.response?.data?.message || 'Nu s-a putut trimite recenzia.',
    };
  } finally {
    submittingReview.value = false;
  }
}

function startEdit(review: ReviewItem) {
  editingId.value = review.id;
  editRating.value = review.rating;
  editComment.value = review.comment;
}

async function saveEdit(reviewId: number) {
  feedback.value = null;
  savingEdit.value = true;
  try {
    const { data } = await api.put(`/reviews/${reviewId}`, {
      rating: editRating.value,
      comment: editComment.value,
    });
    if (data.review) {
      reviews.value = reviews.value.map((r) => (r.id === reviewId ? data.review : r));
    }
    editingId.value = null;
    feedback.value = { type: 'success', message: data.message || 'Recenzia a fost actualizată!' };
  } catch (err: any) {
    feedback.value = {
      type: 'error',
      message: err.response?.data?.message || 'Nu s-a putut actualiza recenzia.',
    };
  } finally {
    savingEdit.value = false;
  }
}

async function deleteReview(reviewId: number) {
  feedback.value = null;
  try {
    const { data } = await api.delete(`/reviews/${reviewId}`);
    reviews.value = reviews.value.filter((r) => r.id !== reviewId);
    feedback.value = { type: 'success', message: data.message || 'Recenzia a fost ștearsă.' };
  } catch (err: any) {
    feedback.value = {
      type: 'error',
      message: err.response?.data?.message || 'Nu s-a putut șterge recenzia.',
    };
  }
}

onMounted(async () => {
  if (isAuthenticated.value && !user.value) {
    await fetchUser();
  }
  try {
    const response = await api.get(`/listings/${route.params.id}`);
    listing.value = response.data;
    reviews.value = response.data.reviews ?? [];
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Anunțul nu a fost găsit.';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <!-- Header -->
  <div class="bg-white border-b border-gray-200">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
      <h2 class="font-semibold text-xl text-gray-800 leading-tight">
        Detalii Anunț
      </h2>
      <RouterLink
        to="/listings"
        class="inline-flex items-center text-sm font-semibold text-gray-600 hover:text-gray-900 transition"
      >
        &larr; Înapoi la toate anunțurile
      </RouterLink>
    </div>
  </div>

  <!-- Content -->
  <div class="py-10">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <!-- Feedback Banner -->
      <div
        v-if="feedback"
        :class="[
          'px-4 py-3 rounded-xl shadow-sm text-sm border',
          feedback.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800',
        ]"
      >
        {{ feedback.message }}
      </div>

      <p v-if="loading" class="text-gray-500">Se încarcă detaliile anunțului...</p>

      <div
        v-else-if="error || !listing"
        class="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl shadow-sm text-sm"
      >
        {{ error || 'Anunțul nu există.' }}
      </div>

      <template v-else>
        <!-- Listing Card -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200/80 overflow-hidden">
          <div class="p-6 md:p-8">
            <div class="flex flex-wrap items-center gap-2 mb-4">
              <span class="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700">
                {{ listing.categorie }}
              </span>
              <span
                v-if="listing.este_promovat"
                class="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800"
              >
                ★ Promovat
              </span>
              <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                Status: {{ listing.status }}
              </span>
            </div>

            <h1 class="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4">
              {{ listing.titlu }}
            </h1>

            <div class="bg-indigo-50/50 rounded-xl p-4 md:p-6 mb-6 flex flex-wrap items-center justify-between gap-4 border border-indigo-100">
              <div>
                <span class="text-xs font-bold uppercase tracking-wider text-gray-500 block">
                  Preț Solicitat
                </span>
                <span class="text-2xl md:text-3xl font-black text-indigo-600">
                  {{ listing.pret_afisat }}
                </span>
                <span class="text-xs text-gray-500 font-medium ml-1">
                  ({{ listing.tip_pret }})
                </span>
              </div>

              <div class="text-right">
                <span class="text-xs font-bold uppercase tracking-wider text-gray-500 block">
                  Locație
                </span>
                <span class="text-base font-bold text-gray-800 flex items-center gap-1">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {{ listing.oras }}
                </span>
              </div>
            </div>

            <div class="mb-8">
              <h3 class="text-sm font-bold uppercase text-gray-400 tracking-wider mb-2">
                Descriere Serviciu
              </h3>
              <p class="text-gray-700 whitespace-pre-line leading-relaxed text-base">
                {{ listing.descriere }}
              </p>
            </div>

            <div class="pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
              <RouterLink
                to="/listings"
                class="text-sm font-semibold text-gray-600 hover:text-gray-900 transition"
              >
                &larr; Înapoi la lista de anunțuri
              </RouterLink>

              <a
                v-if="isAuthenticated && !userHasReview"
                href="#leave-review"
                class="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm shadow-sm transition"
              >
                ★ Lasă o recenzie
              </a>
            </div>
          </div>
        </div>

        <!-- Reviews Section -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200/80 p-6 md:p-8 space-y-6">
          <div class="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h3 class="text-lg font-bold text-gray-900">
                Recenzii ({{ reviews.length }})
              </h3>
              <p v-if="reviews.length > 0" class="text-xs text-gray-500 mt-0.5">
                Rating mediu:
                <span class="font-semibold text-amber-600">★ {{ averageRating }} / 5</span>
              </p>
            </div>
          </div>

          <!-- Leave Review Form -->
          <form
            v-if="isAuthenticated && !userHasReview"
            id="leave-review"
            @submit.prevent="submitReview"
            class="bg-gray-50 rounded-xl p-4 md:p-5 border border-gray-200/80 space-y-4"
          >
            <div class="flex flex-wrap items-center justify-between gap-4">
              <span class="text-sm font-bold text-gray-800">Adaugă o recenzie</span>
              <div class="flex items-center gap-2">
                <label for="rating" class="text-xs font-semibold text-gray-600">Rating:</label>
                <select
                  id="rating"
                  v-model.number="newRating"
                  required
                  class="border border-gray-300 rounded-lg text-sm py-1 px-2.5 bg-white"
                >
                  <option :value="5">★★★★★ (5)</option>
                  <option :value="4">★★★★☆ (4)</option>
                  <option :value="3">★★★☆☆ (3)</option>
                  <option :value="2">★★☆☆☆ (2)</option>
                  <option :value="1">★☆☆☆☆ (1)</option>
                </select>
              </div>
            </div>

            <textarea
              v-model="newComment"
              rows="3"
              required
              placeholder="Scrie părerea ta despre acest serviciu..."
              class="w-full border border-gray-300 rounded-lg shadow-sm text-sm p-3 bg-white"
            />

            <div class="flex justify-end">
              <button
                type="submit"
                :disabled="submittingReview"
                class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm shadow-sm transition cursor-pointer disabled:opacity-50"
              >
                {{ submittingReview ? 'Se trimite...' : 'Trimite Recenzia' }}
              </button>
            </div>
          </form>

          <!-- Reviews List -->
          <div class="space-y-4">
            <p v-if="reviews.length === 0" class="text-sm text-gray-500">
              Acest anunț nu are recenzii încă. Fii primul care lasă o părere!
            </p>

            <div
              v-for="review in reviews"
              :key="review.id"
              class="border border-gray-100 rounded-xl p-4 bg-white"
            >
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <span class="font-semibold text-sm text-gray-900">{{ review.author_name }}</span>
                  <span class="text-xs text-amber-500 font-bold">
                    {{ renderStars(review.rating) }}
                  </span>
                </div>
                <span v-if="review.created_at" class="text-xs text-gray-400">
                  {{ review.created_at }}
                </span>
              </div>

              <template v-if="editingId === review.id">
                <div class="space-y-3 mt-2">
                  <select
                    v-model.number="editRating"
                    class="border border-gray-300 rounded-lg text-sm py-1 px-2.5 bg-white"
                  >
                    <option :value="5">★★★★★ (5)</option>
                    <option :value="4">★★★★☆ (4)</option>
                    <option :value="3">★★★☆☆ (3)</option>
                    <option :value="2">★★☆☆☆ (2)</option>
                    <option :value="1">★☆☆☆☆ (1)</option>
                  </select>
                  <textarea
                    v-model="editComment"
                    rows="2"
                    required
                    class="w-full border border-gray-300 rounded-lg text-sm p-2.5"
                  />
                  <div class="flex gap-2 justify-end">
                    <button
                      type="button"
                      @click="editingId = null"
                      class="px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer"
                    >
                      Anulează
                    </button>
                    <button
                      type="button"
                      :disabled="savingEdit"
                      @click="saveEdit(review.id)"
                      class="px-3 py-1 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer disabled:opacity-50"
                    >
                      Salvează
                    </button>
                  </div>
                </div>
              </template>

              <template v-else>
                <p class="text-sm text-gray-700 whitespace-pre-line">{{ review.comment }}</p>
                <div
                  v-if="isAuthenticated && user?.id === review.author_id"
                  class="mt-3 flex gap-3 text-xs"
                >
                  <button
                    type="button"
                    @click="startEdit(review)"
                    class="text-indigo-600 hover:underline font-semibold cursor-pointer"
                  >
                    Editează
                  </button>
                  <button
                    type="button"
                    @click="deleteReview(review.id)"
                    class="text-rose-600 hover:underline font-semibold cursor-pointer"
                  >
                    Șterge
                  </button>
                </div>
              </template>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
