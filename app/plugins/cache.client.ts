// Interfaces
interface CacheState {
  friends: boolean;
  blocked: boolean;
}

interface UserDataCache {
  friends: string[];
  requests: FriendRequest[];
  blocked: string[];
}

interface User {
  id: string;
  username: string;
}

export interface FriendRequest {
  from: string;
  to: string;
  direction: 'INCOMING' | 'OUTGOING';
}

interface Channel {
  id: string;
  name: string;
  type: 'TEXT' | 'DM' | 'GROUP';
}

export default defineNuxtPlugin({
  name: 'cache',
  async setup(nuxtApp) {
    const state = useState('cache.state', () => new Object({
      friends: false,
      blocked: false
    }) as CacheState);

    const user = useState('cache.user', () => new Object({
      friends: [],
      requests: [],
      blocked: []
    }) as UserDataCache);

    const users = useState('cache.users', () => new Array() as User[]);

    const channels = useState('cache.channels', () => new Array() as Channel[]);

    return {
      provide: {
        cache: {
          state,
          user,

          /**
           * Fetch cache data
           * @returns Boolean indicating success
           */
          async prefetch(): Promise<boolean> {
            const { token } = useAuth();

            if (!token.value) throw 'Token not found';

            // Friends
            const friends = await $fetch<string[]>(`/api/users/@me/friends`, {
              headers: { 'Authorization': `Bearer ${token.value}` }
            });

            user.value.friends = friends;
            
            // Requests
            const requests = await $fetch<FriendRequest[]>(`/api/users/@me/requests`, {
              headers: { 'Authorization': `Bearer ${token.value}` }
            });

            user.value.requests = requests;

            // Blocked
            const blocked = await $fetch<string[]>(`/api/users/@me/blocked`, {
              headers: { 'Authorization': `Bearer ${token.value}` }
            });

            user.value.blocked = blocked;

            // Set state
            state.value = {
              friends: true,
              blocked: true
            };

            return true;
          },

          users: {
            data: users,

            get(id: string): User | undefined {
              return users.value.find((user) => user.id === id);
            },

            /**
             * Fetch a user from cache, requests from API if not found
             * @param id User ID to fetch
             */
            async fetch(id: string): Promise<User | undefined> {
              const { token } = useAuth();

              if (!token.value) throw 'Token not found';

              // Cache
              const user = users.value.find((user) => user.id === id);

              if (user !== undefined) return user;

              // Request
              const response = await $fetch<User | { error: string; }>(`/api/users/${id}`, {
                headers: { 'Authorization': `Bearer ${token.value}` }
              });

              if ('error' in response) return undefined;

              // Add user to cache
              users.value.push(response);

              return response;
            }
          },

          channels: {
            data: channels
          }
        }
      }
    }
  }
});
