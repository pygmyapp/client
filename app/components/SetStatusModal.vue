<template>
  <UModal v-model:open="open" :dismissible="!loading">
    <template #content>
      <UCard>
        <h1 class="text-xl mb-2">Set status</h1>

        <UFormField class="mb-2" label="Status" name="status">
          <USelectMenu class="w-full" v-model="statusSelected" :items="statusDropdownItems" :search-input="false">
            <template #leading="{ modelValue, ui }">
              <UChip
                v-if="modelValue"
                v-bind="(modelValue as any).chip"
                inset
                standalone
                :size="(ui.itemLeadingChipSize() as ChipProps['size'])"
                :class="ui.itemLeadingChip()"
              />
            </template>
          </USelectMenu>
        </UFormField>

        <UFormField class="mb-4" label="Text (optional)" name="text">
          <UInput class="w-full" v-model="text" type="text" placeholder="What's on your mind?" :ui="{ trailing: 'pe-1' }">
            <template v-if="text.length" #trailing>
              <UButton
                color="neutral"
                variant="link"
                size="sm"
                class="cursor-pointer"
                icon="material-symbols:close"
                @click="text = ''"
              />
            </template>
          </UInput>
        </UFormField>

        <UButton @click="handleSetStatus" icon="material-symbols:check" block>Save</UButton>
      </UCard>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { SelectMenuItem, ChipProps } from '@nuxt/ui';

const open = defineModel<boolean>();
const emit = defineEmits(['close']);

const { $gateway } = useNuxtApp();

const status = ref<string>($gateway.state.value.presence.status ?? 'offline');
const text = ref<string>('');
const loading = ref(false);

const statusDropdownItems = computed<SelectMenuItem[]>(() => ([
  {
    label: 'Online',
    id: 'online',
    active: status.value === 'online',
    chip: {
      color: 'success',
      size: '3xl'
    }
  },
  {
    label: 'Away',
    id: 'away',
    active: status.value === 'away',
    chip: {
      color: 'warning',
      size: '3xl'
    }
  },
    {
    label: 'Do Not Disturb',
    id: 'dnd',
    active: status.value === 'dnd',
    chip: {
      color: 'error',
      size: '3xl'
    }
  },
  {
    label: 'Invisible',
    id: 'offline',
    active: status.value === 'offline',
    chip: {
      color: 'neutral',
      size: '3xl',
      ui: { base: 'bg-gray-600' }
    }
  }
]));

const statusSelected = ref<SelectMenuItem | undefined>(statusDropdownItems.value[0]);

// Convoluted way to get the status text from the Nuxt UI SelectMenuItem
const statusValue = computed(() => {
  if (!statusSelected.value) return 'online';

  if (
    typeof statusSelected.value === 'string'
    || typeof statusSelected.value === 'number'
    || typeof statusSelected.value === 'bigint'
    || typeof statusSelected.value === 'boolean'
  ) return 'online';

  if ('id' in statusSelected.value) return statusSelected.value.id;
  else return 'online';
});

const textValue = computed(() => text.value === '' ? null : text.value);

const handleSetStatus = async () => {
  $gateway.updatePresence({
    status: statusValue.value,
    text: textValue.value
  });

  $gateway.state.value.presence.status = statusValue.value;
  $gateway.state.value.presence.text = textValue.value;

  open.value = false;
  emit('close');
}
</script>