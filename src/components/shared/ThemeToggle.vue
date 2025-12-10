<template>
  <button
    @click="handleToggle"
    :class="[
      'theme-toggle-btn',
      'flex items-center w-full cursor-pointer mr-10 text-sm rounded-md',
      isDark 
        ? 'text-gray-200 hover:bg-gray-700' 
        : 'text-gray-700 hover:bg-gray-100'
    ]"
    :title="`Switch to ${isDark ? 'light' : 'dark'} theme`"
  >
    <div class="toggle-icon-container">
      <!-- Sun Icon -->
      <div 
        class="icon-wrapper sun-icon"
        :class="{ active: !isDark, hiding: isDark }"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="sun-svg"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      </div>
      
      <!-- Moon Icon -->
      <div 
        class="icon-wrapper moon-icon"
        :class="{ active: isDark, hiding: !isDark }"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="moon-svg"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      </div>
    </div>
    
    <span v-if="showLabel" class="ml-2 theme-label">{{ isDark ? 'Light Mode' : 'Dark Mode' }}</span>
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useTheme } from '@/composables/useTheme';

interface Props {
  showLabel?: boolean;
  size?: 'small' | 'default' | 'large';
}

const props = withDefaults(defineProps<Props>(), {
  showLabel: true,
  size: 'default'
});

const { isDark, toggle } = useTheme();
const isAnimating = ref(false);

const handleToggle = () => {
  if (isAnimating.value) return;
  
  isAnimating.value = true;
  toggle();
  
  setTimeout(() => {
    isAnimating.value = false;
  }, 500);
};
</script>

<style scoped>
.theme-toggle-btn {
  transition: all 0.3s ease;
  border: none;
  background: transparent;
  padding: 0.5rem;
  font-weight: 500;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-toggle-btn:hover {
  transform: translateY(-1px);
}

.theme-toggle-btn:active {
  transform: translateY(0);
}

/* Icon Container */
.toggle-icon-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 2px solid;
  border-color: var(--erp-border);
  background: var(--erp-surface);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-toggle-btn:hover .toggle-icon-container {
  border-color: var(--erp-accent-green);
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
  transform: scale(1.05);
}

/* Icon Wrapper */
.icon-wrapper {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Sun Icon Animations */
.sun-icon {
  opacity: 0;
  transform: rotate(-180deg) scale(0.3);
}

.sun-icon.active {
  opacity: 1;
  transform: rotate(0deg) scale(1);
}

.sun-icon.hiding {
  opacity: 0;
  transform: rotate(180deg) scale(0.3);
}

/* Moon Icon Animations */
.moon-icon {
  opacity: 0;
  transform: rotate(180deg) scale(0.3);
}

.moon-icon.active {
  opacity: 1;
  transform: rotate(0deg) scale(1);
}

.moon-icon.hiding {
  opacity: 0;
  transform: rotate(-180deg) scale(0.3);
}

/* SVG Animations */
.sun-svg {
  animation: sunPulse 2s ease-in-out infinite;
  color: #fbbf24;
  filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.5));
}

.moon-svg {
  animation: moonFloat 3s ease-in-out infinite;
  color: #818cf8;
  filter: drop-shadow(0 0 8px rgba(129, 140, 248, 0.5));
}

@keyframes sunPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes moonFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

/* Sun rays rotation */
.sun-icon.active .sun-svg {
  animation: sunPulse 2s ease-in-out infinite, sunRotate 20s linear infinite;
}

@keyframes sunRotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Theme Label */
.theme-label {
  transition: all 0.3s ease;
  font-weight: 500;
}

.theme-toggle-btn:hover .theme-label {
  color: var(--erp-accent-green);
}

/* Dark mode specific adjustments */
:deep(.dark) .sun-svg {
  color: #fbbf24;
}

:deep(.dark) .moon-svg {
  color: #a78bfa;
}
</style>
