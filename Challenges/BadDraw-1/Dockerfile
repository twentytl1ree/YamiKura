FROM ubuntu:latest
RUN apt-get update && apt-get install -y nodejs npm \
    && rm -rf /var/lib/apt/lists/*

RUN useradd -ms /bin/bash app
RUN echo 'export HISTFILE=/dev/null' >> /etc/profile.d/disable_history.sh

WORKDIR /home/app/
COPY app/ .
RUN npm install --omit=dev
RUN chown -R app:app /home/app

EXPOSE 5050

CMD ["/bin/bash", "-c", "exec su - app -c 'PORT=5050 node /home/app/server.js'"]
