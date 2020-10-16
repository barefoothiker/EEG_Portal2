FROM python:3.6-slim

WORKDIR ./

COPY requirements.txt .
RUN apt-get update
RUN apt-get install -y make build-essential libssl-dev zlib1g-dev libbz2-dev \
    libreadline-dev libsqlite3-dev wget curl llvm libncurses5-dev libncursesw5-dev \
    xz-utils tk-dev libffi-dev liblzma-dev python-openssl git \
    default-libmysqlclient-dev libpq-dev

RUN pip3 install --no-cache-dir -r requirements.txt

RUN mkdir -p /usr/share/man/man1 && \
    mkdir -p /usr/share/man/man7
<<<<<<< HEAD
#RUN apt-get install -y libmysqlclient-dev
=======
#RUN apt-get install -y libmysqlclient
>>>>>>> c6b8ed608970d1a72779e24fa52db7ccf2146795

COPY . .

EXPOSE 8000

ENTRYPOINT ["./docker_entrypoint.sh"]
