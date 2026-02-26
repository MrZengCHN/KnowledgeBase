<script setup>
import ThemeSelect from '@/components/ThemeSelect.vue'
import { gloableStore } from '@/stores/gloableStore'
import { ref } from 'vue'

const store = gloableStore()
const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}
</script>

<template>
  <header class="sticky top-0 z-50">
    <div class="navbar bg-base-100/70 backdrop-blur-md shadow-md">
      <!-- Logo -->
      <div class="navbar-start">
        <RouterLink to="/" class="btn btn-ghost text-xl" @click="closeMenu">MrZengCHN</RouterLink>
      </div>

      <!-- Desktop Menu -->
      <div class="navbar-center hidden md:flex">
        <ul class="menu menu-horizontal px-1">
          <li>
            <RouterLink to="/">Home</RouterLink>
          </li>
          <li>
            <RouterLink to="/knowledge">Knowledge Base</RouterLink>
          </li>
          <li>
            <RouterLink to="/about">About</RouterLink>
          </li>
        </ul>
      </div>

      <!-- Desktop End -->
      <div class="navbar-end gap-2">
        <!-- Music Button -->
        <button class="btn btn-ghost btn-circle" v-if="!store.isMusicPlayerVisible"
          @click="store.setMusicPlayerVisibility(true)" title="Show Music Player">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </button>

        <!-- Theme Select -->
        <ThemeSelect />

        <!-- Mobile Menu Button -->
        <button class="btn btn-ghost btn-circle md:hidden" @click="toggleMenu">
          <svg v-if="!isMenuOpen" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile Menu Dropdown -->
    <Transition name="slide-down">
      <div v-if="isMenuOpen" class="md:hidden bg-base-100/95 backdrop-blur-md shadow-lg border-t border-base-200">
        <ul class="menu menu-lg p-4 gap-2">
          <li>
            <RouterLink to="/" @click="closeMenu" class="rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/knowledge" @click="closeMenu" class="rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              Knowledge Base
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/about" @click="closeMenu" class="rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              About
            </RouterLink>
          </li>
        </ul>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
