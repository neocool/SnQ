# This file is a template, and might need editing before it works on your project.
FROM node:18-alpine3.16

# Uncomment if use of `process.dlopen` is necessary
# apk add --no-cache libc6-compat

ENV PORT 5000
# replace this with your application default port, if necessary
EXPOSE 5000 

ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

COPY . /app
WORKDIR /app
RUN npm install
CMD ["npm","test"]
