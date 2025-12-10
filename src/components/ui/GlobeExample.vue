<template>
  <div class="globe-example">
    <h2>Interactive Globe Example</h2>
    <Globe
      :width="600"
      :height="600"
      :points-data="pointsData"
      :arcs-data="arcsData"
      :auto-rotate="true"
      :auto-rotate-speed="0.5"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Globe } from './globe'

// Example data: Major cities
const pointsData = ref([
  { lat: 40.7128, lng: -74.0060, size: 0.5, color: '#00ff00', label: 'New York' },
  { lat: 51.5074, lng: -0.1278, size: 0.5, color: '#00ff00', label: 'London' },
  { lat: 35.6762, lng: 139.6503, size: 0.5, color: '#00ff00', label: 'Tokyo' },
  { lat: -33.8688, lng: 151.2093, size: 0.5, color: '#00ff00', label: 'Sydney' },
  { lat: 1.3521, lng: 103.8198, size: 0.5, color: '#00ff00', label: 'Singapore' }
])

// Example data: Flight routes
const arcsData = ref([
  { startLat: 40.7128, startLng: -74.0060, endLat: 51.5074, endLng: -0.1278, color: '#ff6b6b' },
  { startLat: 51.5074, startLng: -0.1278, endLat: 35.6762, endLng: 139.6503, color: '#4ecdc4' },
  { startLat: 35.6762, startLng: 139.6503, endLat: -33.8688, endLng: 151.2093, color: '#45b7d1' },
  { startLat: -33.8688, startLng: 151.2093, endLat: 1.3521, endLng: 103.8198, color: '#f7b731' }
])
</script>

<style scoped>
.globe-example {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.globe-example h2 {
  color: white;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 2rem;
  text-align: center;
}
</style>

