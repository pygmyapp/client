<template>
  <div class="flex items-center justify-center h-screen gap-4">
    <template v-if="$gateway && !$gateway.state.value.hasFailed">
      <UIcon name="svg-spinners:3-dots-bounce" class="text-neutral-500 size-7" />
      <p class="opacity-75">Connecting to Pygmy...</p>
    </template>

    <template v-else>
      <UIcon name="material-symbols:cancel-outline" class="text-error size-7" />
      <p class="text-error opacity-75">Failed to connect to Pygmy. See console for more information.</p>
    </template>
  </div>
</template>

<script setup lang="ts">
const { $gateway } = useNuxtApp();
</script>