<template>
  <div>
    <UCard>
      <template #header>
        <h1>Authentication</h1>
      </template>

      <p>Logged in: <code>{{ auth.loggedIn }}</code></p>
      <p>Session ID: <code>{{ auth.sessionId }}</code></p>

      <UButton @click="auth.logOut()">Log out</UButton>
    </UCard>

    <UCard>
      <template #header>
        <h1>Gateway</h1>
      </template>

      <p>Ready: <code>{{ app.$gateway.ready||false }}</code></p>
      <p>Status: <code>{{ app.$gateway.state.value.status }}</code></p>

      <p>Events: <code>{{ app.$gateway.state.value.events.length }}</code></p>
      
      <ul style="max-height: 360px; overflow-y: scroll;">
        <li v-for="event in app.$gateway.state.value.events" v-bind:key="event" v-html="event"></li>
      </ul>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['authenticated']
});

const app = useNuxtApp();
const auth = useAuth();
</script>