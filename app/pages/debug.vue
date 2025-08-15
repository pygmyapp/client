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
        <h1>Cache</h1>
      </template>

      <p>State: <code>{{ app.$cache.state.value }}</code></p>
      <p>User: <code>{{ app.$cache.user.value }}</code></p>
      <p>Users: <code>{{ app.$cache.users.data.value }}</code></p>
      <p>Channels: <code>{{ app.$cache.channels.data.value }}</code></p>
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
useHead({
  title: 'Debug'
});

definePageMeta({
  middleware: ['authenticated']
});

const app = useNuxtApp();
const auth = useAuth();
</script>