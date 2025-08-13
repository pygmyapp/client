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
            sideOffset: 36
          }">
            <ULink class="mr-2 cursor-pointer" to="/" as="button" :active="false">
              <UIcon name="material-symbols:mail-outline" class="size-6" />
            </ULink>
          </UTooltip>

          <UTooltip text="Join or create a server" :content="{
            align: 'end',
            side: 'bottom',
            sideOffset: -2
          }">
            <ULink class="cursor-pointer" as="button">
              <UIcon name="material-symbols:add" class="size-6" />
            </ULink>
          </UTooltip>
        </div>

        <ULink class="mx-2 text-sm" to="/debug" as="button">
          Debug
        </ULink>

        <div class="absolute bottom-0">
          <UPopover arrow :content="{
            align: 'start',
            side: 'top'
          }">
            <UTooltip text="User">
              <UAvatar
                :src="`https://avatar.iran.liara.run/username?username=${user?.username}`"
                class="m-3 w-[48px] h-auto"
                :chip="{
                  inset: true,
                  color: 'success',
                  size: '3xl',
                  position: 'bottom-right'
                }"
              />
            </UTooltip>

            <template #content>
              <UCard>
                <h1 class="mb-1">@{{ user?.username }}</h1>
                <p class="mb-4 text-sm opacity-75">{{ user?.email }}</p>

                <UButton>Log out</UButton>
              </UCard>
            </template>
          </UPopover>
        </div>
      </aside>

      <!-- Main/Content -->
      <main class="flex-grow overflow-y-auto" id="content">
        <slot />
      </main>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
const app = useNuxtApp();
const { user, token } = useAuth();

// Connect to Gateway
if (app.$gateway && app.$gateway.state.value.status === 'disconnected')
  app.$gateway.connect(token.value!);
</script>