import { defineStore } from 'pinia'
import { ref } from 'vue'

export const gloableStore = defineStore('gloableStore', () => {
    setTheme(localStorage.getItem('theme'))
    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme)
        localStorage.setItem('theme', theme)
    }

    const isMusicPlayerVisible = ref(false)
    function setMusicPlayerVisibility(visible) {
        isMusicPlayerVisible.value = visible
    }

    return { setTheme, isMusicPlayerVisible, setMusicPlayerVisibility }
})
