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

# -------------------------------------------------------
# GOLANG
# -------------------------------------------------------
RUN apt-get update && apt-get install --no-install-recommends -y ca-certificates curl mercurial git-core
RUN curl -s https://storage.googleapis.com/golang/go1.3.linux-amd64.tar.gz | tar -v -C /usr/local -xz
ENV GOPATH /go
ENV GOROOT /usr/local/go
ENV PATH $PATH:/usr/local/go/bin:/go/bin


# -------------------------------------------------------
# CALENDRIER.DE
# -------------------------------------------------------
RUN go get github.com/vjeantet/calendrier.de
RUN git clone https://github.com/vjeantet/calendrier.de.git /app
WORKDIR /app
RUN go build calendrier_de.go

EXPOSE 80
ENV PORT 80
ENTRYPOINT ["./calendrier_de"]