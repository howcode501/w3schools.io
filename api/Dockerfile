# build
FROM node:14.19.3-bullseye as build

# Install python/pip
ENV PYTHONUNBUFFERED=1
RUN --mount=type=cache,target=/var/cache/apt --mount=type=cache,target=/var/lib/apt \
    apt-get update && \
    apt-get install python3 python3-pip build-essential postgresql-client -y
RUN ln -s /usr/bin/python3 /usr/bin/python
RUN pip3 install --no-cache --upgrade pip setuptools

WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY . /app
RUN yarn
RUN yarn add prisma-dbml-generator
RUN npx prisma generate
#RUN npm run-script updatedb license_key=$MAXMIND_LICENSE_KEY

# Setup BUILD Variables:
ARG DRONE_REPO_NAME
ARG DRONE_SOURCE_BRANCH
ARG DRONE_COMMIT_SHA
ARG DRONE_TAG
ARG DRONE_COMMIT_REF
ARG DRONE_BUILD_NUMBER
ARG APP_BUILD_VERSION

RUN echo "REPO_NAME: $DRONE_REPO_NAME"      >  ./build_info.yaml && \
    echo "BRANCH: $DRONE_SOURCE_BRANCH"     >> ./build_info.yaml && \
    echo "GIT_COMMIT_SHA: $DRONE_COMMIT_SHA"    >> ./build_info.yaml && \
    echo "TAG: $DRONE_TAG"                  >> ./build_info.yaml && \
    echo "COMMIT_REF: $DRONE_COMMIT_REF"    >> ./build_info.yaml && \
    echo "CI_BUILD_NUMBER: $DRONE_BUILD_NUMBER" >> ./build_info.yaml && \
    echo "APP_BUILD_VERSION: \"$APP_BUILD_VERSION\""    >> ./build_info.yaml

# production
FROM node:14.19.3-bullseye-slim

# Postgres client
RUN --mount=type=cache,target=/var/cache/apt --mount=type=cache,target=/var/lib/apt \
    apt-get update && \
    apt-get install postgresql-client -y

WORKDIR /app
COPY --from=build /app /app

EXPOSE 5000

ENV NODE_ENV=production
CMD ["yarn", "start:production"]
