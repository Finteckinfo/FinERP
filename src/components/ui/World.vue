<template>
  <div
    class="absolute inset-0 mx-auto aspect-[1/1] w-full max-w-[600px]"
    :class="className"
  >
    <canvas
      ref="canvasRef"
      class="size-full opacity-0 transition-opacity duration-500"
      @pointerdown="onPointerDown"
      @pointerup="onPointerUp"
      @pointerout="onPointerUp"
      @mousemove="onMouseMove"
      @touchmove="onTouchMove"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import createGlobe, { type COBEOptions } from 'cobe'
import { useTheme } from '@/composables/useTheme'

interface WorldProps {
  className?: string
  config?: COBEOptions
}

const props = withDefaults(defineProps<WorldProps>(), {
  className: '',
  config: () => ({
    width: 800,
    height: 800,
    onRender: () => {},
    devicePixelRatio: 2,
    phi: 0,
    theta: 0.3,
    dark: 0,
    diffuse: 0.4,
    mapSamples: 16000,
    mapBrightness: 1.2,
    baseColor: [1, 1, 1],
    markerColor: [251 / 255, 100 / 255, 21 / 255],
    glowColor: [1, 1, 1],
    markers: [
      { location: [14.5995, 120.9842], size: 0.03 },
      { location: [19.076, 72.8777], size: 0.1 },
      { location: [23.8103, 90.4125], size: 0.05 },
      { location: [30.0444, 31.2357], size: 0.07 },
      { location: [39.9042, 116.4074], size: 0.08 },
      { location: [-23.5505, -46.6333], size: 0.1 },
      { location: [19.4326, -99.1332], size: 0.1 },
      { location: [40.7128, -74.006], size: 0.1 },
      { location: [34.6937, 135.5022], size: 0.05 },
      { location: [41.0082, 28.9784], size: 0.06 },
    ],
  })
})

const theme = useTheme()
const canvasRef = ref<HTMLCanvasElement | null>(null)
const pointerInteracting = ref<number | null>(null)
const pointerInteractionMovement = ref(0)
const r = ref(0)
const rs = ref(0) // Simplified spring for Vue
let phi = 0
let width = 0
let globe: any = null

const MOVEMENT_DAMPING = 1400

// Get theme-aware colors
const getThemeColors = () => {
  if (theme.isDark.value) {
    return {
      baseColor: [2, 18, 76] as [number, number, number], // #02124C (theme-secondary-color)
      markerColor: [91, 200, 91] as [number, number, number], // #5BC85B (theme-primary-color)
      glowColor: [2, 18, 76] as [number, number, number], // #02124C (theme-secondary-color)
      dark: 1
    }
  } else {
    return {
      baseColor: [91, 200, 91] as [number, number, number], // #5BC85B (theme-primary-color)
      markerColor: [2, 18, 76] as [number, number, number], // #02124C (theme-secondary-color)
      glowColor: [91, 200, 91] as [number, number, number], // #5BC85B (theme-primary-color)
      dark: 0
    }
  }
}

const updatePointerInteraction = (value: number | null) => {
  pointerInteracting.value = value
  if (canvasRef.value) {
    canvasRef.value.style.cursor = value !== null ? 'grabbing' : 'grab'
  }
}

const updateMovement = (clientX: number) => {
  if (pointerInteracting.value !== null) {
    const delta = clientX - pointerInteracting.value
    pointerInteractionMovement.value = delta
    r.value = r.value + delta / MOVEMENT_DAMPING
  }
}

const onPointerDown = (e: PointerEvent) => {
  pointerInteracting.value = e.clientX
  updatePointerInteraction(e.clientX)
}

const onPointerUp = () => {
  updatePointerInteraction(null)
}

const onMouseMove = (e: MouseEvent) => {
  updateMovement(e.clientX)
}

const onTouchMove = (e: TouchEvent) => {
  if (e.touches[0]) {
    updateMovement(e.touches[0].clientX)
  }
}

const initGlobe = () => {
  if (!canvasRef.value) return

  const colors = getThemeColors()
  
  const globeConfig: COBEOptions = {
    ...props.config,
    width: width * 2,
    height: width * 2,
    baseColor: colors.baseColor,
    markerColor: colors.markerColor,
    glowColor: colors.glowColor,
    dark: colors.dark,
    onRender: (state) => {
      if (!pointerInteracting.value) phi += 0.005
      state.phi = phi + r.value
      state.width = width * 2
      state.height = width * 2
    },
  }

  globe = createGlobe(canvasRef.value, globeConfig)
  
  // Make globe visible immediately
  setTimeout(() => {
    if (canvasRef.value) {
      canvasRef.value.style.opacity = '0.9' // Increased opacity for better visibility
    }
  }, 100) // Reduced timeout
}

const onResize = () => {
  if (canvasRef.value) {
    width = canvasRef.value.offsetWidth
  }
}

onMounted(async () => {
  await nextTick()
  
  window.addEventListener('resize', onResize)
  onResize()
  initGlobe()
})

onUnmounted(() => {
  if (globe) {
    globe.destroy()
  }
  window.removeEventListener('resize', onResize)
})

// Watch for theme changes and reinitialize globe
watch(() => theme.isDark.value, () => {
  if (globe) {
    globe.destroy()
  }
  initGlobe()
})
</script>
