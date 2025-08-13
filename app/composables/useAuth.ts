export interface User {
  id: string;
  email: string;
  username: string;
};

type LogInResponse = {
  sessionId: string;
  token: string;
} | ErrorResponse;

type FetchUserResponse = User | ErrorResponse;

type ErrorResponse = { error: string; } | { errors: string[] };

// Cookies
const useUserCookie = () => useCookie<User | undefined>('auth.user', {
  default: () => undefined,
  watch: true,
  sameSite: 'strict'
});

const useLoggedInCookie = () => useCookie<boolean>('auth.loggedIn', {
  default: () => false,
  watch: true,
  sameSite: 'strict'
});

const useTokenCookie = () => useCookie<string | undefined>('auth.token', {
  default: () => undefined,
  watch: true,
  sameSite: 'strict'
});

const useSessionIdCookie = () => useCookie<string | undefined>('auth.sessionId', {
  default: () => undefined,
  watch: true,
  sameSite: 'strict'
});

/**
 * Log in and create a new session
 * @param email Email address
 * @param password Password
 * @returns Session token if successful
 */
const logIn = async (email: string, password: string): Promise<string> => {
  const user = useUserCookie();
  const loggedIn = useLoggedInCookie();
  const token = useTokenCookie();
  const sessionId = useSessionIdCookie();

  // Log in/create session
  const response: LogInResponse = await $fetch(`/api/sessions`, {
    method: 'POST',
    body: {
      email,
      password
    },
    ignoreResponseError: true
  });

  // Throw errors
  if ('errors' in response) throw response.errors;
  if ('error' in response) throw response.error;

  // Fetch user and set state
  token.value = response.token;
  sessionId.value = response.sessionId;

  const fetchedUser = await fetchUser(token.value);

  user.value = fetchedUser;
  loggedIn.value = true;

  return response.token;
}

/**
 * Log out and indalidate the current session
 * @returns true if logged out successfully, false if not logged in
 */
const logOut = async (): Promise<boolean> => {
  const app = useNuxtApp();

  const user = useUserCookie();
  const loggedIn = useLoggedInCookie();
  const token = useTokenCookie();
  const sessionId = useSessionIdCookie();

  if (!loggedIn.value || !token.value || !sessionId.value) return false;

  // If connected to Gateway, disconnect
  if (app.$gateway && app.$gateway.state.value.status !== 'disconnected')
    app.$gateway.disconnect(app.$gateway.CloseCodes.NORMAL_CLOSURE);

  // Log out/invalidate session
  await $fetch(`/api/sessions/${sessionId.value}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token.value}`
    }
  });

  user.value = undefined;
  token.value = undefined;
  sessionId.value = undefined;
  loggedIn.value = false;

  reloadNuxtApp();

  return true;
}

/**
 * Fetch the user data from the API
 * @param overrideToken Override the token cookie and use the provided token
 * @returns User data
 */
const fetchUser = async (overrideToken?: string): Promise<User> => {
  const token = useTokenCookie();

  if (!overrideToken && !token.value) throw 'No token found (in cookie or "overrideToken")';

  const response: FetchUserResponse = await $fetch(`/api/users/@me`, {
    headers: {
      'Authorization': `Bearer ${overrideToken ? overrideToken : token.value}`
    }
  });

  // Throw errors
  if ('errors' in response) throw response.errors;
  if ('error' in response) throw response.error;

  // Provide user data
  const user = {
    ...response
  };

  return user;
}

// Export composable
export const useAuth = () => {
  const user = useUserCookie();
  const loggedIn = useLoggedInCookie();
  const token = useTokenCookie();
  const sessionId = useSessionIdCookie();

  return {
    user,
    loggedIn,
    token,
    sessionId,
    logIn,
    logOut,
    fetchUser
  }
}