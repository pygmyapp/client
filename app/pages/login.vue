<template>
  <div class="flex items-center justify-center h-screen">
    <UCard class="max-w-[520px]" variant="subtle">
      <template #header>
        <h1 class="text-xl mb-1">Hey there!</h1>
        <p class="text-sm opacity-75">Log in to your Pygmy account to continue.</p>
      </template>

      <UForm :schema="schema" :state="state" class="space-y-4" @submit="handleLogIn">
        <UFormField label="Email" name="email">
          <UInput class="w-full" v-model="state.email" icon="material-symbols:alternate-email" placeholder="hello@pygmy.chat" />
        </UFormField>

        <UFormField label="Password" name="password">
          <UInput class="w-full" v-model="state.password" type="password" icon="material-symbols:password" placeholder="••••••••••••" />
        </UFormField>

        <UButton class="mt-2" type="submit" :loading="loading" :disabled="disabled" block>Log in</UButton>
      </UForm>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import * as z from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';

useHead({
  title: 'Log in'
});

definePageMeta({
  layout: 'no-gateway',
  middleware: ['guest']
});

const auth = useAuth();
const toast = useToast();

// Schema
const schema = z.object({
  email: z.email({ error: (iss) => iss.input === undefined ? 'Required' : 'Invalid email' }),
  password: z.string().min(1, 'Required')
});

type Schema = z.output<typeof schema>;

// State
const state = reactive<Partial<Schema>>({
  email: undefined,
  password: undefined
});

const loading = ref(false);
const disabled = computed(() => !schema.safeParse(state).success);

// Handle log in
const handleLogIn = async (event: FormSubmitEvent<Schema>) => {
  loading.value = true;
  setTimeout(async () => {
  if (!state.email || !state.password) return;

  try {
    await auth.logIn(state.email, state.password);

    await navigateTo('/');
  } catch (err) {console.error(err)
    loading.value = false;
    toast.add({
      title: `${err}`,
      color: 'error'
    })
  }
  }, 1000);
}
</script>