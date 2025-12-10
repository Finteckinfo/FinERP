<template>
  <div 
    class="retro-grid-container"
    :style="{
      '--grid-angle': `${angle}deg`,
      '--cell-size': `${cellSize}px`,
      '--opacity': opacity,
      '--light-line': lightLineColor,
      '--dark-line': darkLineColor
    }"
  >
    <div class="perspective-wrapper">
      <div class="grid-animation-wrapper">
        <div class="grid-background"></div>
      </div>
    </div>
    
    <!-- Gradient fade overlay -->
    <div class="gradient-overlay"></div>
  </div>
</template>

<script setup lang="ts">
interface RetroGridProps {
  angle?: number
  cellSize?: number
  opacity?: number
  lightLineColor?: string
  darkLineColor?: string
}

const props = withDefaults(defineProps<RetroGridProps>(), {
  angle: 65,
  cellSize: 60,
  opacity: 0.5,
  lightLineColor: 'rgba(128, 128, 128, 0.3)',
  darkLineColor: 'rgba(128, 128, 128, 0.3)'
})
</script>

<style scoped>
.retro-grid-container {
  pointer-events: none;
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  perspective: 200px;
  opacity: var(--opacity);
  inset: 0;
}

.perspective-wrapper {
  position: absolute;
  inset: 0;
  transform: rotateX(var(--grid-angle));
}

.grid-animation-wrapper {
  position: absolute;
  inset: 0% 0px;
  margin-left: -200%;
  height: 300vh;
  width: 600vw;
  transform-origin: 100% 0 0;
  animation: grid-animation 15s linear infinite;
}

.grid-background {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(to right, var(--light-line) 1px, transparent 0),
    linear-gradient(to bottom, var(--light-line) 1px, transparent 0);
  background-size: var(--cell-size) var(--cell-size);
  background-repeat: repeat;
}

/* Dark mode grid lines */
@media (prefers-color-scheme: dark) {
  .grid-background {
    background-image: 
      linear-gradient(to right, var(--dark-line) 1px, transparent 0),
      linear-gradient(to bottom, var(--dark-line) 1px, transparent 0);
  }
}

/* For Vue apps with explicit dark mode class */
:deep(.dark) .grid-background {
  background-image: 
    linear-gradient(to right, var(--dark-line) 1px, transparent 0),
    linear-gradient(to bottom, var(--dark-line) 1px, transparent 0);
}

/* Gradient overlay for fade effect */
.gradient-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    var(--erp-page-bg, white) 0%,
    transparent 10%,
    transparent 90%,
    var(--erp-page-bg, white) 100%
  );
  pointer-events: none;
}

/* Dark mode gradient overlay */
@media (prefers-color-scheme: dark) {
  .gradient-overlay {
    background: linear-gradient(
      to top,
      var(--erp-page-bg, black) 0%,
      transparent 10%,
      transparent 90%,
      var(--erp-page-bg, black) 100%
    );
  }
}

:deep(.dark) .gradient-overlay {
  background: linear-gradient(
    to top,
    var(--erp-page-bg, black) 0%,
    transparent 10%,
    transparent 90%,
    var(--erp-page-bg, black) 100%
  );
}

@keyframes grid-animation {
  0% {
    transform: translateY(-50%);
  }
  100% {
    transform: translateY(0);
  }
}
</style>

