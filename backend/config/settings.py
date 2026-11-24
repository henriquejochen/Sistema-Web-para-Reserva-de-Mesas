import os
from pathlib import Path
import dj_database_url
from corsheaders.defaults import default_headers
from django.core.exceptions import ImproperlyConfigured
from dotenv import load_dotenv
BASE_DIR=Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR/'.env')
SECRET_KEY=os.getenv('DJANGO_SECRET_KEY','dev-only-change-me')
DEBUG=os.getenv('DJANGO_DEBUG','False').lower()=='true'
if not DEBUG and SECRET_KEY in ('dev-only-change-me','troque-por-uma-chave-secreta-grande'):raise ImproperlyConfigured('Defina DJANGO_SECRET_KEY no .env antes de rodar com DJANGO_DEBUG=False.')
ALLOWED_HOSTS=os.getenv('DJANGO_ALLOWED_HOSTS','localhost,127.0.0.1').split(',')
# O Render informa o domínio do serviço (ex.: pizzaria.onrender.com) nesta variável.
RENDER_HOST=os.getenv('RENDER_EXTERNAL_HOSTNAME')
if RENDER_HOST:ALLOWED_HOSTS.append(RENDER_HOST)
INSTALLED_APPS=['django.contrib.admin','django.contrib.auth','django.contrib.contenttypes','django.contrib.sessions','django.contrib.messages','django.contrib.staticfiles','rest_framework','corsheaders','reservas']
MIDDLEWARE=['corsheaders.middleware.CorsMiddleware','django.middleware.security.SecurityMiddleware','whitenoise.middleware.WhiteNoiseMiddleware','django.contrib.sessions.middleware.SessionMiddleware','django.middleware.common.CommonMiddleware','django.middleware.csrf.CsrfViewMiddleware','django.contrib.auth.middleware.AuthenticationMiddleware','django.contrib.messages.middleware.MessageMiddleware','django.middleware.clickjacking.XFrameOptionsMiddleware','reservas.middleware.SemCacheNaApi']
ROOT_URLCONF='config.urls'
TEMPLATES=[{'BACKEND':'django.template.backends.django.DjangoTemplates','DIRS':[],'APP_DIRS':True,'OPTIONS':{'context_processors':['django.template.context_processors.debug','django.template.context_processors.request','django.contrib.auth.context_processors.auth','django.contrib.messages.context_processors.messages']}}]
WSGI_APPLICATION='config.wsgi.application'
if os.getenv('DATABASE_URL'):
 # Produção (Neon): use a connection string com pooling, ex.: postgresql://...-pooler.../neondb?sslmode=require
 DATABASES={'default':dj_database_url.config(conn_max_age=60,conn_health_checks=True,ssl_require=True)}
elif os.getenv('POSTGRES_DB'):
 DATABASES={'default':{'ENGINE':'django.db.backends.postgresql','NAME':os.getenv('POSTGRES_DB'),'USER':os.getenv('POSTGRES_USER'),'PASSWORD':os.getenv('POSTGRES_PASSWORD'),'HOST':os.getenv('POSTGRES_HOST','localhost'),'PORT':os.getenv('POSTGRES_PORT','5432')}}
else:
 DATABASES={'default':{'ENGINE':'django.db.backends.sqlite3','NAME':BASE_DIR/'db.sqlite3'}}
AUTH_PASSWORD_VALIDATORS=[{'NAME':'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},{'NAME':'django.contrib.auth.password_validation.MinimumLengthValidator'},{'NAME':'django.contrib.auth.password_validation.CommonPasswordValidator'},{'NAME':'django.contrib.auth.password_validation.NumericPasswordValidator'}]
LANGUAGE_CODE='pt-br'
TIME_ZONE='America/Sao_Paulo'
USE_I18N=True
USE_TZ=True
STATIC_URL='static/'
STATIC_ROOT=BASE_DIR/'staticfiles'
STORAGES={'default':{'BACKEND':'django.core.files.storage.FileSystemStorage'},'staticfiles':{'BACKEND':'whitenoise.storage.CompressedStaticFilesStorage'}}
# Frontend compilado (npm run build). Em produção o Django entrega o site e a API no mesmo endereço.
FRONTEND_DIST=Path(os.getenv('FRONTEND_DIST',BASE_DIR.parent/'frontend'/'dist'))
WHITENOISE_ROOT=FRONTEND_DIST if FRONTEND_DIST.is_dir() else None
DEFAULT_AUTO_FIELD='django.db.models.BigAutoField'
CORS_ALLOWED_ORIGINS=os.getenv('CORS_ALLOWED_ORIGINS','http://localhost:5173,http://127.0.0.1:5173').split(',')
# O frontend envia cookies de sessão, X-CSRFToken e Idempotency-Key.
CORS_ALLOW_CREDENTIALS=True
CORS_ALLOW_HEADERS=(*default_headers,'idempotency-key')
CSRF_TRUSTED_ORIGINS=CORS_ALLOWED_ORIGINS+[o for o in os.getenv('DJANGO_CSRF_TRUSTED_ORIGINS','').split(',') if o]+([f'https://{RENDER_HOST}'] if RENDER_HOST else [])
REST_FRAMEWORK={'DEFAULT_AUTHENTICATION_CLASSES':['rest_framework.authentication.SessionAuthentication'],'DEFAULT_PERMISSION_CLASSES':['rest_framework.permissions.AllowAny'],'EXCEPTION_HANDLER':'reservas.excecoes.tratar_erros','DEFAULT_THROTTLE_RATES':{'reservas':os.getenv('LIMITE_RESERVAS','60/hour'),'login':os.getenv('LIMITE_LOGIN','10/minute')}}
SESSION_COOKIE_AGE=60*60*12
if not DEBUG:
 SESSION_COOKIE_SECURE=True;CSRF_COOKIE_SECURE=True;SECURE_CONTENT_TYPE_NOSNIFF=True
 SECURE_SSL_REDIRECT=os.getenv('DJANGO_SSL_REDIRECT','True').lower()=='true'
 SECURE_PROXY_SSL_HEADER=('HTTP_X_FORWARDED_PROTO','https')
 SECURE_REDIRECT_EXEMPT=[r'^api/saude/$']  # verificação de saúde do Render
# Políticas da reserva, entregues ao frontend por /api/configuration/ (RN21, RN23).
RESERVA_CHEGADA_MINIMA=os.getenv('RESERVA_CHEGADA_MINIMA','19:30')
RESERVA_CHEGADA_MAXIMA=os.getenv('RESERVA_CHEGADA_MAXIMA','21:30')
RESERVA_MAX_PESSOAS=int(os.getenv('RESERVA_MAX_PESSOAS','12'))
RESERVA_ALERTA_MINUTOS=int(os.getenv('RESERVA_ALERTA_MINUTOS','15'))
RESERVA_TOLERANCIA_MINUTOS=int(os.getenv('RESERVA_TOLERANCIA_MINUTOS','30'))
RESERVA_TELEFONE_CONTATO=os.getenv('RESERVA_TELEFONE_CONTATO') or None
