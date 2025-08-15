<template>
  <div class="flex items-center justify-center h-screen">
    <UCard class="max-w-[360px]" variant="subtle">
      <template #header>
        <div class="flex flex-col items-center">
          <img class="w-32 h-auto" src="/icon2.png" />

          <h1 class="text-xl mb-1">Welcome back!</h1>
          <p class="text-sm opacity-75">Log in to your Pygmy account to continue.</p>
        </div>
      </template>

      <UForm :schema="schema" :state="state" class="space-y-4" @submit="handleLogIn">
        <UFormField label="Email" name="email">
          <UInput class="w-full" v-model="state.email" icon="material-symbols:mail-outline" placeholder="hello@pygmy.chat" />
        </UFormField>

        <UFormField label="Password" name="password">
          <UInput class="w-full" v-model="state.password" type="password" icon="material-symbols:password" placeholder="••••••••••••" />
        </UFormField>

        <UButton class="my-2" icon="material-symbols:login" type="submit" :loading="loading" :disabled="disabled" block>Log In</UButton>

        <div class="flex flex-wrap">
          <UButton class="pt-4 pb-1 px-0" to="/register" color="neutral" variant="link" icon="material-symbols:person-add" block>Register a new account</UButton>
          <UButton class="pt-1 pb-0 px-0 cursor-pointer" @click="forgotPassword = !forgotPassword" color="neutral" variant="link" icon="material-symbols:help-outline" block>Having trouble logging in?</UButton>
        </div>
      </UForm>
    </UCard>

    <UModal v-model:open="forgotPassword">
      <template #content>
        <UCard>
          <p>💀</p>
        </UCard>
      </template>
    </UModal>

    <div class="fixed bottom-4 text-muted/50 text-sm pointer-events-none select-none">
      &copy; {{ new Date().getFullYear() }} Pygmy &amp; contributors
    </div>
  </div>
</template>

<script setup lang="ts">
import * as z from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';

useHead({
  title: 'Log In'
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
  email: '',
  password: ''
});

const loading = ref(false);
const disabled = computed(() => !schema.safeParse(state).success);
const forgotPassword = ref(false);

// Handle log in
const handleLogIn = async (event: FormSubmitEvent<Schema>) => {
  loading.value = true;

  if (!state.email || !state.password) return;

  try {
    await auth.logIn(state.email, state.password);

    await navigateTo('/');
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