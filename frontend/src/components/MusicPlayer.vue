<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { gloableStore } from '@/stores/gloableStore'

const store = gloableStore()

// Auto-load music files
const musicModules = import.meta.glob('@/assets/music/*.mp3', { eager: true, query: '?url', import: 'default' })
const playlist = Object.entries(musicModules).map(([path, url]) => {
  // Extract filename as title
  const title = path.split('/').pop().replace('.mp3', '')
  return { title, url }
})

const audio = ref(new Audio())
const isPlaying = ref(false)
const currentTrackIndex = ref(0)
const volume = ref(0.5)
const progress = ref(0)
const duration = ref(0)
const showPlaylist = ref(false)

const currentTrack = computed(() => playlist[currentTrackIndex.value] || null)

const togglePlay = () => {
  if (!currentTrack.value) return

  if (isPlaying.value) {
    audio.value.pause()
  } else {
    audio.value.play()
  }
  isPlaying.value = !isPlaying.value
}

const playTrack = (index) => {
  if (index < 0 || index >= playlist.length) return

  currentTrackIndex.value = index
  audio.value.src = playlist[index].url
  audio.value.load()
  audio.value.play()
  isPlaying.value = true
}

const nextTrack = () => {
  let nextIndex = currentTrackIndex.value + 1
  if (nextIndex >= playlist.length) nextIndex = 0
  playTrack(nextIndex)
}

const prevTrack = () => {
  let prevIndex = currentTrackIndex.value - 1
  if (prevIndex < 0) prevIndex = playlist.length - 1
  playTrack(prevIndex)
}

const isDragging = ref(false)
const progressBarRef = ref(null)

const updateProgress = () => {
  if (!isDragging.value) {
    progress.value = (audio.value.currentTime / audio.value.duration) * 100
  }
}

const handleMouseDown = (event) => {
  isDragging.value = true
  updateDrag(event)
  document.addEventListener('mousemove', updateDrag)
  document.addEventListener('mouseup', stopDrag)
}

const updateDrag = (event) => {
  if (!progressBarRef.value) return
  const rect = progressBarRef.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const width = rect.width
  const percentage = Math.max(0, Math.min(100, (x / width) * 100))
  progress.value = percentage
}

const stopDrag = (event) => {
  if (!isDragging.value) return
  isDragging.value = false
  updateDrag(event)
  const duration = audio.value.duration
  if (duration) {
    audio.value.currentTime = (progress.value / 100) * duration
  }
  document.removeEventListener('mousemove', updateDrag)
  document.removeEventListener('mouseup', stopDrag)
}

const updateVolume = () => {
  audio.value.volume = volume.value
}

onMounted(() => {
  if (playlist.length > 0) {
    audio.value.src = playlist[0].url
    audio.value.volume = volume.value
  }

  audio.value.addEventListener('timeupdate', updateProgress)
  audio.value.addEventListener('ended', nextTrack)
  audio.value.addEventListener('loadedmetadata', () => {
    duration.value = audio.value.duration
  })
})
</script>

<template>
  <div class="fixed bottom-4 left-4 z-50 transition-all duration-300"
    :class="{ 'translate-y-full opacity-0': !store.isMusicPlayerVisible }">
    <div
      class="card w-80 bg-base-100/70 backdrop-blur-md shadow-xl border border-base-200 overflow-visible transition-all duration-300 hover:bg-base-100/90 relative group">
      <!-- Hide Button -->
      <button
        class="btn btn-ghost btn-xs btn-circle absolute -top-2 -right-2 z-50 bg-base-100 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
        @click="store.setMusicPlayerVisibility(false)" title="Hide Player">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div class="card-body p-4">
        <!-- Track Info -->
        <div class="flex items-center gap-3 mb-2">
          <div class="avatar placeholder">
            <div
              class="bg-neutral text-neutral-content rounded-full w-10 animate-spin-slow flex items-center justify-center"
              :class="{ 'paused': !isPlaying }">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
          </div>
          <div class="overflow-hidden w-full">
            <div class="whitespace-nowrap font-bold text-sm truncate">
              {{ playlist.length > 0 ? (currentTrack?.title || 'Select a Track') : 'No Music Found' }}
            </div>
            <div class="text-xs opacity-60">
              {{ playlist.length > 0 ? 'Music Player' : 'Add mp3 to src/assets/music' }}
            </div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="w-full h-1 bg-base-300 rounded-full cursor-pointer mb-3 group" @mousedown="handleMouseDown"
          ref="progressBarRef">
          <div class="h-full bg-primary rounded-full relative" :style="{ width: `${progress}%` }">
            <div
              class="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            </div>
          </div>
        </div>

        <!-- Controls -->
        <div class="flex justify-between items-center">
          <!-- Volume Control (Click to show) -->
          <div class="dropdown dropdown-top">
            <label tabindex="0" class="btn btn-ghost btn-xs btn-circle">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </label>
            <div tabindex="0"
              class="dropdown-content p-2 shadow bg-base-100 rounded-box w-24 mb-12 z-[100] -rotate-90 left-1/2 -translate-x-1/3 origin-bottom">
              <input type="range" min="0" max="1" step="0.01" v-model="volume" @input="updateVolume"
                class="range range-xs range-primary" />
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button class="btn btn-ghost btn-sm btn-circle" @click="prevTrack">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button class="btn btn-primary btn-sm btn-circle" @click="togglePlay">
              <svg v-if="!isPlaying" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>

            <button class="btn btn-ghost btn-sm btn-circle" @click="nextTrack">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <!-- Playlist Toggle -->
          <div class="dropdown dropdown-top dropdown-end">
            <label tabindex="0" class="btn btn-ghost btn-xs btn-circle">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </label>
            <ul tabindex="0"
              class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 mb-2 max-h-60 overflow-y-auto">
              <li v-for="(track, index) in playlist" :key="index">
                <a :class="{ 'active': currentTrackIndex === index }" @click="playTrack(index)">
                  <span class="truncate text-xs">{{ track.title }}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-spin-slow {
  animation: spin 4s linear infinite;
}

.paused {
  animation-play-state: paused;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
