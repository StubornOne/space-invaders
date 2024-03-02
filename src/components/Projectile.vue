<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
  posX: number,
  posY: number,
  fromPlayer?: boolean,
}>()

const projectile = ref(null)
defineExpose({
  projectile
})
</script>

<template>
  <div ref="projectile" class="projectile" :style="{'left': posX + 'vw', 'bottom': posY + 'vw'}"></div>
</template>

<style lang="scss">
.projectile {
  position: absolute;
  width: 0.2vw;
  height: 1.5vw;
  background-color: #ffffff;
}
</style>