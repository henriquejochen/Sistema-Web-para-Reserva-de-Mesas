#!/bin/sh
# Executado a cada início do serviço no Render (o plano grátis não tem "pre-deploy").
set -e
python manage.py migrate --noinput
python manage.py criar_mesas
python manage.py criar_admin
exec gunicorn config.wsgi --bind "0.0.0.0:${PORT:-10000}" --workers "${WEB_CONCURRENCY:-2}" --timeout 60 --access-logfile -
