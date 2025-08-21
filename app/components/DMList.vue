<template>
    <aside class="min-w-[241px] bg-muted/75 border-r-1 border-r-neutral-950" id="channels">
    <header class="py-1.5 border-b-1 border-b-muted/60">
      <UButtonGroup class="flex w-auto mx-2">
        <UInput class="flex-grow" variant="subtle" size="sm" placeholder="Search..." />

        <UTooltip text="Start direct message/create group">
          <UButton color="neutral" variant="subtle" size="sm" icon="material-symbols:add" />
        </UTooltip>
      </UButtonGroup>
    </header>

    <p class="m-2 text-sm opacity-75">No channels found</p>
  </aside>
</template>

<script setup lang="ts">
</script>