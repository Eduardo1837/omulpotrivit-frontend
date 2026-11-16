<script setup lang="ts">
import { onMounted, ref } from 'vue';
import api from '@/services/api';

interface PlanItem {
  id: number;
  name: string;
  price?: number | string;
  maxItems?: number | null;
  max_items?: number | null;
  durationDays?: number | null;
}

interface MyListingItem {
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

const plans = ref<PlanItem[]>([]);
const listings = ref<MyListingItem[]>([]);
const selectedPlanId = ref<number | null>(null);
const loading = ref(true);
const busyId = ref<number | null>(null);

const feedback = ref<{ type: 'success' | 'error'; message: string } | null>(null);
const deleteTarget = ref<MyListingItem | null>(null);
const deleteConfirmText = ref('');

function planLimitLabel(plan: PlanItem): string {
  const max = plan.maxItems ?? plan.max_items;
  return max ? `Max ${max} anunț(uri)` : 'Anunțuri nelimitate';
}

function isListingActive(item: MyListingItem): boolean {
  return item.status.toLowerCase() === 'activ';
}

async function loadData() {
  loading.value = true;
  try {
    const [plansRes, listingsRes] = await Promise.all([
      api.get('/plans'),
      api.get('/my-listings'),
    ]);
    plans.value = Array.isArray(plansRes.data) ? plansRes.data : plansRes.data.data ?? [];
    listings.value = listingsRes.data.listings ?? [];
    selectedPlanId.value = listingsRes.data.activePlanId ?? plans.value[0]?.id ?? null;
  } catch {
    feedback.value = { type: 'error', message: 'Nu s-au putut încărca anunțurile tale.' };
  } finally {
    loading.value = false;
  }
}

async function applyPlan(listingId: number) {
  feedback.value = null;
  busyId.value = listingId;
  try {
    const { data } = await api.post(`/listings/${listingId}/promote`, {
      plan_id: selectedPlanId.value,
    });
    if (data.listing) {
      listings.value = listings.value.map((l) => (l.id === listingId ? data.listing : l));
    }
    feedback.value = { type: 'success', message: data.message || 'Plan aplicat cu succes.' };
  } catch (err: any) {
    feedback.value = {
      type: 'error',
      message: err.response?.data?.message || 'Nu s-a putut aplica planul.',
    };
  } finally {
    busyId.value = null;
  }
}

async function toggleStatus(listingId: number) {
  feedback.value = null;
  busyId.value = listingId;
  try {
    const { data } = await api.patch(`/listings/${listingId}/toggle-status`);
    if (data.listing) {
      listings.value = listings.value.map((l) => (l.id === listingId ? data.listing : l));
    }
    feedback.value = { type: 'success', message: data.message || 'Status actualizat.' };
  } catch (err: any) {
    feedback.value = {
      type: 'error',
      message: err.response?.data?.message || 'Nu s-a putut actualiza statusul.',
    };
  } finally {
    busyId.value = null;
  }
}

function openDeleteModal(item: MyListingItem) {
  deleteTarget.value = item;
  deleteConfirmText.value = '';
}

async function confirmDelete() {
  if (!deleteTarget.value) return;
  const targetId = deleteTarget.value.id;
  busyId.value = targetId;
  feedback.value = null;
  try {
    await api.delete(`/listings/${targetId}`, {
      data: { confirm_delete: deleteConfirmText.value.trim() },
    });
    listings.value = listings.value.filter((l) => l.id !== targetId);
    feedback.value = { type: 'success', message: 'Anunțul a fost șters.' };
    deleteTarget.value = null;
  } catch (err: any) {
    feedback.value = {
      type: 'error',
      message: err.response?.data?.message || 'Nu s-a putut șterge anunțul.',
    };
  } finally {
    busyId.value = null;
  }
}

onMounted(loadData);
</script>

<template>
  <!-- Header -->
  <div class="bg-white border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 class="font-semibold text-2xl text-gray-800 leading-tight">
          Anunțurile Mele
        </h2>
        <p class="text-sm text-gray-500 mt-1">
          Gestionează-ți serviciile publicate și consultă performanța acestora.
        </p>
      </div>

      <RouterLink
        to="/listings/create"
        class="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg text-sm shadow-sm transition self-start sm:self-auto"
      >
        + Publică Anunț Nou
      </RouterLink>
    </div>
  </div>

  <div class="py-10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
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

      <!-- Promotion Plans Section -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200/80 p-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <h3 class="text-base font-bold text-gray-900">Planuri de Promovare Disponibile</h3>
            <p class="text-xs text-gray-500">
              Selectează un plan (gratuit sau plătit), apoi apasă „Aplică Planul” pe oricare dintre anunțurile tale.
            </p>
          </div>
          <span
            v-if="selectedPlanId"
            class="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 self-start"
          >
            Plan selectat: {{ plans.find((p) => p.id === selectedPlanId)?.name }}
          </span>
        </div>

