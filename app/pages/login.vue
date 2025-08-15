<template>
  <div class="flex items-center justify-center h-screen">
    <UCard class="max-w-[520px]" variant="subtle">
      <template #header>
        <h1 class="text-xl mb-1">{{ isRegistering() ? "Hi There!" : "Hey, Welcome Back!" }}</h1>
        <p class="text-sm opacity-75">{{ isRegistering() ? "We'll need some details to create a Pygmy account for you." : "Log in to your Pygmy account to continue." }}</p>
      </template>

      <UForm :schema="schema" :state="state" class="space-y-4 duration-10" @submit="isRegistering() ? handleRegister : handleLogIn">

        <UFormField label="Username" name="username" v-if="isRegistering()">
          <UInput class="w-full" v-model="state.username" icon="material-symbols:id-card" placeholder="hopper27" />
        </UFormField>

        <UFormField label="Email" name="email">
          <UInput class="w-full" v-model="state.email" icon="material-symbols:alternate-email" placeholder="hello@pygmy.chat" />
        </UFormField>

        <UFormField label="Password" name="password">
          <UInput class="w-full" v-model="state.password" type="password" icon="material-symbols:password" placeholder="••••••••••••" />
        </UFormField>

        <UButton class="mt-2" type="submit" :loading="loading" :disabled="disabled" block>{{ isRegistering() ? "Register" : "Log In" }}</UButton>
        <button class="text-sm opacity-75 underline cursor-pointer" @click="changeMode()">{{ isRegistering() ? "Have" : "Need" }} an account?</button>
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

enum SignInState {
  LogIn,
  Register
}

// Schema
const schema = z.object({
  username: z.string(),
  email: z.email({ error: (iss) => iss.input === undefined ? 'Required' : 'Invalid email' }),
  password: z.string().min(1, 'Required'),
  mode: z.enum(SignInState)
});

type Schema = z.output<typeof schema>;

// State
const state = reactive<Partial<Schema>>({
  username: "",
  email: "",
  password: "",
  mode: SignInState.LogIn
});

function changeMode() {
  state.mode = isRegistering() ? SignInState.LogIn : SignInState.Register;
}

function isRegistering() {
  return state.mode === SignInState.Register;
}

const loading = ref(false);
const disabled = computed(() => !schema.safeParse(state).success);

const handleRegister = async (event: FormSubmitEvent<Schema>) => {
  loading.value = true;
  setTimeout(async () => {
  const { username, email, password } = state;
  if (!username || !email || !password) return;
  
  try {
    const response: any = await $fetch(`/api/users`, {
      method: 'POST',
      body: {
        username,
        email,
        password
      }
    });

    if ('errors' in response) throw response.errors;
    if ('error' in response) throw response.error;

    await auth.logIn(email, username);

    await navigateTo('/');
  } catch (err) {
    console.error(err);
    loading.value = false;
    toast.add({
      title: `${err}`,
      color: 'error'
    });
  }
  }, 1000);
}
// Handle log in
const handleLogIn = async (event: FormSubmitEvent<Schema>) => {
  loading.value = true;
  setTimeout(async () => {
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
  }, 1000);
}
</script>