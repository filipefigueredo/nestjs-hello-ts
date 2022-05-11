# syntax = docker/dockerfile:1.4

# This Dockerfile allows to build a Docker image of the NestJS application
# and based on a NodeJS image. The multi-stage mechanism allows to build
# the application in a "build-environment" stage and then create a lightweight
# production image containing the required dependencies and the JS build files.
# 
# Dockerfile best practices:
# https://docs.docker.com/develop/develop-images/dockerfile_best-practices/
# Dockerized NodeJS best practices:
# https://github.com/nodejs/docker-node/blob/master/docs/BestPractices.md
# https://www.bretfisher.com/node-docker-good-defaults/
# http://goldbergyoni.com/checklist-best-practice-of-node-js-in-production/


###################################################################################################
# Build environment image (used for building the application                                      #
###################################################################################################

FROM node:16.15.0 AS build-environment

# Setting the working directory that will be used in any subsequent command.
WORKDIR /opt/node_app

# Copy the entire codebase
COPY --link . .

# Run npm command to install npm v8 latest stable version.
RUN npm install -g npm@8

# Run npm command to install application dependencies build and remove non-production packages.
RUN <<EOT
  npm ci
  npm run build
  npm prune --production
EOT

###################################################################################################
# Base image (used for deployment)                                                                #
###################################################################################################
FROM node:16.15.0-alpine AS base

# Setting the working directory that will be used in any subsequent command.
WORKDIR /opt/node_app

# Copy resources, configurations, code and dependencies from building environment
COPY --from=build-environment --link /opt/node_app/config/custom-environment-variables.yaml ./config/
COPY --from=build-environment --link /opt/node_app/config/default.yaml ./config/
COPY --from=build-environment --link /opt/node_app/package*.json ./
COPY --from=build-environment --link /opt/node_app/node_modules/ ./node_modules/
COPY --from=build-environment --link /opt/node_app/dist/ ./dist/

# Informs Docker that the container listens on the specified network ports at runtime.
#
# Note: The EXPOSE instruction does not actually publish the port. It functions as a documentation
# between the person who builds the image and the person who runs the container, about which ports
# are intended to be published.
EXPOSE 8080

# The official node image provides an unprivileged user as a security best practice
# but we have to manually enable it. We put it here so npm installs dependencies as the same
# user who runs the app.
# https://github.com/nodejs/docker-node/blob/master/docs/BestPractices.md#non-root-user
USER node

# Start the application using ENTRYPOINT to enable the container to accept appended arguments.
ENTRYPOINT ["node", "dist/main.js"]