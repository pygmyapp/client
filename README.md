# 🐰🌐 pygmyapp/client

Nuxt based client for pygmy

## Dependencies
**Pygmy is built with Bun!** It doesn't run on node.js alone, [see here to install](https://bun.com/docs/installation) Bun or [here to learn more](https://bun.sh).

`pygmyapp/client` depends on `pygmyapp/rest` and `pygmyapp/gateway`.


## Install
### Manual
- Clone this repository
- Install dependencies with `bun install`
- Ensure you have the rest API, and gateway running
- Copy `.env.example` to `.env` and configure environment variables


## Running
To run in dev mode (nuxt devtools):
```bash
bun run dev
# or if you use docker...
docker compose up
```


## License
Copyright (c) 2025 Pygmy & contributors
All code & assets are licensed under GNU GPL v3 unless stated otherwise.
See `LICENSE` or [see here](https://www.gnu.org/licenses/gpl-3.0.txt).