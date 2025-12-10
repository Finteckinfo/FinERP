<template>
  <div class="features-grid">
    <article
      v-for="feature in features"
      :key="feature.title"
      class="feature-card"
    >
      <div class="feature-icon">
        <v-icon size="24" color="#6b7280">
          {{ feature.icon }}
        </v-icon>
      </div>
      <h3 class="feature-title">{{ feature.title }}</h3>
      <p class="feature-description">{{ feature.description }}</p>
    </article>
  </div>
</template>

<script setup lang="ts">
interface Feature {
  title: string;
  description: string;
  icon: string;
}

const features: Feature[] = [
  {
    title: 'Secure Escrow',
    description:
      'Safeguard every payment with on-chain escrow and automated release rules that give both teams and contributors confidence.',
    icon: 'mdi-shield-lock',
  },
  {
    title: 'Web3 Native',
    description:
      'Instant account verification, FIN token balances, and signature-based approvals—built for a borderless workforce.',
    icon: 'mdi-wallet-plus',
  },
  {
    title: 'Remote Alignment',
    description:
      'Keep work private to the people involved. Owners, managers, creators, and assignees collaborate without noisy spillover.',
    icon: 'mdi-account-group',
  },
  {
    title: 'Guaranteed Payouts',
    description:
      'Task states sync with escrow so milestones trigger real payouts without manual intervention or accounting delays.',
    icon: 'mdi-rocket-launch',
  },
  {
    title: 'Operational Clarity',
    description:
      'Surface live obligations, processing transfers, and released funds in one glance with our escrow analytics widgets.',
    icon: 'mdi-chart-box',
  },
  {
    title: 'Global Ecosystem',
    description:
      'Match contributors and projects in any market, with instant onboarding flows and localized compliance baked into the platform.',
    icon: 'mdi-earth',
  },
];
</script>

<style scoped>
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 2rem;
  transition: border-color 0.2s;
}

.dark-theme .feature-card {
  background-color: #1a1a1a;
  border-color: #2f2f2f;
}

.feature-card:hover {
  border-color: #d1d5db;
}

.dark-theme .feature-card:hover {
  border-color: #4b5563;
}

.feature-icon {
  margin-bottom: 1rem;
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
  color: #1a1a1a;
  letter-spacing: -0.01em;
}

.dark-theme .feature-title {
  color: #ffffff;
}

.feature-description {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: #4b5563;
  margin: 0;
}

.dark-theme .feature-description {
  color: #9ca3af;
}

@media (max-width: 768px) {
  .features-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .feature-card {
    padding: 1.5rem;
  }
}
</style>

