<script setup>
import { ref, computed } from 'vue'

const currentDate = ref(new Date())

const currentMonthYear = computed(() => {
  return currentDate.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

const daysInMonth = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const days = new Date(year, month + 1, 0).getDate()

  const result = []
  // Add empty slots for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    result.push(null)
  }
  // Add days of the month
  for (let i = 1; i <= days; i++) {
    result.push(new Date(year, month, i))
  }
  return result
})

const isToday = (date) => {
  if (!date) return false
  const today = new Date()
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
}

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
</script>

<template>
  <div class="card bg-base-100/30 backdrop-blur-md shadow-lg border border-base-200/50 p-6 w-full h-full">
    <div class="text-xl font-bold mb-4 text-center">{{ currentMonthYear }}</div>

    <div class="grid grid-cols-7 gap-2 text-center text-sm">
      <div v-for="day in weekDays" :key="day" class="opacity-60 font-semibold">{{ day }}</div>

      <div v-for="(date, index) in daysInMonth" :key="index"
        class="p-2 rounded-full w-8 h-8 flex items-center justify-center mx-auto"
        :class="{ 'bg-primary text-primary-content font-bold': isToday(date), 'opacity-80 hover:bg-base-200/50 cursor-default': date && !isToday(date) }">
        {{ date ? date.getDate() : '' }}
      </div>
    </div>
  </div>
</template>
