<script setup>
import catImage from '@/assets/cat.jpg'
</script>

<template>
    <div class="card bg-base-100/30 backdrop-blur-md shadow-lg border border-base-200/50 p-6 w-full">
        <img :src="catImage" alt="Cat" class="rounded-lg w-full h-auto object-cover" />
    </div>
</template>
