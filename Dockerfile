FROM php:7.4-cli
WORKDIR /app
COPY . /app
EXPOSE 9000
CMD ["php", "-S", "0.0.0.0:9000", "-t", "."]
