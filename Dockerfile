FROM hmctspublic.azurecr.io/base/node:12-alpine as base

COPY --chown=hmcts:hmcts package.json yarn.lock ./

FROM base as build

USER root
RUN apk add python2 make g++
USER hmcts

RUN yarn && npm rebuild node-sass

COPY --chown=hmcts:hmcts . .
RUN yarn setup && rm -r node_modules/ && yarn install --production && rm -r ~/.cache/yarn

FROM base as runtime
COPY --from=build $WORKDIR ./
USER hmcts
EXPOSE 3000
