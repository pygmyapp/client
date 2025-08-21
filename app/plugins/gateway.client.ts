import { type Presence, type GatewayUser } from './cache.client';

interface State {
  id: string | undefined;
  token: string | undefined;
  status: Status;
  presence: Presence;
  heartbeat: Heartbeat;
  seq: number | undefined;
  shouldResume: boolean;
  hasFailed: boolean;
  events: string[];
}

interface Heartbeat {
  interval: NodeJS.Timeout | undefined;
  timeout: NodeJS.Timeout | undefined;
  lastSent: number | undefined;
  lastReceived: number | undefined;
  ping: number | undefined;
}

interface Message {
  op: number;
  ev?: string;
  dt?: any;
  seq?: number;
}

type Status = 'disconnected' | 'unauthenticated' | 'authenticated';

enum OPCodes {
  EVENT = 0,
  HELLO = 1,
  IDENTIFY = 2,
  READY = 3,
  HEARTBEAT = 4,
  HEARTBEAT_ACK = 5,
  RESUME = 6,
  RESUMED = 7,
  ERROR = 8
}

enum CloseCodes {
  NORMAL_CLOSURE = 1000,
  GOING_AWAY = 1001,

  UNKNOWN = 4000,
  INVALID_ENCODING = 4001,
  INVALID_PAYLOAD = 4002,
  DECODE_ERROR = 4003,
  RATE_LIMITED = 4004,
  NOT_AUTHENTICATED = 4005,
  INVALID_AUTHENTICATION = 4006,
  ALREADY_AUTHENTICATED = 4007,
  SESSION_TIMED_OUT = 4008,
  IDENTIFY_TIMED_OUT = 4009,
  RESUME_TIMED_OUT = 4010
}

