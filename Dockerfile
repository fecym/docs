FROM nginx

COPY ./love /usr/share/nginx/html/

COPY  nginx.conf /etc/nginx/nginx.conf

COPY cret/chengyuming.cn_bundle.crt /etc/nginx/cret/chengyuming.cn_bundle.crt
COPY cret/chengyuming.cn.key /etc/nginx/cret/chengyuming.cn.key

RUN echo 'echo init ok!!'