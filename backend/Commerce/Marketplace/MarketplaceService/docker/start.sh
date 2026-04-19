#!/bin/bash

# Run migrations
php bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration

# Start PHP-FPM
php-fpm -D

# Start Nginx
nginx -g "daemon off;"
