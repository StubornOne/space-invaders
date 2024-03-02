<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue'
import { useGame } from '@/Game'
import Player from '@/components/Player.vue'
import Invader from '@/components/Invader.vue'
import Projectile from '@/components/Projectile.vue'


const projectiles = ref([])


//const game = useGame(canvas)

const $canvas = ref<HTMLCanvasElement>()
useGame({
  $canvas,
})

onMounted(() => {
})

</script>

<template>

  <canvas class="game" ref="$canvas"></canvas>
</template>

<style scoped lang="scss">
.game {
  display: flex;
  //position: relative;
  // width: 50vw;
  // aspect-ratio: 1;
  background-color: rgb(33, 33, 33);
  margin: 20px;
}

.alien-grid {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  height: 5%;
}

.bullet {
  width: 0.2vw;
  height: 1.5vw;
  background-color: #ffffff;
  position: absolute;
  bottom: 3vw;
}

.alien-row {
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>