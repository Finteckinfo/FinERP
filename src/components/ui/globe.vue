<template>
  <div ref="globeContainer" class="globe-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import createGlobe from 'globe.gl'

interface GlobeProps {
  width?: number
  height?: number
  globeImageUrl?: string
  bumpImageUrl?: string
  backgroundColor?: string
  pointsData?: Array<{
    lat: number
    lng: number
    size?: number
    color?: string
    label?: string
  }>
  arcsData?: Array<{
    startLat: number
    startLng: number
    endLat: number
    endLng: number
    color?: string
  }>
  autoRotate?: boolean
  autoRotateSpeed?: number
}

const props = withDefaults(defineProps<GlobeProps>(), {
  width: 600,
  height: 600,
  globeImageUrl: '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
  bumpImageUrl: '//unpkg.com/three-globe/example/img/earth-topology.png',
  backgroundColor: 'rgba(0,0,0,0)',
  pointsData: () => [],
  arcsData: () => [],
  autoRotate: true,
  autoRotateSpeed: 0.5
})

const globeContainer = ref<HTMLDivElement | null>(null)
let globeInstance: any = null

onMounted(() => {
  if (!globeContainer.value) return

  // Initialize globe
  globeInstance = new createGlobe(globeContainer.value)
    .globeImageUrl(props.globeImageUrl)
    .bumpImageUrl(props.bumpImageUrl)
    .backgroundColor(props.backgroundColor)
    .width(props.width)
    .height(props.height)

  // Configure points if provided
  if (props.pointsData.length > 0) {
    globeInstance
      .pointsData(props.pointsData)
      .pointAltitude('size')
      .pointColor('color')
      .pointLabel('label')
  }

  // Configure arcs if provided
  if (props.arcsData.length > 0) {
    globeInstance
      .arcsData(props.arcsData)
      .arcColor('color')
      .arcDashLength(0.4)
      .arcDashGap(0.2)
      .arcDashAnimateTime(3000)
  }

  // Auto-rotate
  if (props.autoRotate) {
    globeInstance.controls().autoRotate = true
    globeInstance.controls().autoRotateSpeed = props.autoRotateSpeed
  }

  // Set initial view
  globeInstance.pointOfView({ lat: 0, lng: 0, altitude: 2.5 })
})

onUnmounted(() => {
  if (globeInstance) {
    // Clean up Three.js resources
    globeInstance._destructor?.()
  }
})

// Watch for prop changes
watch(() => props.width, (newWidth) => {
  if (globeInstance) globeInstance.width(newWidth)
})

watch(() => props.height, (newHeight) => {
  if (globeInstance) globeInstance.height(newHeight)
})

watch(() => props.pointsData, (newPoints) => {
  if (globeInstance && newPoints.length > 0) {
    globeInstance.pointsData(newPoints)
  }
}, { deep: true })

watch(() => props.arcsData, (newArcs) => {
  if (globeInstance && newArcs.length > 0) {
    globeInstance.arcsData(newArcs)
  }
}, { deep: true })
</script>

<style scoped>
.globe-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.globe-container :deep(canvas) {
  outline: none;
}
</style>

