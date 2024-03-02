<script setup lang="ts">
import Invader from "../assets/Sprites/Invader.svg";

defineProps<{
  iconSize: number
}>()
</script>

<template>
  <Invader :width="iconSize + 'vw'" />
</template>

<style scoped lang="scss">

</style>