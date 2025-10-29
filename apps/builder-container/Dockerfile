FROM oven/bun:alpine as builder

COPY . .
RUN bun install
RUN bun build ./src/index.ts --compile --minify --bytecode --outfile ./builder-server

FROM alpine:latest as runner

COPY --from=builder ./builder-server /app/builder-server

CMD ["/app/builder-server"]
