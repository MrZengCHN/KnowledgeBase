<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const currentTime = ref(new Date())
let timer = null

const timeString = computed(() => {
  return currentTime.value.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
})

const greeting = computed(() => {
  const hour = currentTime.value.getHours()
  if (hour >= 5 && hour < 12) return '早上好'
  if (hour >= 12 && hour < 14) return '中午好'
  if (hour >= 14 && hour < 18) return '下午好'
  if (hour >= 18 && hour < 24) return '晚上好'
  return '夜深了'
})

onMounted(() => {
  timer = setInterval(() => {
    currentTime.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="card bg-base-100/30 backdrop-blur-md shadow-lg border border-base-200/50 p-6 w-full">
    <div class="text-6xl font-bold font-mono tracking-wider">{{ timeString }}</div>
    <div class="text-2xl mt-2 opacity-80 font-light">{{ greeting }}</div>
  </div>
</template>
