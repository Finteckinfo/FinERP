<template>
  <div class="auth-loading-container" :class="{ 'dark-mode': isDark }">
    <div class="loading-content">
      <!-- Animated Logo/Icon -->
      <div class="logo-container">
        <div class="logo-circle">
          <img src="/images/banner3.png" alt="FinERP Logo" class="logo-icon" />
        </div>
        <div class="pulse-ring"></div>
        <div class="pulse-ring delay-1"></div>
        <div class="pulse-ring delay-2"></div>
      </div>

      <!-- Loading Text -->
      <div class="loading-text">
        <h2 class="loading-title">{{ loadingTitle }}</h2>
        <p class="loading-subtitle">{{ loadingSubtitle }}</p>
      </div>

      <!-- Progress Indicator -->
      <div class="progress-container">
        <v-progress-linear
          :model-value="progressValue"
          color="primary"
          height="4"
          rounded
          class="progress-bar"
        />
        <div class="progress-text">{{ progressText }}</div>
      </div>

      <!-- Retry Button (if needed) -->
      <div v-if="showRetry" class="retry-container">
        <v-btn
          color="primary"
          variant="outlined"
          @click="handleRetry"
          :loading="retrying"
          class="retry-btn"
        >
          <v-icon start>mdi-refresh</v-icon>
          Try Again
        </v-btn>
      </div>

      <!-- Tips/Help -->
      <div class="tips-container">
        <v-card variant="tonal" color="primary" class="tips-card">
          <v-card-text class="text-center">
            <v-icon color="primary" class="mb-2">mdi-lightbulb-outline</v-icon>
            <p class="text-caption mb-0">{{ tipText }}</p>
          </v-card-text>
        </v-card>
      </div>
    </div>

    <!-- Background Animation -->
    <div class="background-animation">
      <div class="floating-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
        <div class="shape shape-4"></div>
        <div class="shape shape-5"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useTheme } from 'vuetify';

interface Props {
  loadingTitle?: string;
  loadingSubtitle?: string;
  progressValue?: number;
  progressText?: string;
  tipText?: string;
  showRetry?: boolean;
  retrying?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loadingTitle: 'Initializing Authentication',
  loadingSubtitle: 'Please wait while we set up your secure session...',
  progressValue: 0,
  progressText: 'Loading...',
  tipText: 'This usually takes just a few seconds',
  showRetry: false,
  retrying: false
});

const emit = defineEmits<{
  retry: [];
}>();

const theme = useTheme();
const isDark = computed(() => theme.current.value.dark);

const handleRetry = () => {
  emit('retry');
};

// Animate progress bar
const animatedProgress = ref(0);
let progressInterval: NodeJS.Timeout;

onMounted(() => {
  // Animate progress bar smoothly
  progressInterval = setInterval(() => {
    if (animatedProgress.value < props.progressValue) {
      animatedProgress.value += 2;
    }
  }, 50);
});

onUnmounted(() => {
  if (progressInterval) {
    clearInterval(progressInterval);
  }
});
</script>

<style scoped>
.auth-loading-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  overflow: hidden;
  transition: all 0.3s ease;
}

/* Light Mode - Green Theme */
.auth-loading-container:not(.dark-mode) {
  background: linear-gradient(135deg, #96C461 0%, #7BA347 50%, #5A8A2E 100%);
}

/* Dark Mode - Blue Theme */
.auth-loading-container.dark-mode {
  background: linear-gradient(135deg, #000E50 0%, #001A6B 50%, #002680 100%);
}

.loading-content {
  text-align: center;
  color: white;
  z-index: 2;
  max-width: 400px;
  padding: 2rem;
}

.logo-container {
  position: relative;
  margin: 0 auto 2rem;
  width: 120px;
  height: 120px;
}

.logo-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  animation: logoFloat 3s ease-in-out infinite;
  transition: all 0.3s ease;
}

/* Light Mode Logo Circle */
.auth-loading-container:not(.dark-mode) .logo-circle {
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 32px rgba(150, 196, 97, 0.3);
}

/* Dark Mode Logo Circle */
.auth-loading-container.dark-mode .logo-circle {
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 14, 80, 0.4);
}

