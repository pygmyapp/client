# 🐰⌨️ pygmyapp/client

Pygmy web client, built with [Nuxt 4](https://nuxt.com/)

## Dependencies
**Pygmy is built with Bun!** It doesn't run on node.js alone, [see here to install](https://bun.com/docs/installation) Bun or [here to learn more](https://bun.sh).

`pygmyapp/client` depends on:
- an active REST API (`pygmyapp/rest`)
- an active Gateway (`pygmyapp/gateway`)
- an active CDN (`pygmyapp/cdn`)

## Install

### Docker

If you are using Docker, you can clone this repository and run:

```sh
docker compose build # build image

docker compose up # start image
```

### Manual

- Clone this repository
- Install dependencies with `bun install`
- Ensure you have the rest API, and gateway running
- Copy `.env.example` to `.env` and configure environment variables

To run the client in dev mode (enables Nuxt devtools):

```sh
bun run dev
```

## License
Copyright (c) 2025 Pygmy & contributors

All code & assets are licensed under GNU GPL v3 unless stated otherwise.  
See `LICENSE` or [see here](https://www.gnu.org/licenses/gpl-3.0.txt).