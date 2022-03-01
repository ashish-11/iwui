#########################
### build environment ###
#########################

# base image
FROM node:14
RUN apt-get upgrade -y && rm -rf /var/lib/apt/lists/*	
# the build env for front end
# ARG buildenv=test
# set working directory
RUN mkdir /usr/src/app
WORKDIR /usr/src/app

# add `/usr/src/app/node_modules/.bin` to $PATH
ENV PATH /usr/src/app/node_modules/.bin:$PATH
# RUN npm install -g yarn@berry
# install and cache app dependencies
COPY package.json /usr/src/app/package.json
RUN npm install
# RUN npm install -g @angular/cli@1.7.1 --unsafe

# add app
COPY . /usr/src/app

# run tests
# RUN ng test --watch=false

# generate build
# buildenv is defined in openshift envs
ENV NODE_ENV=production
RUN npm run build
# RUN npm run build:${buildenv}

##################
### production ###
##################

# base image
# FROM nginx:latest
FROM nginxinc/nginx-unprivileged 
# the build env for front end

ARG buildenv=http
COPY nginx-${buildenv}.conf /etc/nginx/conf.d/default.conf
ADD certs /etc/nginx/certs/
# copy artifact build from the 'build environment'
COPY --from=0 /usr/src/app/build /usr/share/nginx/html
EXPOSE 80
EXPOSE 443
EXPOSE 8090
USER 1001
# run nginx
CMD ["nginx", "-g", "daemon off;"]
