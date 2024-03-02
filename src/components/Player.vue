<script setup lang="ts">
import Shooter from "../assets/Sprites/Player.svg";


defineProps<{
  iconSize: number,
  posX: number
}>()
</script>

<template>
  <Shooter class="player" :width="iconSize + 'vw'" :style="{'left': posX + 'vw'}" />
</template>

<style scoped lang="scss">
.player {
  position: absolute;
  bottom: 0;
  aspect-ratio: 1;
  color: green;
}
</style>