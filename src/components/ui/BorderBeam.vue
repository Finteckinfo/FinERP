<template>
  <div :class="['border-beam', className]" :style="rootStyle">
    <div
      class="border-beam__beam"
      :style="beamStyle"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from 'vue';

interface BorderBeamProps {
  size?: number;
  duration?: number;
  delay?: number;
  colorFrom?: string;
  colorTo?: string;
  reverse?: boolean;
  initialOffset?: number;
  borderWidth?: number;
  className?: string;
  style?: Record<string, any>;
}

const props = withDefaults(defineProps<BorderBeamProps>(), {
  size: 120,
  duration: 6,
  delay: 0,
  colorFrom: '#ffaa40',
  colorTo: '#9c40ff',
  reverse: false,
  initialOffset: 0,
  borderWidth: 1,
  className: '',
  style: () => ({}),
});

const rootStyle = computed<CSSProperties>(() => ({
  '--border-beam-width': `${props.borderWidth}px`,
  position: 'absolute',
  inset: '0',
  borderRadius: 'inherit',
  pointerEvents: 'none' as const,
  ...props.style,
}));

const beamStyle = computed<CSSProperties>(() => ({
  width: `${props.size}px`,
  '--beam-color-from': props.colorFrom,
  '--beam-color-to': props.colorTo,
  '--beam-start': `${props.initialOffset}%`,
  '--beam-end': `${100 + props.initialOffset}%`,
  '--beam-duration': `${props.duration}s`,
  '--beam-delay': `${-props.delay}s`,
  '--beam-direction': props.reverse ? 'reverse' : 'normal',
  offsetPath: `rect(0 auto auto 0 round ${props.size}px)`,
  animationName: props.reverse ? 'border-beam-reverse' : 'border-beam-forward',
} as CSSProperties));
</script>

<style scoped>
.border-beam {
  border: var(--border-beam-width) solid transparent;
  mask-image: linear-gradient(transparent, transparent), linear-gradient(#000, #000);
  mask-clip: padding-box, border-box;
  mask-composite: intersect;
}

.border-beam__beam {
  position: absolute;
  aspect-ratio: 1 / 1;
  background: linear-gradient(
    to left,
    var(--beam-color-from),
    var(--beam-color-to),
    transparent
  );
  offset-distance: var(--beam-start);
  animation: border-beam-forward var(--beam-duration) linear infinite;
  animation-delay: var(--beam-delay);
}

.border-beam__beam[style*="border-beam-reverse"] {
  animation-name: border-beam-reverse;
}

@keyframes border-beam-forward {
  from {
    offset-distance: var(--beam-start);
  }
  to {
    offset-distance: var(--beam-end);
  }
}

@keyframes border-beam-reverse {
  from {
    offset-distance: var(--beam-end);
  }
  to {
    offset-distance: calc(-1 * var(--beam-start));
  }
}
</style>
