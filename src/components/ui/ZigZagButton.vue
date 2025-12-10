<template>
  <component
    :is="componentTag"
    v-bind="componentAttrs"
    class="zigzag-button"
    :class="[
      `zigzag-button--${variant.toLowerCase()}`,
      {
        'zigzag-button--block': block,
        'zigzag-button--dark': isDark,
        'zigzag-button--disabled': disabled
      }
    ]"
    :disabled="disabled && componentTag === 'button'"
    @click="handleClick"
  >
    <span class="zigzag-button__line"></span>
    <span class="zigzag-button__line"></span>
    <span class="zigzag-button__text">
      <slot>
        {{ label }}
      </slot>
    </span>
    <span class="zigzag-button__drow zigzag-button__drow--one"></span>
    <span class="zigzag-button__drow zigzag-button__drow--two"></span>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useTheme } from '@/composables/useTheme';

type Variant = 'A' | 'B' | 'C';

interface Props {
  label?: string;
  to?: string | Record<string, unknown>;
  href?: string;
  target?: string;
  rel?: string;
  type?: 'button' | 'submit' | 'reset';
  variant?: Variant;
  block?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  type: 'button',
  variant: 'C',
  block: false,
  disabled: false,
});

const emit = defineEmits<{ (e: 'click', event: MouseEvent): void }>();

const { isDark } = useTheme();

const componentTag = computed(() => {
  if (props.to) return RouterLink;
  if (props.href) return 'a';
  return 'button';
});

const componentAttrs = computed(() => {
  const base: Record<string, unknown> = {};

  if (props.to) {
    base.to = props.to;
  } else if (props.href) {
    base.href = props.href;
    if (props.target) base.target = props.target;
    if (props.rel) base.rel = props.rel;
  } else {
    base.type = props.type;
  }

  if (props.disabled) {
    base['aria-disabled'] = true;
    if (componentTag.value !== 'button') {
      base.tabindex = -1;
    }
  }

  return base;
});

const handleClick = (event: MouseEvent) => {
  if (props.disabled) {
    event.preventDefault();
    event.stopImmediatePropagation();
    return;
  }

  emit('click', event);
};
</script>

<style scoped>
.zigzag-button {
  --line-color: #555555;
  --hover-line-color: #16a34a;
  --back-color: #ffecf6;
  --hover-back-color: rgba(22, 163, 74, 0.18);
  --current-line-color: var(--line-color);
  --current-back-color: var(--back-color);

  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 240px;
  height: 56px;
  padding: 0;
  text-decoration: none;
  font-size: 14px;
  font-weight: 700;
  color: var(--current-line-color);
  letter-spacing: 2px;
  transition: all 0.3s ease;
  background: transparent;
  border: 0;
  cursor: pointer;
  z-index: 0;
}

.zigzag-button:focus-visible {
  outline: 2px solid rgba(22, 163, 74, 0.5);
  outline-offset: 6px;
}

.zigzag-button--block {
  width: 100%;
}

.zigzag-button--a {
  --line-color: #555555;
  --back-color: #ffecf6;
}

.zigzag-button--b {
  --line-color: #1b1919;
  --back-color: #e9ecff;
}

.zigzag-button--c {
  --line-color: #00135c;
  --back-color: #defffa;
}

.zigzag-button--dark {
  --line-color: #f8fafc;
  --back-color: rgba(148, 163, 184, 0.08);
  --hover-back-color: rgba(22, 163, 74, 0.25);
}

.zigzag-button--disabled {
  cursor: not-allowed;
  filter: grayscale(0.3);
  opacity: 0.75;
}

.zigzag-button__text {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  height: 100%;
}

.zigzag-button::before,
.zigzag-button::after,
.zigzag-button__text::before,
.zigzag-button__text::after {
  content: '';
  position: absolute;
  height: 3px;
  border-radius: 2px;
  background: var(--current-line-color);
  transition: all 0.5s ease;
}

.zigzag-button::before {
  top: 0;
  left: 54px;
  width: calc(100% - 56px * 2 - 16px);
}

.zigzag-button::after {
  top: 0;
  right: 54px;
  width: 8px;
}

.zigzag-button__text::before {
  bottom: 0;
  right: 54px;
  width: calc(100% - 56px * 2 - 16px);
}

.zigzag-button__text::after {
  bottom: 0;
  left: 54px;
  width: 8px;
}

.zigzag-button__line {
  position: absolute;
  top: 0;
  width: 56px;
  height: 100%;
  overflow: hidden;
}

.zigzag-button__line::before {
  content: '';
  position: absolute;
  top: 0;
  width: 150%;
  height: 100%;
  box-sizing: border-box;
  border-radius: 300px;
  border: solid 3px var(--current-line-color);
  transition: border-color 0.5s ease;
}

