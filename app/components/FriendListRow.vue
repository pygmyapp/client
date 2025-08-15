<template>
  <div :class="`flex py-2 px-2 rounded-lg hover:bg-muted ${friendDropdown ? 'bg-muted' : ''}`">
    <template v-if="props.type === 'friend'">
      <UAvatar
        :src="`https://avatar.iran.liara.run/username?username=${user?.username}`"
        class="w-[48px] h-auto"
      />

      <div class="ml-2">
        <p class="text-lg">@{{ user?.username }}</p>
        <p class="mt-[-4px] text-muted text-sm" v-if="(props.showStatus || true) === true">
          Offline
        </p>
      </div>

    <UButtonGroup class="h-8 ml-auto mt-2">
      <UButton color="neutral" variant="subtle" icon="material-symbols:mail-outline">Message</UButton>

      <UDropdownMenu v-model:open="friendDropdown" :items="friendDropdownItems">
        <UButton color="neutral" variant="subtle" icon="material-symbols:arrow-drop-down" />
      </UDropdownMenu>
    </UButtonGroup>
    </template>

    <template v-if="props.type === 'request' && props.request">
      <UAvatar
        :src="`https://avatar.iran.liara.run/username?username=${user?.username}`"
        class="w-[48px] h-auto"
      />

      <div class="ml-2">
        <p class="text-lg">@{{ user?.username }}</p>
        <p class="mt-[-4px] text-muted text-sm">
          {{ props.request.direction === 'INCOMING' ? 'Incoming' : 'Pending' }}
        </p>
      </div>

      <div v-if="props.request && props.request.direction === 'INCOMING'" class="ml-auto mt-2">
        <UButton class="h-8 mr-2" color="success" variant="subtle" icon="material-symbols:check">Accept</UButton>
        <UButton class="h-8" color="neutral" variant="subtle" icon="material-symbols:close">Ignore</UButton>
      </div>

      <div v-if="props.request && props.request.direction === 'OUTGOING'" class="ml-auto mt-2">
        <UButton @click="handleCancelRequest()" class="h-8 ml-auto" color="neutral" variant="subtle" icon="material-symbols:close" :loading="loading">Cancel</UButton>
      </div>
    </template>

    <template v-if="props.type === 'blocked'">
      blocked
    </template>
  </div>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui';
import type { FriendRequest } from '~/plugins/cache.client';

const { token } = useAuth();
const { $cache } = useNuxtApp();
const toast = useToast();

const props = defineProps<{
  type: 'friend' | 'request' | 'blocked';
  id?: string;
  request?: FriendRequest;
  showStatus?: boolean;
}>();

const user = computed(() => {
  if ((props.type === 'friend' || props.type === 'blocked') && props.id)
    return $cache.users.get(props.id);

  if (props.type === 'request' && props.request)
    return $cache.users.get(
      props.request.direction === 'INCOMING' ? props.request.from : props.request.to
    );

  return undefined;
});

const loading = ref(false);

const friendDropdown = ref(false)
const friendDropdownItems: DropdownMenuItem[] = [
  {
    label: 'Remove Friend',
    icon: 'material-symbols:group-remove',
    color: 'error',
    onSelect: () => handleRemoveFriend()
  }
];

// Remove friend
const handleRemoveFriend = async () => {
  
}

// Cancel friend request
const handleCancelRequest = async () => {
  loading.value = true;

  try {
    const response = await $fetch<undefined | { error: string; } | { errors: string[] }>(`/api/users/@me/requests/${user.value?.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token.value}`
      },
      ignoreResponseError: true
    });

    if (response !== undefined && 'errors' in response) throw response.errors.join(', ');
    if (response !== undefined && 'error' in response) throw response.error;

    /*toast.add({
      title: `Pending friend request cancelled`,
      color: 'neutral'
    });*/
  } catch (err) {
    loading.value = false;

    toast.add({
      title: `Failed to cancel friend request`,
      description: `${err}`,
      color: 'error'
    });
  }
}
</script>