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
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  touch-action: none;
  background-color: #000;
}

#game-core-container :deep(canvas) {
  display: block;
}
</style>
