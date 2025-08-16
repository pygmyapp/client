<template>
  <UModal v-model:open="open" :dismissible="!loading">
    <template #content>
      <UCard>
        <h1 class="text-xl">Add Friend</h1>

        <p class="mb-3">Enter a username to send them a friend request:</p>

        <UFormField :error="error">
          <UButtonGroup class="flex w-auto">
            <UInput class="flex-grow" v-model="username" variant="subtle" icon="material-symbols:alternate-email" placeholder="username" />
            <UButton @click="handleAddFriend()"  color="neutral" variant="subtle" icon="material-symbols:person-add" :loading="loading" :disabled="disabled" label="Add" />
          </UButtonGroup>
        </UFormField>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const open = defineModel<boolean>();

const emit = defineEmits(['close']);

const { token } = useAuth();
const toast = useToast();

const username = ref<string | undefined>(undefined);
const error = ref<string | undefined>(undefined);

const loading = ref(false);
const disabled = computed(() => username.value === undefined || username.value === '');

const handleAddFriend = async () => {
  if (!username.value || username.value === '') return;

  loading.value = true;

  try {
    // Send friend request
    const response = await $fetch<undefined | string | { error: string; } | { errors: string[] }>(`/api/users/@me/requests`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.value}`,
        'Content-Type': 'application/json'
      },
      body: {
        username: username.value.toLowerCase()
      },
      ignoreResponseError: true
    });

    // Handle errors
    if (response && typeof response !== 'string') {
      if ('errors' in response) throw response.errors.join(', ');

      if ('error' in response) {
        if (response.error === 'User not found') {
          loading.value = false;
          return error.value = `Couldn't find any user with that username. Double check you entered their username correctly and try again.`;
        }

        throw response.error;
      }
    }

    open.value = false;

    emit('close');

    loading.value = false;
    username.value = undefined;
    
    toast.add({
      title: `Friend request sent successfully`,
      icon: 'material-symbols:group-add',
      color: 'success',
      type: 'foreground'
    });
  } catch (err) {
    loading.value = false;
    
    toast.add({
      title: `Failed to send friend request`,
      description: `${err}`,
      color: 'error'
    });
  }
}
</script>