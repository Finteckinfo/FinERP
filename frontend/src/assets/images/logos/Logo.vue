<template>
  <router-link
    to="/dashboard"
    class="flex items-center no-underline hover:no-underline focus:no-underline active:no-underline logo-link"
    aria-label="FinPro Logo">
    <div class="logo-text-container">
      <span class="logo-text">FinPro</span>
    </div>
  </router-link>
</template>

<script setup lang="ts">
// No additional logic needed for this component
</script>

<style scoped>
.logo-link {
  text-decoration: none;
  color: inherit;
  justify-content: flex-start;
  width: auto;
  flex-direction: row;
  align-items: center;
  display: flex;
}

.logo-text-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, var(--erp-accent-green) 0%, #4CAF50 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: var(--erp-accent-green);
  transition: all 0.3s ease;
}

.logo-link:hover .logo-text {
  transform: scale(1.05);
}

.logo-link:focus {
  text-decoration: none;
}

.logo-link:active {
  text-decoration: none;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .logo-text {
    font-size: 1.25rem;
  }
}

@media (max-width: 480px) {
  .logo-text {
    font-size: 1.125rem;
  }
}
</style>
