import { computed, ref } from 'vue';
import { authService, type AuthUser, type LoginCredentials, type RegisterPayload } from '@/services/api';

const user = ref<AuthUser | null>(null);
const token = ref<string | null>(authService.getToken());

export function useAuth() {
  const isAuthenticated = computed(() => Boolean(token.value));

  async function fetchUser() {
    if (!token.value) {
      user.value = null;
      return null;
    }
    try {
      user.value = await authService.getUser();
      return user.value;
    } catch {
      token.value = null;
      user.value = null;
      return null;
    }
  }

  async function login(credentials: LoginCredentials) {
    const data = await authService.login(credentials);
    token.value = data.token;
    user.value = data.user;
    return data;
  }

  async function register(payload: RegisterPayload) {
    const data = await authService.register(payload);
    token.value = data.token;
    user.value = data.user;
    return data;
  }

  async function logout() {
    await authService.logout();
    token.value = null;
    user.value = null;
  }

  return {
    user,
    token,
    isAuthenticated,
    fetchUser,
    login,
    register,
    logout,
  };
}
