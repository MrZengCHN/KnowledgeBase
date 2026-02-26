<script setup>
import TimeCard from '../components/TimeCard.vue'
import CalendarCard from '../components/CalendarCard.vue'
import CatCard from '../components/CatCard.vue'
</script>

<template>
  <div class="hero min-h-[calc(100vh-68px)] relative overflow-hidden">
    <div class="hero-content text-center z-10">
      <div class="max-w-4xl">
        <h1 class="text-5xl font-bold mb-4 animate-fade-in-down animation-delay-500">Hello there</h1>
        <p class="py-6 text-2xl font-serif animate-fade-in-up animation-delay-500 opacity-90 tracking-widest">
          醉后不知天在水，满船清梦压星河。
        </p>
        <div class="flex flex-col md:flex-row gap-6 justify-center items-start mb-8 animate-fade-in-down">
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

<style scoped>
.animation-delay-500 {
  animation-delay: 0.5s;
}


@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translate3d(0, -20px, 0);
  }

  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

.animate-fade-in-down {
  animation: fadeInDown 1s ease-out both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translate3d(0, 20px, 0);
  }

  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 1s ease-out both;
}
</style>
