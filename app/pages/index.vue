<template>
  <div class="flex h-screen">
    <!-- Channel list (direct messages) -->
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

    <!-- Friends -->
    <main class="w-full" id="friends">
      <header class="flex flex-row w-full h-[42px] py-2 bg-muted/75 border-b-1 border-b-muted/60">
        <div class="flex items-center px-2 mr-2">
          <UIcon name="material-symbols:group" class="mr-1 size-5" />
          <h1 class="text-lg">Friends</h1>
        </div>

        <UButton @click="selected = 'online'" class="mr-1" :color="selected === 'online' ? 'primary' : 'neutral'" :variant="selected === 'online' ? 'soft' : 'link'">Online</UButton>
        <UButton @click="selected = 'all'" class="mr-1" :color="selected === 'all' ? 'primary' : 'neutral'" :variant="selected === 'all' ? 'soft' : 'link'">All</UButton>
        <UButton @click="selected = 'pending'" :color="selected === 'pending' ? 'primary' : 'neutral'" :variant="selected === 'pending' ? 'soft' : 'link'">
          Pending
          <UChip v-if="requests.incoming.length > 0" class="mx-1" color="error" size="3xl" :text="requests.total"></UChip>
        </UButton>

        <UButton @click="addFriend = !addFriend" class="ml-auto mr-2" color="neutral" variant="outline" icon="material-symbols:person-add">Add Friend</UButton>
      </header>

      <div>
        <template v-if="selected === 'online'">
          <p v-if="allFriends.length <= 0 && onlineFriends.length <= 0" class="m-2 text-sm opacity-75">No friends found</p>
          <p v-else-if="onlineFriends.length <= 0" class="m-2 text-sm opacity-75">No friends online</p>

          <div v-else class="p-2">
            <FriendListRow type="friend" v-for="friend in onlineFriends" v-bind:key="friend.id" :id="friend.id" />
          </div>
        </template>

        <template v-if="selected === 'all'">
          <p v-if="allFriends.length <= 0" class="m-2 text-sm opacity-75">No friends found</p>

          <div v-else class="p-2">
            <FriendListRow type="friend" v-for="friend in allFriends" v-bind:key="friend.id" :id="friend.id" />
          </div>
        </template>

        <template v-if="selected === 'pending'">
          <p v-if="requests.total <= 0" class="m-2 text-sm opacity-75">No pending friend requests found</p>

          <div v-else class="p-2">
            <template v-if="requests.incoming.length > 0">
              <h1 class="text-lg">Incoming ({{ requests.incoming.length.toLocaleString() }})</h1>

              <USeparator class="mt-1 mb-2" />

              <FriendListRow type="request" v-for="request in requests.incoming" v-bind:key="request.from" :request="request" />
            </template>

            <template v-if="requests.outgoing.length > 0" :class="requests.incoming.length > 0 ? 'mt-4' : ''">
              <h1 class="text-lg">Outgoing ({{ requests.outgoing.length.toLocaleString() }})</h1>

              <USeparator class="mt-1 mb-2" />

              <FriendListRow type="request" v-for="request in requests.outgoing" v-bind:key="request.from" :request="request" />
            </template>
          </div>
        </template>
      </div>
    </main>

    <!-- Add Friend -->
    <AddFriendModal v-model:open="addFriend" @close="addFriend = false" />
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Friends'
});

definePageMeta({
  middleware: ['authenticated']
});

const { $cache } = useNuxtApp();

const selected = ref<'online' | 'all' | 'pending'>('online');
const addFriend = ref(false);

// Fetch user data
onMounted(async () => {
  await Promise.all(
    $cache.user.value.friends.map(async (id) => {
      await $cache.users.fetch(id);
    })
  );

  await Promise.all(
    $cache.user.value.requests.map(async (request) => {
      await $cache.users.fetch(request.direction === 'INCOMING' ? request.from : request.to);
    })
  );
});

const allFriends = computed(() => 
  $cache.user.value.friends.map((id) => {
    return {
      id
    }
  })
);

// TODO: filter by $cache.users, get by id and check that presence.status === ONLINE
const onlineFriends = computed(() => allFriends.value.filter((user) => false));

const requests = computed(() => ({
  incoming: $cache.user.value.requests
    .filter(({ direction }) => direction === 'INCOMING'),
  outgoing: $cache.user.value.requests
    .filter(({ direction }) => direction === 'OUTGOING'),
  total: $cache.user.value.requests.length
}));
</script>