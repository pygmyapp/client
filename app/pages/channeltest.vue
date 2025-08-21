<template>
  <div class="flex h-screen">
    <!-- Channel list (direct messages) -->
    <DMList />

    <!-- Content -->
    <main class="flex flex-col flex-1 h-screen w-full">
      <!-- Header -->
      <header class="flex flex-row w-full h-[42px] py-2 bg-muted/75 border-b-1 border-b-muted/60">
        <div class="flex items-center px-2 mr-2">
          <UAvatar
            :src="`/cdn/avatars/1234`"
            class="mr-2 w-[28px] h-auto"
            :chip="{
              inset: true,
              color: 'success', // status color
              size: 'xl',
              position: 'bottom-right',
              //ui: status.offline ? { base: 'bg-gray-600' } : {}
            }"
          />

          <h1 class="text-lg">@example</h1>
        </div>
      </header>

      <div class="flex flex-col flex-1 min-h-0">
        <!-- Messages -->
        <div ref="channelContainer" class="flex-1 overflow-y-auto px-4 py-2 flex flex-col" @scroll="onScroll">
          <div class="mt-auto flex flex-col space-y-2">
            <div v-if="!messages.length">
              <p>This is the beginning of your conversation with @username</p>
            </div>

            <p v-else v-for="i in messages" :key="i">{{ i }}</p>
          </div>
        </div>

        <!-- Input -->
        <div class="flex min-h-[42px] py-2 border-t-1 border-t-muted/60">
          <UButton class="mx-2 max-h-8" color="neutral" variant="subtle" icon="material-symbols:add" />
          <UTextarea class="w-full" v-model="input" @keydown.enter="handleInputEnter" placeholder="Message @username..." :rows="1" autoresize />
          <UButton class="mx-2 max-h-8" color="neutral" variant="subtle" icon="material-symbols:send" />
        </div>

      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: '@example'
});

definePageMeta({
  middleware: ['authenticated']
});

const app = useNuxtApp();
const auth = useAuth();

const channelContainer = ref<HTMLDivElement | null>(null);

// Keeps track of if the channel should scroll to the bottom when new messages
// are received. If the user scrolls up too far, new messages won't scroll it back down.
const autoScroll = ref(true);



const messages = ref<string[]>([]);//TODO: replace
const input = ref('');//TODO: replace
// TODO: replace
const handleInputEnter = (event: KeyboardEvent) => {
  // Allow new lines with shift+enter
  if (event.shiftKey) return;

  event.preventDefault();

  // Send message
  if (!input.value) return;

  messages.value.push(input.value);
  input.value = '';

  scrollToBottom();
}



/**
 * Scroll the channel container to the most recent message
 */
const scrollToBottom = () => {
  nextTick(() => {
    if (autoScroll.value && channelContainer.value) {
      channelContainer.value.scrollTo({
        top: channelContainer.value.scrollHeight,
        behavior: 'instant',
      })
    }
  })
}

/**
 * Handle scroll events on the channel container
 */
const onScroll = () => {
  if (!channelContainer.value) return;

  const { scrollTop, scrollHeight, clientHeight } = channelContainer.value;

  autoScroll.value = scrollTop + clientHeight >= scrollHeight - 50;
}

// On load, scroll to the most recent messages
onMounted(() => {
  nextTick(() => {
    channelContainer.value?.scrollTo({
      top: channelContainer.value.scrollHeight,
      behavior: 'instant'
    });
  });
});
</script>