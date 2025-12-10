<template>
  <AuthLoadingScreen
    loading-title="Checking authentication..."
    loading-subtitle="Please wait while we verify your session"
    :progress-value="50"
    progress-text="Validating..."
    tip-text="Connecting to authentication service"
    :show-retry="false"
    :retrying="retrying"
    @retry="handleRetry"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useNextAuth } from '@/composables/useNextAuth';
import AuthLoadingScreen from '@/components/AuthLoadingScreen.vue';

const router = useRouter();
const { isLoaded, isSignedIn, validateSession } = useNextAuth();
const retrying = ref(false);

const redirectAfterAuth = () => {
  try {
    const target = sessionStorage.getItem('post_auth_redirect');
    if (target && target !== '/auth-loading') {
      sessionStorage.removeItem('post_auth_redirect');
      router.replace(target);
      return;
    }
  } catch (error) {
    console.warn('Unable to read post-auth redirect target', error);
  }
  router.replace('/dashboard');
};

const handleRetry = async () => {
  retrying.value = true;
  try {
    await validateSession();
    if (isSignedIn.value) {
      redirectAfterAuth();
    }
  } catch (error) {
    console.error('Retry failed:', error);
  } finally {
    retrying.value = false;
  }
};

const checkAuthentication = async () => {
  try {
    await validateSession();
    
    if (isLoaded.value && isSignedIn.value) {
      redirectAfterAuth();
    } else {
      console.log('Not authenticated, redirecting to login');
      router.push('/login');
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    router.push('/login');
  }
};

onMounted(() => {
  checkAuthentication();
});
</script>