export default defineNuxtPlugin({
  name: 'gateway',
  dependsOn: ['cache'],
  async setup(nuxtApp) {
    let ws: any;

    const { $cache } = useNuxtApp();
    const runtimeConfig = useRuntimeConfig();

    const state = useState('gateway.state', () =>
      new Object({
        id: undefined,
        token: undefined,
        status: 'disconnected',
        presence: {
          status: 'offline',
          text: null
        },
        heartbeat: {
          interval: undefined,
          timeout: undefined,
          lastSent: undefined,
          lastReceived: undefined,
          ping: undefined
        },
        seq: undefined,
        shouldResume: false,
        hasFailed: false,
        events: []
      }) as State
    );

    return {
      provide: {
        gateway: {
          CloseCodes,

          ws,
          state,

          get ready() {
            return state.value.status === 'authenticated';
          },

          /**
           * Connect to the Gateway
           * @param token Token to authenticate with
           */
          async connect(token: string): Promise<void> {
            state.value.token = token;

            //const url = await $fetch(`${runtimeConfig.public.apiUrl}/gateway`);

            // Create WebSocket
            ws = useState('gateway.ws', () => new WebSocket(`ws://192.168.1.115:3002/?encoding=${runtimeConfig.public.gateway.encoding}`));

            // Handlers
            ws.value.addEventListener('open', () => this.handleOpen());
            ws.value.addEventListener('close', (event: CloseEvent) => this.handleClose(event));

            // Error
            ws.value.addEventListener('error', (err: Error) => {
              this.debug(`Error: ${err} [client]`);
              
              this.state.value.hasFailed = true;
              
            });
            
            // Message
            ws.value.addEventListener('message', async (message: MessageEvent) => {
              const route = useRoute();
              const data = JSON.parse(message.data as string);

              this.debug(`Raw message: ${message.data} [route: ${route.path}]`);

              await this.handleMessage(data);
            });
          },

          /**
           * Send a message to the Gateway
           * @param message Unencoded message to send 
           */
          send(message: Message): void {
            ws.value.send(
              JSON.stringify(message)
            );
          },

          /**
           * Disconnect from the Gateway
           * @param code Close code
           */
          disconnect(code: number): void {
            ws.value.close(code);
          },

          /**
           * Send a heartbeat to the Gateway
           * @param interval Heartbeat interval
           */
          sendHeartbeat(interval: number): void {
            this.send({
              op: 4
            });

            this.debug(`Sent heartbeat`);

            state.value.heartbeat.lastSent = Date.now();
            state.value.heartbeat.timeout = setTimeout(() => this.heartbeatNotAck(), interval + (15 * 1000));
          },

          /**
           * Handle a heartbeat not being acknowledged by the Gateway
           */
          heartbeatNotAck(): void {
            // TODO: this
            this.debug('Heartbeat not acknowledged in time, closing connection');

            clearInterval(state.value.heartbeat.interval);
        
            this.disconnect(CloseCodes.SESSION_TIMED_OUT);
          },

          /**
           * Handle WebSocket open event
           */
          handleOpen(): void {
            state.value.status = 'unauthenticated';

            this.debug('Connected');
          },

          /**
           * Handle WebSocket close event
           * @param param0 Close event object
           */
          handleClose({ code }: CloseEvent): void {
            this.debug(`Closed: ${code}`);

            // TODO: reset state/other data

            // TODO: determine if we should resume or not
            // and attempt to if we can
          },

          /**
           * Handle WebSocket error event
           * @param error Error object
           */
          handleError(error: Error): void {
            this.debug(`Error: ${error} [ws]`);
          },

          async handleMessage({ op, ev, dt, seq }: Message): Promise<void> {
            // OP 0 EVENT
            if (op === OPCodes.EVENT) {
              if (seq !== undefined) state.value.seq = seq;

              await this.handleEvent({ op, ev, dt, seq });
            }
            
            // OP 1 HELLO
            if (op === OPCodes.HELLO) {
              const data = dt as {
                interval: number;
                jitter: number;
              };

              // Start heartbeating
              setTimeout(() => {
                this.sendHeartbeat(data.interval);

                state.value.heartbeat.interval = setInterval(() => 
                  this.sendHeartbeat(data.interval), data.interval
                );
              }, data.interval * data.jitter);

              if (state.value.shouldResume) {
                // Resume
                this.debug('Attempting to resume connection');

                // TODO: attempt to resume...
              } else {
                // Identify
                this.debug('Attempting authentication');

                this.send({
                  op: OPCodes.IDENTIFY, // OP 2 IDENTIFY
                  dt: {
                    token: state.value.token as string
                  }
                });
              }
            }

            // OP 3 READY
            if (op === OPCodes.READY) {
              this.debug('Client connected successfully');

              const data = dt as {
                id: string;
                users: GatewayUser[];
              };

              // Push initial data
              $cache.users.data.value.push(
                ...data.users.map((user) => ({
                  partial: false,
                  ...user
                }))
              );

              // Prefetch cache
              await $cache.prefetch();

              state.value.id = data.id;
              state.value.status = 'authenticated';
              state.value.presence.status = 'online';
            }

            // OP 5 HEARTBEAT_ACK
            if (op === OPCodes.HEARTBEAT_ACK) {
              clearTimeout(state.value.heartbeat.timeout);
              state.value.heartbeat.timeout = undefined;
              state.value.heartbeat.lastReceived = Date.now();

              state.value.heartbeat.ping = state.value.heartbeat.lastReceived - (state.value.heartbeat.lastSent as number);

              this.debug(`Heartbeat acknowledged (took: ${state.value.heartbeat.ping.toLocaleString()} ms)`);
            }

            // OP 8 ERROR
            if (op === OPCodes.ERROR) {
              const data = dt as {
                code: number;
              };

              this.debug(`Error: ${data.code} [server]`);
            }
          },

          /**
           * Handle "OP 0 EVENT" messages
           * @param data Decoded message data
           */
          async handleEvent({ op, ev, dt, seq }: Message): Promise<void> {
            if (op !== 0 || !ev || typeof seq !== 'number') return;

            if (state.value.seq === undefined || seq > state.value.seq) state.value.seq = seq;

            // Presence update - status update
            if (ev === 'PRESENCE_UPDATE') {
              // TODO: presence event
              const data = dt as { userId: string; oldPresence: Presence; newPresence: Presence; }

              console.log('presence update:', data)

              // Get user and update presence
              const user = $cache.users.get(data.userId);

              if (!user) return;

              if (data.newPresence === null) user.presence = { status: 'offline', text: null };
              else user.presence = data.newPresence;
            }

            // Typing started 
            if (ev === 'TYPING') {
              // TODO: typing event
            }

            // Friend created - a friend request was accepted
            if (ev === 'FRIEND_CREATE') {
              const data = dt as { userId: string; }

              // Add friend to cache
              $cache.user.value.friends.push(data.userId);
            }

            // Friend deleted - this user removed a friend, another user removed/unfriended this user
            if (ev === 'FRIEND_DELETE') {
              const data = dt as { userId: string; }

              // Remove friend from cache
              const index = $cache.user.value.friends.findIndex((id) => id === data.userId);
              if (index !== -1) $cache.user.value.friends.splice(index, 1);
            }

            // Request created - sent/received a friend request
            if (ev === 'REQUEST_CREATE') {
              const data = dt as { from: string; to: string; direction: 'INCOMING' | 'OUTGOING'; }

              // Add request to cache
              $cache.user.value.requests.push({
                from: data.from,
                to: data.to,
                direction: data.direction
              });

              // Fetch user to make sure they are in the cache
              await $cache.users.fetch(data.direction === 'INCOMING' ? data.from : data.to);
            }

            // Request deleted - friend request was accepted/ignored/cancelled
            if (ev === 'REQUEST_DELETE') {
              const data = dt as { from: string; to: string; direction: 'INCOMING' | 'OUTGOING'; }

              // Remove request from cache
              const index = $cache.user.value.requests.findIndex((request) =>
                request.direction === data.direction
                && (request.from === data.from || request.to === data.to)
              );

              if (index !== -1) $cache.user.value.requests.splice(index, 1);
            }
          },

          /**
           * Update user presence
           * @param presence Partial presence object
           */
          updatePresence(presence: Partial<Presence>): void {
            console.log(presence.text === undefined ? state.value.presence.text : presence.text)

            this.send({
              op: OPCodes.EVENT, // OP 0 EVENT
              ev: 'PRESENCE_UPDATE',
              dt: {
                status: presence.status === undefined ? state.value.presence.status : presence.status,
                text: presence.text === undefined ? state.value.presence.text : presence.text
              }
            });
          },

          /**
           * Log a debug event, depending on debug level
           * @param event Event/message
           */
          debug(event: string): void {
            if (runtimeConfig.public.gateway.debug >= 1) state.value.events.push(event);
            if (runtimeConfig.public.gateway.debug >= 2) console.debug(`[GATEWAY DEBUG] ${event}`);
          }
        }
      }
    }
  }
});