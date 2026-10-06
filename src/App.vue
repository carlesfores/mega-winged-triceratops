<script setup>
import {ref, onMounted, onUnmounted} from "vue";
import { EventBus } from "./game-core/event-bus";
import InitGame from "./game-core/index";

const game = ref();

onMounted(() => {
  game.value = InitGame('game-core-container');

  EventBus.on('game-loaded', (scene) => {
    console.log({scene});
  });
});

onUnmounted(() => {
  game.value.destroy(true);
  game.value = null;
});
</script>

<template>
  <div id="game-core-container"></div>
</template>

<style scoped>
#game-core-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>
