<script setup>
import TimeCard from '../components/TimeCard.vue'
import CalendarCard from '../components/CalendarCard.vue'
import CatCard from '../components/CatCard.vue'
</script>

<template>
  <div class="hero min-h-[calc(100vh-68px)] relative overflow-hidden">
    <div class="hero-content text-center z-10">
      <div class="max-w-4xl">
        <h1 class="text-5xl font-bold mb-4">Hello there</h1>
        <p class="py-6 text-2xl font-serif opacity-90 tracking-widest">
          醉后不知天在水，满船清梦压星河。
        </p>
        <div class="flex flex-col md:flex-row gap-6 justify-center items-start mb-8">
          <div class="flex flex-col gap-6 w-full md:w-auto">
            <TimeCard />
            <CatCard />
          </div>
          <CalendarCard />
        </div>
      </div>
    </div>
  </div>
</template>
