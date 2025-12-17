<template>
  <LandingBackground :show-theme-toggle="false">
    <!-- Navigation -->
    <nav class="main-nav">
      <div class="nav-container">
        <div class="nav-logo">
          <span class="logo-text">FinPro</span>
        </div>
        <div class="nav-links">
          <a href="#features" @click.prevent="scrollToFeatures">Features</a>
          <ThemeToggle :show-label="false" size="small" class="nav-theme-toggle" />
          <v-btn
            variant="outlined"
            size="small"
            class="nav-button"
            @click="goToCreateProject"
          >
            Get Started
          </v-btn>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-container">
        <h1 class="hero-title">FinPro</h1>
        <p class="hero-subtitle">
          Professional Web3 ERP system for remote teams with secure FIN token escrow payments 
          and blockchain-based project management.
        </p>
        <div class="hero-actions">
          <v-btn
            size="default"
            variant="flat"
            class="primary-button"
            @click="goToCreateProject"
          >
            Create Project
          </v-btn>
          <v-btn
            size="default"
            variant="outlined"
            class="secondary-button"
            @click="goToJoinProject"
          >
            Join Project
          </v-btn>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" ref="featuresSection" class="features-section">
      <div class="features-container">
        <h2 class="section-title">Features</h2>
        <FeatureBentoGrid />
      </div>
    </section>

    <!-- Footer -->
    <footer class="landing-footer">
      <div class="footer-container">
        <div class="footer-content">
          <div class="footer-brand">
            <span class="footer-logo-text">FinPro</span>
            <p class="footer-tagline">Professional Web3 Project Management</p>
          </div>
          <div class="footer-links">
            <a href="#features" @click.prevent="scrollToFeatures">Features</a>
            <a href="#!" @click.prevent>Documentation</a>
            <a href="#!" @click.prevent>Support</a>
          </div>
        </div>
        <div class="footer-bottom">
          <p class="footer-copyright">
            © {{ new Date().getFullYear() }} FinPro. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  </LandingBackground>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useEVMWallet } from '@/composables/useEVMWallet'
import LandingBackground from '@/components/ui/LandingBackground.vue'
import ThemeToggle from '@/components/shared/ThemeToggle.vue'
import FeatureBentoGrid from '@/views/pages/landing/components/FeatureBentoGrid.vue'

const router = useRouter()
const featuresSection = ref<HTMLElement | null>(null)
const { isConnected, connect } = useEVMWallet()

const goToCreateProject = async () => {
  const isWalletConnected = isConnected.value;
  if (isWalletConnected) {
    router.push('/projects/create');
  } else {
    const connected = await connect();
    if (connected) {
      router.push('/projects/create');
    }
  }
}

const goToJoinProject = async () => {
  const isWalletConnected = isConnected.value;
  if (isWalletConnected) {
    router.push('/invitations');
  } else {
    const connected = await connect();
    if (connected) {
      router.push('/invitations');
    }
  }
}

const scrollToFeatures = () => {
  if (featuresSection.value) {
    featuresSection.value.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    })
  }
}
</script>

<style lang="scss" scoped>
/* Navigation */
.main-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background-color: color-mix(in srgb, var(--erp-card-bg) 92%, transparent);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--erp-border);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--erp-text);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-theme-toggle {
  display: inline-flex;
}

.nav-links a {
  color: color-mix(in srgb, var(--erp-text) 72%, transparent);
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.2s;
}

.nav-links a:hover {
  color: var(--erp-text);
}

.nav-button {
  text-transform: none !important;
}

/* Hero Section */
.hero-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8rem 2rem 4rem;
  position: relative;
  z-index: 10;
  pointer-events: none; /* Allow clicks to pass through the section */
}

.hero-container {
  max-width: 800px;
  width: 100%;
  text-align: center;
  pointer-events: auto; /* Re-enable clicks for the container content */
}

.hero-title {
  font-size: 4.5rem;
  font-weight: 600;
  letter-spacing: -0.04em;
  margin-bottom: 1.5rem;
  color: var(--erp-text);
  line-height: 1.1;
}

.hero-subtitle {
  font-size: 1.25rem;
  line-height: 1.6;
  color: color-mix(in srgb, var(--erp-text) 78%, transparent);
  margin-bottom: 3rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  position: relative;
  z-index: 20;
  pointer-events: auto;
  max-width: 400px;
  margin: 0 auto;
}

.primary-button,
.secondary-button {
  text-transform: none !important;
  font-weight: 500 !important;
  padding: 0.625rem 1.25rem !important;
  border-radius: 8px !important;
  pointer-events: auto !important;
  cursor: pointer !important;
  position: relative;
  z-index: 30;
  font-size: 0.875rem !important;
  min-width: 120px;
  flex: 1;
  max-width: 160px;
}

.primary-button {
  background-color: var(--erp-accent-green) !important;
  color: white !important;
  border: 2px solid var(--erp-accent-green) !important;
}

.primary-button:hover {
  background-color: var(--erp-accent-green) !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(5, 150, 105, 0.4);
}

.secondary-button {
  border: 2px solid var(--erp-border) !important;
  color: var(--erp-text) !important;
  background-color: var(--erp-card-bg) !important;
}

.secondary-button:hover {
  border-color: var(--erp-accent-green) !important;
  background-color: var(--erp-accent-light) !important;
  transform: translateY(-2px);
}

/* Features Section */
.features-section {
  padding: 6rem 2rem;
  background-color: var(--erp-surface);
}

.features-container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  text-align: center;
  margin-bottom: 4rem;
  color: var(--erp-text);
}

/* Footer */
.landing-footer {
  background-color: var(--erp-card-bg);
  border-top: 1px solid var(--erp-border);
  padding: 4rem 2rem 2rem;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 3rem;
  flex-wrap: wrap;
  gap: 2rem;
}

.footer-brand {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.footer-logo-text {
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--erp-text);
}

.footer-tagline {
  font-size: 0.875rem;
  color: color-mix(in srgb, var(--erp-text) 70%, transparent);
}

.footer-links {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.footer-links a {
  color: color-mix(in srgb, var(--erp-text) 70%, transparent);
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s;
}

.footer-links a:hover {
  color: var(--erp-text);
}

.footer-bottom {
  padding-top: 2rem;
  border-top: 1px solid var(--erp-border);
  text-align: center;
}

.footer-copyright {
  font-size: 0.875rem;
  color: color-mix(in srgb, var(--erp-text) 65%, transparent);
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .nav-container {
    padding: 1rem;
  }

  .nav-links {
    gap: 1rem;
  }

  .hero-section {
    padding: 6rem 1.5rem 3rem;
  }

  .hero-title {
    font-size: 3rem;
  }

  .hero-subtitle {
    font-size: 1.125rem;
  }

  .hero-actions {
    flex-direction: row;
    gap: 0.5rem;
    max-width: 320px;
  }

  .primary-button,
  .secondary-button {
    flex: 1;
    min-width: 120px;
    padding: 0.5rem 1rem !important;
    font-size: 0.8rem !important;
  }

  .section-title {
    font-size: 2rem;
  }

  .features-section {
    padding: 4rem 1.5rem;
  }

  .footer-content {
    flex-direction: column;
  }

  .footer-links {
    flex-direction: column;
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .hero-actions {
    flex-direction: column;
    gap: 0.5rem;
    max-width: 280px;
  }

  .primary-button,
  .secondary-button {
    width: 100%;
    max-width: none;
    flex: none;
  }

  .section-title {
    font-size: 1.75rem;
  }
}
</style>
