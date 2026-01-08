<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useThemeStore } from '@/stores/theme'

// Initialize theme store
const themeStore = useThemeStore()
</script>

<template>
  <RouterView />
</template>

<style lang="scss">
// Global styles are handled in index.scss</style>