.zigzag-button__line:nth-child(1),
.zigzag-button__line:nth-child(1)::before {
  left: 0;
}

.zigzag-button__line:nth-child(2),
.zigzag-button__line:nth-child(2)::before {
  right: 0;
}

.zigzag-button__drow {
  position: absolute;
  z-index: -1;
  border-radius: 16px;
  transform-origin: 16px 16px;
  background: var(--current-back-color);
}

.zigzag-button__drow--one {
  top: -16px;
  left: 40px;
  width: 32px;
  height: 0;
  transform: rotate(30deg);
}

.zigzag-button__drow--two {
  top: 44px;
  left: 77px;
  width: 32px;
  height: 0;
  transform: rotate(-127deg);
}

.zigzag-button__drow--one::before,
.zigzag-button__drow--one::after,
.zigzag-button__drow--two::before,
.zigzag-button__drow--two::after {
  content: '';
  position: absolute;
  background: var(--current-back-color);
  transform-origin: 16px 16px;
}

.zigzag-button__drow--one::before {
  bottom: 0;
  left: 0;
  width: 0;
  height: 32px;
  border-radius: 16px;
  transform: rotate(-60deg);
}

.zigzag-button__drow--one::after {
  top: -10px;
  left: 45px;
  width: 0;
  height: 32px;
  border-radius: 16px;
  transform: rotate(69deg);
}

.zigzag-button__drow--two::before {
  bottom: 0;
  left: 0;
  width: 0;
  height: 32px;
  border-radius: 16px;
  transform: rotate(-146deg);
}

.zigzag-button__drow--two::after {
  bottom: 26px;
  left: -40px;
  width: 0;
  height: 32px;
  border-radius: 16px;
  transform: rotate(-262deg);
}

.zigzag-button:hover,
.zigzag-button:focus-visible {
  --current-line-color: var(--hover-line-color);
  --current-back-color: var(--hover-back-color);
  letter-spacing: 6px;
}

.zigzag-button:hover::before,
.zigzag-button:hover .zigzag-button__text::before,
.zigzag-button:focus-visible::before,
.zigzag-button:focus-visible .zigzag-button__text::before {
  width: 8px;
}

.zigzag-button:hover::after,
.zigzag-button:hover .zigzag-button__text::after,
.zigzag-button:focus-visible::after,
.zigzag-button:focus-visible .zigzag-button__text::after {
  width: calc(100% - 56px * 2 - 16px);
}

.zigzag-button:hover .zigzag-button__line::before,
.zigzag-button:focus-visible .zigzag-button__line::before {
  border-color: var(--current-line-color);
}

.zigzag-button:hover .zigzag-button__drow--one,
.zigzag-button:focus-visible .zigzag-button__drow--one {
  animation: drow1 ease-in 0.06s forwards;
}

.zigzag-button:hover .zigzag-button__drow--one::before,
.zigzag-button:focus-visible .zigzag-button__drow--one::before {
  animation: drow2 linear 0.08s 0.06s forwards;
}

.zigzag-button:hover .zigzag-button__drow--one::after,
.zigzag-button:focus-visible .zigzag-button__drow--one::after {
  animation: drow3 linear 0.03s 0.14s forwards;
}

.zigzag-button:hover .zigzag-button__drow--two,
.zigzag-button:focus-visible .zigzag-button__drow--two {
  animation: drow4 linear 0.06s 0.2s forwards;
}

.zigzag-button:hover .zigzag-button__drow--two::before,
.zigzag-button:focus-visible .zigzag-button__drow--two::before {
  animation: drow3 linear 0.03s 0.26s forwards;
}

.zigzag-button:hover .zigzag-button__drow--two::after,
.zigzag-button:focus-visible .zigzag-button__drow--two::after {
  animation: drow5 linear 0.06s 0.32s forwards;
}

.zigzag-button:disabled,
.zigzag-button--disabled {
  cursor: not-allowed;
  pointer-events: none;
  opacity: 0.6;
}

@keyframes drow1 {
  0% {
    height: 0;
  }
  100% {
    height: 100px;
  }
}

@keyframes drow2 {
  0% {
    width: 0;
    opacity: 0;
  }
  10% {
    opacity: 0;
  }
  11% {
    opacity: 1;
  }
  100% {
    width: 120px;
  }
}

@keyframes drow3 {
  0% {
    width: 0;
  }
  100% {
    width: 80px;
  }
}

@keyframes drow4 {
  0% {
    height: 0;
  }
  100% {
    height: 120px;
  }
}

@keyframes drow5 {
  0% {
    width: 0;
  }
  100% {
    width: 124px;
  }
}
</style>

