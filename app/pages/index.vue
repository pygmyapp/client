<script setup>
  import SpaceIcon from '~/components/SpaceIcon.vue';
  import { useWebSocket } from '@vueuse/core';

  /*console.log($fetch("http://localhost:3000/docs"))
  
  const socket = useWebSocket(process.env.WS_URL, {
    onConnected() {
      console.log("hi");
    },
    onMessage(ws, ev) {
      console.log(ev);
    },
    onDisconnected() {
      console.log("bye");
    },
    onDisconnected(ws, ev) {
      console.log("lmao");
    }
  });
  socket.open(); */
</script>

<template>
  <div :class="{
    'flex': true
  }">
    <div :class="{ 
      'object-position-left': true,
      'h-screen': true,
      'w-16': true,
      'bg-stone-700': true,
      'fixed': true
    }">
      <space-icon/>
      <space-icon/>
      <space-icon/>
    </div>
    <div>
      <div :class="{
      'bg-stone-600': true,
      'w-screen': true,
      'h-12': true
    }">
      <p>lol</p>
    </div>
      <div :class="{
        'bg-stone-500': true,
        'w-s': true,
        'h-screen': true
      }"></div>
    </div>
  </div>
</template>