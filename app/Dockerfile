#------------------------------------------------------------
# build environment
#------------------------------------------------------------
FROM node:18.0.0-alpine as build

WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY . /app
RUN yarn



#------------------------------------------------------------
# production compile test
#------------------------------------------------------------
FROM node:18.0.0-alpine as compile-test
WORKDIR /app
COPY --from=build /app /app

EXPOSE 80

ARG DRONE_COMMIT_SHA
ENV NEXT_PUBLIC_GIT_COMMIT_SHA=$DRONE_COMMIT_SHA
ENV URL_PREFIX=/
ENV NODE_ENV=production
ENV PORT=80
ENV NEXT_PUBLIC_SENTRY_DSN=
ENV NEXT_PUBLIC_LOGLEVEL=info
ENV NEXT_PUBLIC_API_URL=
ENV NEXT_PUBLIC_GOOGLE_RECAPTCHA=someDummyValueHere
ENV NEXT_PUBLIC_BASEURI=https://build-test.local
RUN yarn build

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
    echo "COMMIT_SHA: $DRONE_COMMIT_SHA"    >> ./build_info.yaml && \
    echo "TAG: $DRONE_TAG"                  >> ./build_info.yaml && \
    echo "COMMIT_REF: $DRONE_COMMIT_REF"    >> ./build_info.yaml && \
    echo "CI_BUILD_NUMBER: $DRONE_BUILD_NUMBER" >> ./build_info.yaml && \
    echo "APP_BUILD_VERSION: \"$APP_BUILD_VERSION\""    >> ./build_info.yaml

#------------------------------------------------------------
# production
#------------------------------------------------------------
FROM node:18.0.0-alpine
WORKDIR /app
COPY --from=build /app /app
COPY --from=compile-test /app/build_info.yaml /app/build_info.yaml

EXPOSE 80

ARG DRONE_COMMIT_SHA
ENV NEXT_PUBLIC_GIT_COMMIT_SHA=$DRONE_COMMIT_SHA
ENV NODE_ENV=production
ENV PORT=80
CMD ["yarn", "start:production"]