.logo-icon {
  width: 48px;
  height: 48px;
  object-fit: contain;
  animation: iconPulse 2s ease-in-out infinite;
}

.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  border-radius: 50%;
  animation: pulse 2s ease-out infinite;
  transition: all 0.3s ease;
}

/* Light Mode Pulse Rings */
.auth-loading-container:not(.dark-mode) .pulse-ring {
  border: 2px solid rgba(255, 255, 255, 0.4);
}

/* Dark Mode Pulse Rings */
.auth-loading-container.dark-mode .pulse-ring {
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.pulse-ring.delay-1 {
  animation-delay: 0.5s;
}

.pulse-ring.delay-2 {
  animation-delay: 1s;
}

.loading-text {
  margin-bottom: 2rem;
}

.loading-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  background: linear-gradient(45deg, #fff, #f0f0f0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.loading-subtitle {
  font-size: 0.9rem;
  opacity: 0.9;
  line-height: 1.4;
}

.progress-container {
  margin-bottom: 2rem;
}

.progress-bar {
  margin-bottom: 0.5rem;
}

.progress-text {
  font-size: 0.8rem;
  opacity: 0.8;
}

.retry-container {
  margin-bottom: 2rem;
}

.retry-btn {
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

/* Light Mode Retry Button */
.auth-loading-container:not(.dark-mode) .retry-btn {
  background: rgba(255, 255, 255, 0.15);
}

.auth-loading-container:not(.dark-mode) .retry-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
}

/* Dark Mode Retry Button */
.auth-loading-container.dark-mode .retry-btn {
  background: rgba(255, 255, 255, 0.1);
}

.auth-loading-container.dark-mode .retry-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.tips-container {
  margin-top: 1rem;
}

.tips-card {
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

/* Light Mode Tips Card */
.auth-loading-container:not(.dark-mode) .tips-card {
  background: rgba(255, 255, 255, 0.1);
}

/* Dark Mode Tips Card */
.auth-loading-container.dark-mode .tips-card {
  background: rgba(255, 255, 255, 0.05);
}

.background-animation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.floating-shapes {
  position: relative;
  width: 100%;
  height: 100%;
}

.shape {
  position: absolute;
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
  transition: all 0.3s ease;
}

/* Light Mode Shapes */
.auth-loading-container:not(.dark-mode) .shape {
  background: rgba(255, 255, 255, 0.15);
}

/* Dark Mode Shapes */
.auth-loading-container.dark-mode .shape {
  background: rgba(255, 255, 255, 0.08);
}

.shape-1 {
  width: 60px;
  height: 60px;
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 40px;
  height: 40px;
  top: 60%;
  left: 80%;
  animation-delay: 1s;
}

.shape-3 {
  width: 80px;
  height: 80px;
  top: 80%;
  left: 20%;
  animation-delay: 2s;
}

.shape-4 {
  width: 30px;
  height: 30px;
  top: 30%;
  left: 70%;
  animation-delay: 3s;
}

.shape-5 {
  width: 50px;
  height: 50px;
  top: 10%;
  left: 50%;
  animation-delay: 4s;
}

/* Animations */
@keyframes logoFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes iconPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .loading-content {
    padding: 1rem;
    max-width: 90%;
  }
  
  .loading-title {
    font-size: 1.2rem;
  }
  
  .logo-container {
    width: 100px;
    height: 100px;
  }
  
  .logo-circle {
    width: 60px;
    height: 60px;
  }
  
  .logo-icon {
    width: 32px !important;
    height: 32px !important;
  }
}

/* Smooth theme transitions */
.auth-loading-container * {
  transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}
</style>
