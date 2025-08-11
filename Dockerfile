# vue debugger appears to be broken on latest bun
# https://github.com/oven-sh/bun/issues/18737
FROM oven/bun:1.1.45

COPY package.json ./
COPY . .

RUN bun i

ENTRYPOINT [ "bun", "run", "dev", "--no-qr" ]