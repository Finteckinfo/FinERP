<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useTheme } from '@/composables/useTheme';
import ThemeToggle from '@/components/shared/ThemeToggle.vue';
import { supabase, isSupabaseOnly } from '@/services/supabase';
import Logo from '@/assets/images/logos/Logo.vue';

const router = useRouter();
const route = useRoute();
const { isDark } = useTheme();

// Determine if we're in login or register mode based on route
const isLoginMode = ref(route.path === '/login');

// Form state
const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');
const success = ref('');

// Computed
const formValid = computed(() => email.value && password.value);

// SUPABASE-ONLY MODE: Handle authentication locally
const handleSupabaseAuth = async () => {
  if (!isSupabaseOnly || !supabase) {
    console.error('[LoginPage] Supabase not configured');
    return;
  }

  loading.value = true;
  error.value = '';
  success.value = '';

  try {
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });

    if (authError) {
      error.value = authError.message;
      return;
    }

    if (data.user) {
      success.value = 'Login successful! Redirecting...';
      console.log('[LoginPage] Supabase login successful');

      // Redirect after successful login
      setTimeout(() => {
        const redirectPath = sessionStorage.getItem('post_auth_redirect') || '/dashboard/default';
        sessionStorage.removeItem('post_auth_redirect');
        router.push(redirectPath);
      }, 1500);
    }
  } catch (err: any) {
    console.error('[LoginPage] Supabase auth error:', err);
    error.value = err.message || 'Login failed';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  console.log('[LoginPage] Mounted');
});
</script>

<template>
  <div :class="{ 'dark-theme': isDark }" class="login-page">
    <!-- Theme Toggle - Floating Button -->
    <div class="theme-toggle-container">
      <ThemeToggle :show-label="false" size="small" />
    </div>
    
    <!-- SUPABASE-ONLY MODE: Show login form -->
    <div v-if="isSupabaseOnly" class="login-container">
      <!-- Left Side - Banner -->
      <div class="banner-column">
        <div class="banner-box">
          <div class="banner-overlay">
            <div class="banner-content">
              <h2 class="banner-title">
                Execute. Organize. <span class="accent-text">Collaborate.</span>
              </h2>
              <h3 class="banner-subtitle">
                Built for remote teams, project managers, and doers everywhere. Manage tasks, track progress, and collaborate without boundaries.
              </h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Side - Supabase Authentication Form -->
      <div class="form-column">
        <div class="form-container">
          <div class="form-header">
            <h1 class="form-title">{{ isLoginMode ? 'Welcome Back' : 'Create Account' }}</h1>
            <p class="form-subtitle">
              {{ isLoginMode ? 'Sign in to your FinPro account' : 'Create your FinPro account' }}
            </p>
          </div>

          <!-- Success Message -->
          <v-alert
            v-if="success"
            type="success"
            variant="tonal"
            class="mb-4"
            closable
            @click:close="success = ''"
          >
            {{ success }}
          </v-alert>

          <!-- Error Message -->
          <v-alert
            v-if="error"
            type="error"
            variant="tonal"
            class="mb-4"
            closable
            @click:close="error = ''"
          >
            {{ error }}
          </v-alert>

          <!-- Login Form -->
          <v-form @submit.prevent="handleSupabaseAuth" class="auth-form">
            <v-text-field
              v-model="email"
              label="Email"
              type="email"
              variant="outlined"
              density="comfortable"
              :rules="[v => !!v || 'Email is required', v => /.+@.+\..+/.test(v) || 'Email must be valid']"
              class="mb-4"
              :disabled="loading"
            />

            <v-text-field
              v-model="password"
              label="Password"
              type="password"
              variant="outlined"
              density="comfortable"
              :rules="[v => !!v || 'Password is required']"
              class="mb-6"
              :disabled="loading"
            />

            <v-btn
              type="submit"
              size="large"
              block
              :loading="loading"
              :disabled="!formValid || loading"
              class="auth-button"
            >
              {{ isLoginMode ? 'Sign In' : 'Create Account' }}
            </v-btn>
          </v-form>

          <!-- Toggle between login/register -->
          <div class="auth-toggle">
            <p class="toggle-text">
              {{ isLoginMode ? "Don't have an account?" : "Already have an account?" }}
              <router-link
                :to="isLoginMode ? '/register' : '/login'"
                class="toggle-link"
              >
                {{ isLoginMode ? 'Sign Up' : 'Sign In' }}
              </router-link>
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- LEGACY MODE: Show loading while redirecting to SSO -->
    <div v-else class="login-container">
      <!-- Left Side - Banner -->
      <div class="banner-column">
        <div class="banner-box">
          <div class="banner-overlay">
            <div class="banner-content">
              <h2 class="banner-title">
                Redirecting to Authentication...
              </h2>
              <h3 class="banner-subtitle">
                Please wait while we redirect you to the login page.
              </h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Side - Loading -->
      <div class="form-column">
        <div class="form-container">
          <div class="logo-section">
            <Logo />
          </div>
          
          <h1 class="form-title">
            {{ isLoginMode ? 'Login to continue' : 'Create your account' }}
          </h1>
          
          <!-- SSO Redirect Message -->
          <div class="redirect-container">
            <p class="redirect-message">
              Redirecting to {{ isLoginMode ? 'login' : 'signup' }}...
            </p>
            <p class="redirect-note">
              You will be redirected to the main authentication page.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: var(--v-theme-surface);
  position: relative;
  /* Allow scrolling on mobile */
}

