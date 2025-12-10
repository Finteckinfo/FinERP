<template>
  <LandingBackground>
    <!-- Navigation -->
    <nav class="main-nav">
      <div class="nav-container">
        <div class="nav-logo">
          <span class="logo-text">FINERP</span>
        </div>
        <div class="nav-links">
          <a href="#features" @click.prevent="scrollToFeatures">Features</a>
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
        <h1 class="hero-title">FINERP</h1>
        <p class="hero-subtitle">
          Professional Web3 ERP system for remote teams with secure FIN token escrow payments 
          and blockchain-based project management.
        </p>
        <div class="hero-actions">
          <v-btn
            size="large"
            variant="flat"
            class="primary-button"
            @click="goToCreateProject"
          >
            Create a Project
          </v-btn>
          <v-btn
            size="large"
            variant="outlined"
            class="secondary-button"
            @click="goToJoinProject"
          >
            Join a Project
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
            <span class="footer-logo-text">FINERP</span>
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
            © {{ new Date().getFullYear() }} FINERP. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  </LandingBackground>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMetaMaskWallet } from '@/composables/useMetaMaskWallet'
import LandingBackground from '@/components/ui/LandingBackground.vue'
import FeatureBentoGrid from '@/views/pages/landing/components/FeatureBentoGrid.vue'

const router = useRouter()
const featuresSection = ref<HTMLElement | null>(null)
const { isConnected, connect } = useMetaMaskWallet()

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
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #e5e7eb;
}

.dark-theme .main-nav {
  background-color: rgba(10, 10, 10, 0.95);
  border-bottom-color: #1f1f1f;
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
  color: #1a1a1a;
}

.dark-theme .logo-text {
  color: #ffffff;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-links a {
  color: #4b5563;
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.2s;
}

.dark-theme .nav-links a {
  color: #d1d5db;
}

.nav-links a:hover {
  color: #1a1a1a;
}

.dark-theme .nav-links a:hover {
  color: #ffffff;
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
}

.hero-container {
  max-width: 800px;
  width: 100%;
  text-align: center;
}

.hero-title {
  font-size: 4.5rem;
  font-weight: 600;
  letter-spacing: -0.04em;
  margin-bottom: 1.5rem;
  color: #1a1a1a;
  line-height: 1.1;
}

.dark-theme .hero-title {
  color: #ffffff;
}

.hero-subtitle {
  font-size: 1.25rem;
  line-height: 1.6;
  color: #4b5563;
  margin-bottom: 3rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.dark-theme .hero-subtitle {
  color: #9ca3af;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.primary-button,
.secondary-button {
  text-transform: none !important;
  font-weight: 500 !important;
  padding: 0.75rem 2rem !important;
  border-radius: 6px !important;
}

.primary-button {
  background-color: #1a1a1a !important;
  color: #ffffff !important;
}

.dark-theme .primary-button {
  background-color: #ffffff !important;
  color: #1a1a1a !important;
}

.secondary-button {
  border-color: #d1d5db !important;
  color: #1a1a1a !important;
}

.dark-theme .secondary-button {
  border-color: #4b5563 !important;
  color: #ffffff !important;
}

/* Features Section */
.features-section {
  padding: 6rem 2rem;
  background-color: #f9fafb;
}

.dark-theme .features-section {
  background-color: #0f0f0f;
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
  color: #1a1a1a;
}

.dark-theme .section-title {
  color: #ffffff;
}

/* Footer */
.landing-footer {
  background-color: #ffffff;
  border-top: 1px solid #e5e7eb;
  padding: 4rem 2rem 2rem;
}

.dark-theme .landing-footer {
  background-color: #0a0a0a;
  border-top-color: #1f1f1f;
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
  color: #1a1a1a;
}

.dark-theme .footer-logo-text {
  color: #ffffff;
}

.footer-tagline {
  font-size: 0.875rem;
  color: #6b7280;
}

.dark-theme .footer-tagline {
  color: #9ca3af;
}

.footer-links {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.footer-links a {
  color: #6b7280;
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s;
}

.dark-theme .footer-links a {
  color: #9ca3af;
}

.footer-links a:hover {
  color: #1a1a1a;
}

.dark-theme .footer-links a:hover {
  color: #ffffff;
}

.footer-bottom {
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
  text-align: center;
}

.dark-theme .footer-bottom {
  border-top-color: #1f1f1f;
}

.footer-copyright {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.dark-theme .footer-copyright {
  color: #9ca3af;
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
    flex-direction: column;
    align-items: stretch;
  }

  .primary-button,
  .secondary-button {
    width: 100%;
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

  .section-title {
    font-size: 1.75rem;
  }
}
</style>
