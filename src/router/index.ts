import { createRouter, createWebHistory } from 'vue-router';
import { authService } from '@/services/api';
import HomeView from '@/views/HomeView.vue';
import ListingsView from '@/views/ListingsView.vue';
import CreateListingView from '@/views/CreateListingView.vue';
import ListingDetailsView from '@/views/ListingDetailsView.vue';
import MyListingsView from '@/views/MyListingsView.vue';
import LoginView from '@/views/LoginView.vue';
import RegisterView from '@/views/RegisterView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/listings', name: 'listings', component: ListingsView },
    { path: '/listings/create', name: 'create-listing', component: CreateListingView, meta: { requiresAuth: true } },
    { path: '/listings/:id', name: 'listing-details', component: ListingDetailsView },
    { path: '/my-listings', name: 'my-listings', component: MyListingsView, meta: { requiresAuth: true } },
    { path: '/login', name: 'login', component: LoginView, meta: { guestOnly: true } },
    { path: '/register', name: 'register', component: RegisterView, meta: { guestOnly: true } },
  ],
});

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !authService.isAuthenticated()) {
    return { name: 'login' };
  }
  if (to.meta.guestOnly && authService.isAuthenticated()) {
    return { name: 'home' };
  }
});

export default router;
