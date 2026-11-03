# tippecanoe has no official image; build it from source (pinned tag).
FROM alpine:3.20 AS build
RUN apk add --no-cache git g++ make sqlite-dev zlib-dev bash
RUN git clone --depth 1 --branch 2.79.0 https://github.com/felt/tippecanoe.git /src && make -C /src -j"$(nproc)"

FROM alpine:3.20
RUN apk add --no-cache sqlite-libs zlib libstdc++ libgcc
COPY --from=build /src/tippecanoe /usr/local/bin/
WORKDIR /work
ENTRYPOINT ["tippecanoe"]