        <div v-if="loading" class="text-xs text-gray-400 py-4 text-center">
          Se încarcă planurile de promovare...
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            v-for="plan in plans"
            :key="plan.id"
            type="button"
            @click="selectedPlanId = plan.id"
            :class="[
              'text-left p-4 rounded-xl border transition cursor-pointer',
              selectedPlanId === plan.id
                ? 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-200'
                : 'border-gray-200 hover:border-gray-300 bg-white',
            ]"
          >
            <div class="flex items-center justify-between gap-2">
              <span class="font-bold text-gray-900 text-sm">{{ plan.name }}</span>
              <span class="text-xs font-semibold text-indigo-700">
                {{ Number(plan.price ?? 0) > 0 ? `${plan.price} RON` : 'Gratuit' }}
              </span>
            </div>
            <p class="text-xs text-gray-500 mt-1">{{ planLimitLabel(plan) }}</p>
          </button>
        </div>
      </div>

      <!-- User Listings -->
      <div v-if="loading" class="text-sm text-gray-500">Se încarcă anunțurile...</div>

      <div v-else-if="listings.length === 0" class="bg-white rounded-xl p-12 text-center border border-gray-200">
        <h4 class="text-lg font-semibold text-gray-800">Nu ai niciun anunț publicat încă</h4>
        <p class="text-sm text-gray-500 mt-1">Anunțurile tale vor apărea aici pentru gestionare și promovare.</p>
      </div>

      <div v-else class="space-y-6">
        <div
          v-for="listing in listings"
          :key="listing.id"
          class="bg-white rounded-xl shadow-sm border border-gray-200/80 overflow-hidden"
        >
          <div class="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div class="flex flex-wrap items-center gap-2 mb-2">
                <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                  {{ listing.categorie }}
                </span>

                <span
                  v-if="listing.este_promovat"
                  class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800"
                >
                  ★ Promovat (Plătit)
                </span>
                <span
                  v-else
                  class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600"
                >
                  Nepromovat (Plan Gratuit)
                </span>

                <span
                  :class="[
                    'text-xs font-medium px-2 py-0.5 rounded-full',
                    isListingActive(listing)
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-gray-100 text-gray-600',
                  ]"
                >
                  {{ listing.status }}
                </span>
              </div>

              <h3 class="text-xl font-bold text-gray-900">
                <RouterLink :to="`/listings/${listing.id}`" class="hover:text-indigo-600 transition">
                  {{ listing.titlu }}
                </RouterLink>
              </h3>

              <div class="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                <span>Oraș: <strong>{{ listing.oras }}</strong></span>
                <span>•</span>
                <span>Preț: <strong class="text-gray-800">{{ listing.pret_afisat }}</strong> ({{ listing.tip_pret }})</span>
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-2 shrink-0">
              <RouterLink
                :to="`/listings/${listing.id}/edit`"
                class="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition"
              >
                Editează
              </RouterLink>

              <button
                type="button"
                :disabled="busyId === listing.id"
                @click="applyPlan(listing.id)"
                class="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition cursor-pointer disabled:opacity-50"
              >
                Aplică Planul
              </button>

              <button
                type="button"
                :disabled="busyId === listing.id"
                @click="toggleStatus(listing.id)"
                :class="[
                  'px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer disabled:opacity-50',
                  isListingActive(listing)
                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200',
                ]"
              >
                {{ isListingActive(listing) ? 'Dezactivează' : 'Reactivează' }}
              </button>

              <button
                type="button"
                :disabled="busyId === listing.id"
                @click="openDeleteModal(listing)"
                title="Șterge permanent"
                class="inline-flex items-center justify-center w-8 h-8 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg transition cursor-pointer disabled:opacity-50"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Delete Confirmation Modal -->
  <div
    v-if="deleteTarget"
    class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
  >
    <div class="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
      <h3 class="text-lg font-bold text-gray-900">Confirmare ștergere</h3>
      <p class="text-sm text-gray-600">
        Ești sigur că vrei să ștergi anunțul <strong>{{ deleteTarget.titlu }}</strong>?
        Scrie <code>delete</code> pentru ștergere permanentă sau lasă gol pentru ștergere logică.
      </p>
      <input
        v-model="deleteConfirmText"
        type="text"
        placeholder="delete (opțional)"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
      />
      <div class="flex justify-end gap-2">
        <button
          type="button"
          @click="deleteTarget = null"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 cursor-pointer"
        >
          Anulează
        </button>
        <button
          type="button"
          :disabled="busyId === deleteTarget.id"
          @click="confirmDelete"
          class="px-4 py-2 text-sm font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700 cursor-pointer disabled:opacity-50"
        >
          Șterge
        </button>
      </div>
    </div>
  </div>
</template>
