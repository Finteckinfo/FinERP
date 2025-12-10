<template>
  <div class="grid-pattern-container" ref="containerRef">
    <svg
      :width="width"
      :height="height"
      class="grid-pattern-svg"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          :id="`grid-pattern-${patternId}`"
          :width="squareSize"
          :height="squareSize"
          patternUnits="userSpaceOnUse"
          :x="x"
          :y="y"
        >
          <path
            :d="`M ${squareSize} 0 L 0 0 0 ${squareSize}`"
            fill="none"
            :stroke="strokeColor"
            :stroke-width="strokeWidth"
            stroke-dasharray="4,4"
          />
        </pattern>
      </defs>
      <rect
        width="100%"
        height="100%"
        :fill="`url(#grid-pattern-${patternId})`"
      />
      
      <!-- Interactive squares -->
      <g v-if="interactive">
        <rect
          v-for="(square, index) in visibleSquares"
          :key="index"
          :x="square.x"
          :y="square.y"
          :width="squareSize"
          :height="squareSize"
          :fill="square.color"
          :opacity="square.opacity"
          class="interactive-square"
          :style="{
            transition: `opacity ${duration}ms ease-out, fill ${duration}ms ease-out`
          }"
        />
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface GridPatternProps {
  width?: number | string
  height?: number | string
  x?: number
  y?: number
  squareSize?: number
  strokeWidth?: number
  strokeColor?: string
  interactive?: boolean
  activeColor?: string
  inactiveColor?: string
  duration?: number
  maxOpacity?: number
  numSquares?: number
}

const props = withDefaults(defineProps<GridPatternProps>(), {
  width: '100%',
  height: '100%',
  x: 0,
  y: 0,
  squareSize: 40,
  strokeWidth: 1,
  strokeColor: 'rgba(148, 163, 184, 0.15)',
  interactive: true,
  activeColor: 'rgba(59, 130, 246, 0.5)',
  inactiveColor: 'transparent',
  duration: 300,
  maxOpacity: 0.5,
  numSquares: 50
})

const containerRef = ref<HTMLDivElement | null>(null)
const patternId = ref(Math.random().toString(36).substring(7))
const mousePosition = ref({ x: 0, y: 0 })
const visibleSquares = ref<Array<{
  x: number
  y: number
  color: string
  opacity: number
}>>([])

let animationFrameId: number | null = null
let gridCols = 0
let gridRows = 0

const updateGridDimensions = () => {
  if (!containerRef.value) return
  
  const rect = containerRef.value.getBoundingClientRect()
  gridCols = Math.ceil(rect.width / props.squareSize)
  gridRows = Math.ceil(rect.height / props.squareSize)
}

const getSquareAtPosition = (x: number, y: number) => {
  if (!containerRef.value) return null
  
  const rect = containerRef.value.getBoundingClientRect()
  const relX = x - rect.left
  const relY = y - rect.top
  
  const col = Math.floor(relX / props.squareSize)
  const row = Math.floor(relY / props.squareSize)
  
  if (col < 0 || col >= gridCols || row < 0 || row >= gridRows) return null
  
  return {
    x: col * props.squareSize,
    y: row * props.squareSize,
    col,
    row
  }
}

const handleMouseMove = (e: MouseEvent) => {
  mousePosition.value = { x: e.clientX, y: e.clientY }
  
  if (!props.interactive) return
  
  const square = getSquareAtPosition(e.clientX, e.clientY)
  if (!square) return
  
  // Generate squares around the mouse position
  const newSquares: typeof visibleSquares.value = []
  const radius = 3 // Number of squares around the center
  
  for (let dx = -radius; dx <= radius; dx++) {
    for (let dy = -radius; dy <= radius; dy++) {
      const col = square.col + dx
      const row = square.row + dy
      
      if (col >= 0 && col < gridCols && row >= 0 && row < gridRows) {
        const distance = Math.sqrt(dx * dx + dy * dy)
        const opacity = Math.max(0, props.maxOpacity * (1 - distance / (radius + 1)))
        
        newSquares.push({
          x: col * props.squareSize,
          y: row * props.squareSize,
          color: props.activeColor,
          opacity
        })
      }
    }
  }
  
  visibleSquares.value = newSquares
}

const handleMouseLeave = () => {
  visibleSquares.value = []
}

onMounted(() => {
  updateGridDimensions()
  
  if (props.interactive && containerRef.value) {
    window.addEventListener('mousemove', handleMouseMove)
    containerRef.value.addEventListener('mouseleave', handleMouseLeave)
  }
  
  window.addEventListener('resize', updateGridDimensions)
})

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('resize', updateGridDimensions)
  
  if (containerRef.value) {
    containerRef.value.removeEventListener('mouseleave', handleMouseLeave)
  }
})
</script>

<style scoped>
.grid-pattern-container {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.grid-pattern-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.interactive-square {
  pointer-events: none;
}
</style>

