# CALENDRIER.DE

# -------------------------------------------------------
# DEBIAN
# -------------------------------------------------------
FROM debian
MAINTAINER Valere JEANTET <valere.jeantet@gmail.com>

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get -q update
RUN apt-get -qy --force-yes dist-upgrade

RUN echo "deb http://http.debian.net/debian wheezy main contrib" >> /etc/apt/sources.list
RUN echo "deb http://http.debian.net/debian wheezy-updates main contrib" >> /etc/apt/sources.list
RUN echo "deb http://security.debian.org/ wheezy/updates main contrib" >> /etc/apt/sources.list

RUN apt-get -q update


# Set working directory.
ENV HOME /root
WORKDIR /root


# -------------------------------------------------------
# nginx PHP
# -------------------------------------------------------
# Install packages supervisor apache php5 and composer
RUN apt-get -y install nginx php5-fpm supervisor

ADD ./docker.d/nginx-site.conf /etc/nginx/sites-available/default
RUN sed -i -e"s/keepalive_timeout\s*65/keepalive_timeout 2/" /etc/nginx/nginx.conf
RUN echo "daemon off;" >> /etc/nginx/nginx.conf

RUN sed -i -e "s/;daemonize\s*=\s*yes/daemonize = no/g" /etc/php5/fpm/php-fpm.conf
RUN sed -i -e "s/;cgi.fix_pathinfo=1/cgi.fix_pathinfo=0/g" /etc/php5/fpm/php.ini

ADD ./docker.d/supervisor.conf /etc/supervisor/conf.d/supervisor.conf



# -------------------------------------------------------
# CALENDRIER.DE
# -------------------------------------------------------
RUN mkdir -p /app
COPY . /app
RUN rm -rf /app/.git /app/Dockerfile

EXPOSE 80

CMD /usr/bin/supervisord -n
