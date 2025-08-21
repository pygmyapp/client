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

export interface RawUser {
  id: string;
  username: string;
}

export interface GatewayUser extends RawUser {
  presence: Presence;
}

export interface User extends RawUser {
  partial: boolean;
  presence: Presence;
}

export interface Presence {
  status: 'online' | 'away' | 'dnd' | 'offline';
  text: string | null;
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

              if (user !== undefined && user.partial === false) return user;

              // Request
              const response = await $fetch<RawUser | { error: string; }>(`/api/users/${id}`, {
                headers: { 'Authorization': `Bearer ${token.value}` }
              });

              if ('error' in response) return undefined;

              // Create user
              const data: User = {
                ...response,
                partial: false,
                presence: {
                  status: 'offline',
                  text: null
                }
              }

              // Remove old partial user
              if (user !== undefined) {
                const index = users.value.indexOf(user);

                if (index !== -1) users.value.splice(index, 1);
              }

              // Add user to cache
              users.value.push(data);

              return data;
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
