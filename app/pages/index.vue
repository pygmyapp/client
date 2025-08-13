<template>
  <div class="flex h-screen">
    <!-- Channel list (direct messages) -->
    <aside class="w-[241px] bg-muted/75 border-r-1 border-r-neutral-950" id="channels">
      <UButtonGroup class="my-1.5 mx-2 w-auto">
        <UInput variant="subtle" size="sm" placeholder="Search..." />
        <UButton color="neutral" variant="subtle" size="sm" icon="material-symbols:add" />
      </UButtonGroup>

      <p class="m-2 text-sm opacity-75">No channels found</p>
    </aside>

    <!-- Chat area -->
    <main id="chat">
      <h1>Chat</h1>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['authenticated']
});
</script>