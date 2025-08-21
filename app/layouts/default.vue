<template>
  <ClientOnly v-if="app.$gateway && app.$gateway.ready !== undefined">
    <LoadingState v-if="!app.$gateway.ready" />

    <div v-else class="flex h-screen">
      <!-- Sidebar -->
      <aside class="h-screen w-[73px] sticky top-0 bg-elevated border-r-1 border-r-neutral-900" id="sidebar">
        <div class="my-2.5 mx-2">
          <UTooltip text="Direct Messages" :content="{
            align: 'end',
            side: 'bottom',
            sideOffset: 0
          }">
            <UChip
              :show="app.$cache.user.value.requests.filter(({ direction }) => direction === 'INCOMING').length > 0"
              color="error" position="top-left" inset
            >
              <ULink class="mr-2 cursor-pointer" to="/" as="button" :active="false">
                <UIcon name="material-symbols:mail-outline" class="size-6" />
              </ULink>
            </UChip>
          </UTooltip>

          <UTooltip text="Join or create a server" :content="{
            align: 'end',
            side: 'bottom',
            sideOffset: 0
          }">
            <ULink class="cursor-pointer" as="button">
              <UIcon name="material-symbols:add-box-outline" class="size-6" />
            </ULink>
          </UTooltip>
        </div>

        <ULink class="mx-auto text-sm" to="/debug" as="button">
          Debug
        </ULink>

        <ULink class="mx-auto text-sm" to="/channeltest" as="button">
          Test
        </ULink>

        <div class="absolute bottom-0">
          <UDropdownMenu :items="userDropdownItems" :ui="{ content: 'w-64' }" arrow>
            <UTooltip :text="`@${user?.username}`">
              <UAvatar
                :src="`/cdn/avatars/${user?.id}`"
                class="m-3 w-[48px] h-auto"
                :chip="{
                  inset: true,
                  color: status.color || 'neutral',
                  size: '3xl',
                  position: 'bottom-right',
                  ui: status.offline ? { base: 'bg-gray-600' } : {}
                }"
              />
            </UTooltip>

            <template #online-label>
              <p class="text-left">
                <UChip class="mr-2.5 pl-1.5 pb-1.5" color="success" size="3xl" />
                Online
              </p>
            </template>

            <template #away-label>
              <p class="text-left">
                <UChip class="mr-2.5 pl-1.5 pb-1.5" color="warning" size="3xl" />
                Away
              </p>
            </template>

            <template #dnd-label>
              <p class="text-left">
                <UChip class="mr-2.5 pl-1.5 pb-1.5" color="error" size="3xl" />
                Do Not Disturb
              </p>
              <p class="ml-5 text-left text-sm text-muted text-wrap">You won't recieve any notifications.</p>
            </template>

            <template #invisible-label>
              <p class="text-left">
                <UChip class="mr-2.5 pl-1.5 pb-1.5" size="3xl" :ui="{ base: 'bg-gray-600' }" />
                Invisible
              </p>
              <p class="ml-5 text-left text-sm text-muted text-wrap">You will appear offline, but will have full access to Pygmy.</p>
            </template>

            <template #presence-label>
              <p>{{ $gateway.state.value.presence.text ? `"${$gateway.state.value.presence.text}"` : 'Set status' }}</p>
            </template>
          </UDropdownMenu>
        </div>
      </aside>

      <!-- Main/Content -->
      <main class="flex-grow overflow-y-auto" id="content">
        <slot />
      </main>

      <!-- Development version -->
      <div v-if="env === 'development'" class="fixed bottom-1 right-1 text-muted/50 text-sm pointer-events-none select-none">
        Pygmy v{{ runtimeConfig.public.version }} ({{ env }})
      </div>

      <SetStatusModal v-model:open="setStatus" @close="setStatus = false" />
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui';

const app = useNuxtApp();
const runtimeConfig = useRuntimeConfig();
const { user, token } = useAuth();

const env = process.env.NODE_ENV;
const setStatus = ref(false);

// Connect to Gateway
if (app.$gateway && app.$gateway.state.value.status === 'disconnected')
  app.$gateway.connect(token.value!);

// User status
const status = computed<{
  color: 'success' | 'warning' | 'error' | 'neutral';
  offline: boolean;
}>(() => {
  if (app.$gateway.state.value.presence.status === 'online') return { color: 'success', offline: false };
  if (app.$gateway.state.value.presence.status === 'away') return { color: 'warning', offline: false };
  if (app.$gateway.state.value.presence.status === 'dnd') return { color: 'error', offline: false };
  if (app.$gateway.state.value.presence.status === 'offline') return { color: 'neutral', offline: true }

  return { color: 'neutral', offline: false }
});

// User dropdown
const userDropdownItems = computed<DropdownMenuItem[]>(() => ([
  {
    label: `@${user.value?.username}`,
    avatar: {
      src: `https://avatar.iran.liara.run/username?username=${user.value?.username}`
    }
  },
  { type: 'separator' as const },
  {
    slot: 'online' as const,
    active: app.$gateway.state.value.presence.status === 'online',
    onSelect: () => {
      if (app.$gateway.state.value.presence.status === 'online') return;

      app.$gateway.updatePresence({
        status: 'online'
      });

      app.$gateway.state.value.presence.status = 'online';
    }
  },
  {
    slot: 'away' as const,
    active: app.$gateway.state.value.presence.status === 'away',
    onSelect: () => {
      if (app.$gateway.state.value.presence.status === 'away') return;

      app.$gateway.updatePresence({
        status: 'away'
      });

      app.$gateway.state.value.presence.status = 'away';
    }
  },
  {
    slot: 'dnd' as const,
    active: app.$gateway.state.value.presence.status === 'dnd',
    onSelect: () => {
      if (app.$gateway.state.value.presence.status === 'dnd') return;

      app.$gateway.updatePresence({
        status: 'dnd'
      });

      app.$gateway.state.value.presence.status = 'dnd';
    }
  },
  {
    slot: 'invisible' as const,
    active: app.$gateway.state.value.presence.status === 'offline',
    onSelect: () => {
      if (app.$gateway.state.value.presence.status === 'offline') return;

      app.$gateway.updatePresence({
        status: 'offline'
      });

      app.$gateway.state.value.presence.status = 'offline';
    }
  },
  { type: 'separator' as const },
  {
    slot: 'presence' as const,
    icon: 'material-symbols:chat',
    onClick: () => setStatus.value = true
  },
  { type: 'separator' as const },
  {
    label: 'Settings',
    icon: 'material-symbols:settings'
  },
  {
    label: 'Log Out',
    icon: 'material-symbols:logout',
    color: 'error'
  }
]));
</script>