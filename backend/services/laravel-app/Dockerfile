FROM php:8.4-fpm-alpine

RUN apk add --no-cache \
    bash \
    netcat-openbsd \
    postgresql-dev \
    icu-dev \
    nginx \
    curl \
    zip \
    git \
    nodejs \
    npm \
    linux-headers \
    libzip-dev \
    $PHPIZE_DEPS \
    && docker-php-ext-configure zip \
    && docker-php-ext-install -j$(nproc) intl pdo_pgsql pgsql zip bcmath sockets \
    && apk del $PHPIZE_DEPS \
    && rm -rf /tmp/*

# PCOV: code coverage in CI/local (enable at runtime: php -d pcov.enabled=1 or phpunit.xml ini)
RUN apk add --no-cache $PHPIZE_DEPS \
    && pecl install pcov \
    && docker-php-ext-enable pcov \
    && printf '\n; PCOV: default off in FPM; enable for coverage: php -d pcov.enabled=1\npcov.enabled=0\npcov.directory=/var/www/html\n' \
        >> /usr/local/etc/php/conf.d/docker-php-ext-pcov.ini \
    && apk del $PHPIZE_DEPS \
    && rm -rf /tmp/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

USER www-data

ENTRYPOINT ["/wait-for-it.sh", "postgres", "5432", "--"]
CMD ["php-fpm", "-F"]