.theme-toggle-container {
  position: fixed;
  top: 28px;
  right: 56px;
  z-index: 1000;
}

/* Mobile: Float at bottom center */
@media (max-width: 768px) {
  .theme-toggle-container {
    top: auto;
    bottom: 20px;
    left: 50%;
    right: auto;
    transform: translateX(-50%);
  }
}

@media (max-width: 480px) {
  .theme-toggle-container {
    bottom: 15px;
  }
}

.login-container {
  display: grid;
  grid-template-columns: 1.2fr 1.5fr;
  min-height: 100vh;
  width: 100%;
  position: relative;
}

// Left Side - Banner
.banner-column {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
}

.banner-box {
  width: 90%;
  height: 90%;
  background-image: url('/FinERP/images/banner3.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 20px;
  position: relative;
  margin-left: 100px;
}

.banner-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-content {
  width: 90%;
  max-width: 800px;
  margin: 0 auto;
  text-align: left;
  padding: 2rem;
}

.banner-title {
  color: white;
  font-size: 2rem;
  font-weight: 600;
  line-height: 1.3;
  margin-bottom: 2rem;
  word-wrap: break-word;
  overflow-wrap: break-word;
  
  @media (min-width: 768px) {
    font-size: 4rem;
  }
  
  @media (min-width: 1024px) {
    font-size: 4.5rem;
  }
}

.accent-text {
  color: var(--v-primary-base, #39B84C);
}

.banner-subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  line-height: 1.5;
  
  @media (min-width: 768px) {
    font-size: 1.125rem;
  }
}

// Right Side - Form
.form-column {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 50px;
  width: 90%;
  margin: 0 auto;
}

.form-container {
  width: 60%;
  margin: 0 auto;
}

.logo-section {
  margin: 2.5rem 0;
  text-align: left;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.form-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.25rem;
  color: var(--v-theme-on-surface);
}

.clerk-container {
  margin-top: 2rem;
}

// Dark theme adjustments - enhanced contrast for better readability
.dark-theme {
  background: #0f172a !important; /* Better background contrast */
  
  .banner-overlay {
    background: rgba(0, 0, 0, 0.7);
  }
  
  .form-title {
    color: var(--v-theme-on-surface);
  }
}

// Force the background color with higher specificity
body .login-page.dark-theme {
  background: #0f172a !important;
}

// Global dark theme background for the entire page
html.dark-theme,
body.dark-theme {
  background: #0f172a !important;
}

// Ensure the login page container also has the dark background
.login-page.dark-theme .login-container {
  background: #0f172a !important;
}

// Responsive design
@media (max-width: 1024px) {
  .login-container {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    min-height: auto;
    height: auto;
  }
  
  .banner-column {
    padding: 20px;
    height: 300px;
    min-height: 300px;
  }
  
  .banner-box {
    margin-left: 0;
    width: 100%;
    height: 100%;
  }
  
  .banner-content {
    width: 80%;
  }
  
  .banner-title {
    font-size: 2.5rem;
    margin-bottom: 1.5rem;
  }
  
  .form-column {
    padding: 20px;
    width: 100%;
    min-height: auto;
    height: auto;
  }
  
  .form-container {
    width: 100%;
    max-width: 400px;
  }
}

@media (max-width: 768px) {
  .theme-toggle-container {
    top: 20px;
    right: 20px;
  }
  
  .banner-column {
    height: 250px;
    min-height: 250px;
    padding: 15px;
  }
  
  .banner-title {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
  
  .banner-subtitle {
    font-size: 0.875rem;
  }
  
  .form-column {
    padding: 15px;
    min-height: auto;
    height: auto;
  }
  
  .form-container {
    max-width: 100%;
  }
  
  .logo-section {
    margin: 1.5rem 0;
  }
  
  .form-title {
    font-size: 1.25rem;
    margin-bottom: 1rem;
  }
  
  .clerk-container {
    margin-top: 1.5rem;
  }
}

@media (max-width: 480px) {
  .banner-column {
    height: 200px;
    min-height: 200px;
    padding: 10px;
  }
  
  .banner-title {
    font-size: 1.5rem;
  }
  
  .banner-subtitle {
    font-size: 0.75rem;
  }
  
  .form-column {
    padding: 10px;
    min-height: auto;
    height: auto;
  }
  
  .form-container {
    padding: 0 10px;
  }
}
</style>
