<template>
  <router-link
    to="/dashboard"
    class="flex items-center no-underline hover:no-underline focus:no-underline active:no-underline logo-link"
    aria-label="Logo">
    <img 
      src="/images/sizlogo.png" 
      alt="SIZ Logo" 
      class="logo-image"
      width="50" 
      height="50" 
    />
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

.logo-link .logo-image {
  flex-shrink: 0;
  object-fit: contain;
}

.logo-link:hover {
  text-decoration: none;
}

.logo-link:focus {
  text-decoration: none;
}

.logo-link:active {
  text-decoration: none;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .logo-image {
    width: 40px;
    height: 40px;
  }
}

@media (max-width: 480px) {
  .logo-image {
    width: 35px;
    height: 35px;
  }
}
</style>
