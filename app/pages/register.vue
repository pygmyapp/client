<template>
  <div class="flex items-center justify-center h-screen">
    <UCard class="max-w-[390px]" variant="subtle">
      <template #header>
        <div class="flex flex-col items-center">
          <img class="w-32 h-auto" src="/icon2.png" />

          <h1 class="text-xl mb-1">Welcome to Pygmy!</h1>
          <p class="text-sm text-center opacity-75">Enter your details below to register your account.</p>
        </div>
      </template>

      <UForm :schema="schema" :state="state" class="space-y-4" @submit="handleRegister">
        <UFormField
          label="Username"
          name="username"
          help="Unique, case insensitive (lowercase), may only contain letters, numbers, underscores and periods"
        >
          <UInput class="w-full" v-model="state.username" icon="material-symbols:alternate-email" placeholder="username" />

          <p
            v-if="state.username !== undefined && state.username !== ''"
            :class="usernameAvailableLoading ? 'text-muted' : (usernameAvailable ? 'text-success' : 'text-error') + ' mt-1'"
          >
            {{ usernameAvailableLoading ? 'Checking availability...' : (usernameAvailable ? 'Username available!' : `That username isn't available`) }}
          </p>
        </UFormField>

        <USeparator />

        <UFormField label="Email" name="email">
          <UInput class="w-full" v-model="state.email" icon="material-symbols:mail-outline" placeholder="hello@pygmy.chat" />
        </UFormField>

        <UFormField label="Password" name="password">
          <UInput class="w-full" v-model="state.password" type="password" icon="material-symbols:password" placeholder="••••••••••••" />
        </UFormField>

        <UFormField label="Confirm Password" name="confirmPassword">
          <UInput class="w-full" v-model="state.confirmPassword" type="password" icon="material-symbols:password" placeholder="••••••••••••" />
        </UFormField>

        <USeparator />

        <UFormField label="Invite Code" name="inviteCode" help="Your unique invite code">
          <UInput class="w-full" type="password" icon="material-symbols:key" placeholder="••••••••••••" />
        </UFormField>

        <UButton class="my-2" icon="material-symbols:person-add" type="submit" :loading="loading" :disabled="disabled" block>Register</UButton>

        <div class="flex flex-wrap">
          <UButton class="pt-4 pb-1 px-0" to="/login" color="neutral" variant="link" icon="material-symbols:login" block>Already have an account?</UButton>
        </div>
      </UForm>
    </UCard>

    <div class="fixed bottom-4 text-muted/50 text-sm pointer-events-none select-none">
      &copy; {{ new Date().getFullYear() }} Pygmy &amp; contributors
    </div>
  </div>
</template>

<script setup lang="ts">
import { refDebounced } from '@vueuse/core';

import * as z from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';

useHead({
  title: 'Register'
});

definePageMeta({
  layout: 'no-gateway',
  middleware: ['guest']
});

const auth = useAuth();
const toast = useToast();

// Schema
const schema = z
  .object({
    username: z.string()
      .min(2, { error: (iss) => (iss.input === undefined || iss.input === '')  ? 'Required' : 'Too short' })
      .max(36, 'Too long')
      .regex(/^[a-zA-Z0-9_.]*$/, 'Usernames can only contain letters, numbers, underscores and periods'),
    email: z.email({ error: (iss) => iss.input === undefined ? 'Required' : 'Invalid email' }),
    password: z.string()
      .min(8, { error: (iss) => (iss.input === undefined || iss.input === '')  ? 'Required' : 'Too short' })
      .max(72, 'Too long'),
    confirmPassword: z.string().min(1, 'Required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  });

type Schema = z.output<typeof schema>;

// State
const state = reactive<Partial<Schema>>({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
});

const loading = ref(false);
const disabled = computed(() => !schema.safeParse(state).success);

const usernameDebounced = refDebounced<string | undefined>(toRef(state.username), 500);
const usernameAvailable = ref<boolean>(false);
const usernameAvailableLoading = ref<boolean>(false);

// Watch username & check availability
watch(usernameDebounced, async (newUsername, _oldUsername) => {
  usernameAvailableLoading.value = true;

  setTimeout(() => usernameAvailableLoading.value = false, 1000);

  /*await $fetch<{ available: boolean }>(`/api/users/availability`, {
    method: 'GET',
    ignoreResponseError: true
  });*/
});

// Handle log in
const handleRegister = async (event: FormSubmitEvent<Schema>) => {
  loading.value = true;

  if (!state.username || !state.email || !state.password) return;

  try {
    // TODO: register functionality
  } catch (err) {
    console.error(err);
    loading.value = false;
    toast.add({
      title: `${err}`,
      color: 'error'
    });
  }
}
</script>