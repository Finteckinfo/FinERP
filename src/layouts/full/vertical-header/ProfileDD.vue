<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { LogoutIcon, SettingsIcon, UserIcon, SearchIcon } from 'vue-tabler-icons'
import { useNextAuth } from '@/composables/useNextAuth'
import ConnectWallet from '@/layouts/full/vertical-header/ConnectWallet.vue'

// wallet modal state & active wallet
import { isWalletModalOpen, openWalletModal } from '@/stores/walletStore'
import { activeAccount } from '@/lib/walletManager'

const swt1 = ref(true)
const swt2 = ref(false)
const { user } = useNextAuth()

// fallback if no name
const firstName = computed(() => user.value?.firstName || 'Guest')

// computed for connected wallet
const walletAddress = computed(() => activeAccount.value?.address || 'Connect Wallet')

// debug logs
watch(activeAccount, val => console.log('ProfileDD sees active wallet change:', val))
watch(isWalletModalOpen, val => console.log('ProfileDD sees wallet modal change:', val))

function handleOpenWallet() {
  console.log('Opening wallet modal from ProfileDD')
  openWalletModal()
}

// Handle NextAuth logout
async function handleLogout() {
  try {
    // Redirect to main domain for NextAuth logout
    const ssoUrl = import.meta.env.VITE_SSO_PRIMARY_DOMAIN || 'http://localhost:3000'
    window.location.href = `${ssoUrl}/api/auth/signout?callbackUrl=${encodeURIComponent(ssoUrl)}`
    console.log('User logged out successfully')
  } catch (error) {
    console.error('Logout error:', error)
  }
}
</script>

<template>
  <div class="pa-4">
    <h4 class="mb-n1">
      Good Morning, <span class="font-weight-regular">{{ firstName }}</span>
    </h4>
    <span class="text-subtitle-2 text-medium-emphasis">Project admin</span>

    <v-text-field
      persistent-placeholder
      placeholder="Search"
      class="my-3"
      variant="outlined"
      hide-details
    >
      <template v-slot:prepend-inner>
        <SearchIcon stroke-width="1.5" size="20" class="SearchIcon" />
      </template>
    </v-text-field>

    <v-divider></v-divider>

    <perfect-scrollbar style="height: calc(100vh - 300px); max-height: 515px">
      <div class="rounded-md px-5 py-3 my-3" :style="{ background: 'var(--erp-surface)', color: 'var(--erp-text)' }">
        <div class="d-flex align-center justify-space-between">
          <h5 class="text-h5">Allow Notifications</h5>
          <v-switch v-model="swt2" hide-details inset :style="{ '--v-theme-primary': 'var(--erp-accent-indigo)' }"></v-switch>
        </div>
      </div>

      <!-- Wallet Connect button -->
      <div class="my-4">
        <v-btn block class="rounded-lg" :style="{ background: 'var(--erp-accent-indigo)', color: '#ffffff' }" @click="handleOpenWallet()">
          {{ walletAddress }}
        </v-btn>

        <!-- Ensure the ConnectWallet component is mounted so its v-dialog (bound to the store ref)
         can appear when openWalletModal() toggles the store. Import ConnectWallet in your <script setup>. -->
        <ConnectWallet />
      </div>

      <v-divider></v-divider>

      <v-list class="mt-3">
        <v-list-item rounded="md" class="erp-hover" :style="{ background: 'transparent', color: 'var(--erp-text)' }">
          <template v-slot:prepend>
            <SettingsIcon size="20" class="mr-2" />
          </template>
          <v-list-item-title class="text-subtitle-2"> Account Settings </v-list-item-title>
        </v-list-item>

        <v-list-item rounded="md" class="erp-hover" :style="{ background: 'transparent', color: 'var(--erp-text)' }">
          <template v-slot:prepend>
            <UserIcon size="20" class="mr-2" />
          </template>
          <v-list-item-title class="text-subtitle-2"> Social Profile </v-list-item-title>
          <template v-slot:append>
            <v-chip class="text-white" text="02" variant="flat" size="small" :style="{ background: 'var(--erp-accent-indigo)' }" />
          </template>
        </v-list-item>

        <v-list-item @click="handleLogout()" rounded="md" class="erp-hover" :style="{ background: 'transparent', color: 'var(--erp-text)' }">
          <template v-slot:prepend>
            <LogoutIcon size="20" class="mr-2" />
          </template>
          <v-list-item-title class="text-subtitle-2"> Logout </v-list-item-title>
        </v-list-item>
      </v-list>
    </perfect-scrollbar>
  </div>
</template>
