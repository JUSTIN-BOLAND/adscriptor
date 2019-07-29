FROM nginx:alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf.template
COPY html/ /usr/share/nginx/html/
CMD envsubst < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf; exec nginx -g 'daemon off;'
