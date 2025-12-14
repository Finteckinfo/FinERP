<template>
  <LandingBackground>
    <!-- Navigation -->
    <nav class="main-nav">
      <div class="nav-container">
        <div class="nav-logo">
            <span class="logo-text">FinERP</span>
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
        <h1 class="hero-title">FinERP</h1>
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
            <span class="footer-logo-text">FinERP</span>
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
            © {{ new Date().getFullYear() }} FinERP. All rights reserved.
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
/* Navigation - Sleek FinERP style */
.main-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background-color: var(--erp-header-bg, rgba(255, 255, 255, 0.95));
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--erp-border, #e2e8f0);
  transition: all 0.3s ease;
}

.dark-theme .main-nav {
  background-color: var(--erp-header-bg, rgba(30, 41, 59, 0.95));
  border-bottom-color: var(--erp-border, #334155);
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
  font-weight: 700;
  letter-spacing: -0.03em;
  background: linear-gradient(45deg, #5BC85B, #34D399);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
  transition: all 0.3s ease;
}

.logo-text:hover {
  transform: scale(1.02);
  filter: brightness(1.1);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-links a {
  color: var(--erp-text-secondary, #4a5568);
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s ease;
  padding: 0.5rem 0;
  position: relative;
}

.dark-theme .nav-links a {
  color: var(--erp-text-secondary, #cbd5e1);
}

.nav-links a:hover {
  color: var(--erp-accent-green, #5BC85B);
  transform: translateY(-1px);
}

.nav-links a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--erp-accent-green, #5BC85B);
  transition: width 0.3s ease;
}

.nav-links a:hover::after {
  width: 100%;
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
  font-weight: 700;
  letter-spacing: -0.04em;
  margin-bottom: 1.5rem;
  color: var(--erp-heading, #0f172a);
  line-height: 1.1;
  background: linear-gradient(45deg, #5BC85B, #34D399);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
}

.dark-theme .hero-title {
  background: linear-gradient(45deg, #5BC85B, #34D399);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  line-height: 1.7;
  color: var(--erp-text-secondary, #4a5568);
  margin-bottom: 3rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  font-weight: 400;
}

.dark-theme .hero-subtitle {
  color: var(--erp-text-secondary, #cbd5e1);
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
  padding: 0.875rem 2rem !important;
  border-radius: 8px !important;
  min-height: 48px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  font-size: 1rem !important;
}

.primary-button {
  background-color: var(--erp-accent-green, #5BC85B) !important;
  color: #ffffff !important;
  box-shadow: 0 2px 8px rgba(91, 200, 91, 0.3) !important;
}

.primary-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(91, 200, 91, 0.4) !important;
  background-color: #4ab84a !important;
}

.secondary-button {
  border: 1.5px solid var(--erp-border, #e2e8f0) !important;
  color: var(--erp-text-primary, #1a202c) !important;
  background-color: transparent !important;
}

.dark-theme .secondary-button {
  border-color: var(--erp-border, #334155) !important;
  color: var(--erp-text-primary, #ffffff) !important;
}

.secondary-button:hover {
  border-color: var(--erp-accent-green, #5BC85B) !important;
  color: var(--erp-accent-green, #5BC85B) !important;
  transform: translateY(-2px);
  background-color: rgba(91, 200, 91, 0.05) !important;
}

/* Features Section */
.features-section {
  padding: 6rem 2rem;
  background-color: var(--erp-page-bg, #f8fafc);
  transition: background-color 0.3s ease;
}

.dark-theme .features-section {
  background-color: var(--erp-page-bg, #0f172a);
}

.features-container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  text-align: center;
  margin-bottom: 4rem;
  color: var(--erp-heading, #0f172a);
}

.dark-theme .section-title {
  color: var(--erp-heading, #ffffff);
}

/* Footer */
.landing-footer {
  background-color: var(--erp-card-bg, #ffffff);
  border-top: 1px solid var(--erp-border, #e2e8f0);
  padding: 4rem 2rem 2rem;
  transition: all 0.3s ease;
}

.dark-theme .landing-footer {
  background-color: var(--erp-card-bg, #1e293b);
  border-top-color: var(--erp-border, #334155);
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
  font-weight: 700;
  letter-spacing: -0.03em;
  background: linear-gradient(45deg, #5BC85B, #34D399);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
}

.footer-tagline {
  font-size: 0.875rem;
  color: var(--erp-text-tertiary, #6b7280);
}

.dark-theme .footer-tagline {
  color: var(--erp-text-tertiary, #94a3b8);
}

.footer-links {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.footer-links a {
  color: var(--erp-text-tertiary, #6b7280);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.dark-theme .footer-links a {
  color: var(--erp-text-tertiary, #94a3b8);
}

.footer-links a:hover {
  color: var(--erp-accent-green, #5BC85B);
  transform: translateX(2px);
}

.footer-bottom {
  padding-top: 2rem;
  border-top: 1px solid var(--erp-border, #e2e8f0);
  text-align: center;
}

.dark-theme .footer-bottom {
  border-top-color: var(--erp-border, #334155);
}

.footer-copyright {
  font-size: 0.875rem;
  color: var(--erp-text-tertiary, #6b7280);
  margin: 0;
}

.dark-theme .footer-copyright {
  color: var(--erp-text-tertiary, #94a3b8);
}

/* Responsive */
@media (max-width: 768px) {
  .nav-container {
    padding: 1rem 1.5rem;
  }

  .nav-links {
    gap: 1rem;
    font-size: 0.875rem;
  }

  .hero-section {
    padding: 6rem 1.5rem 3rem;
    min-height: calc(100vh - 80px);
  }

  .hero-title {
    font-size: 3rem;
    line-height: 1.1;
  }

  .hero-subtitle {
    font-size: 1.125rem;
    line-height: 1.6;
  }

  .hero-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .primary-button,
  .secondary-button {
    width: 100% !important;
    min-height: 48px !important;
    padding: 0.875rem 1.5rem !important;
    font-size: 0.9375rem !important;
  }

  .section-title {
    font-size: 2rem;
    margin-bottom: 3rem;
  }

  .features-section {
    padding: 4rem 1.5rem;
  }

  .footer-content {
    flex-direction: column;
    gap: 2rem;
  }

  .footer-links {
    flex-direction: column;
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .nav-container {
    padding: 0.875rem 1rem;
  }

  .nav-links {
    gap: 0.75rem;
  }

  .hero-section {
    padding: 5rem 1rem 2rem;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1rem;
    line-height: 1.5;
  }

  .primary-button,
  .secondary-button {
    min-height: 44px !important;
    padding: 0.75rem 1.25rem !important;
    font-size: 0.875rem !important;
  }

  .section-title {
    font-size: 1.75rem;
    margin-bottom: 2.5rem;
  }

  .features-section {
    padding: 3rem 1rem;
  }

  .landing-footer {
    padding: 3rem 1rem 1.5rem;
  }
}
</style>
