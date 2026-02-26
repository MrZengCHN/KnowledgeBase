<script setup>
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'
import MusicPlayer from './components/MusicPlayer.vue'
</script>

<template>
  <div class="min-h-screen relative">
    <!-- Background Color Layer -->
    <div class="fixed inset-0 bg-base-300 -z-20"></div>

    <!-- Global Animated Background Blobs -->
    <div class="fixed top-0 -left-4 w-72 h-72 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob -z-10 pointer-events-none"></div>
    <div class="fixed top-0 -right-4 w-72 h-72 bg-secondary rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 -z-10 pointer-events-none"></div>
    <div class="fixed -bottom-8 left-20 w-72 h-72 bg-accent rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 -z-10 pointer-events-none"></div>

    <NavBar />

    <RouterView />

    <MusicPlayer />
  </div>
</template>

<style scoped>
.animation-delay-2000 {
  animation-delay: 2s;
}
.animation-delay-4000 {
  animation-delay: 4s;
}

@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}
</style>
