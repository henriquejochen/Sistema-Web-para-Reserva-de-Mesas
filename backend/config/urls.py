from django.conf import settings
from django.contrib import admin
from django.http import FileResponse,HttpResponseNotFound
from django.urls import path,include,re_path

def site(request):
 # Entrega o index.html do frontend para as rotas da interface (/reservar, /equipe...); o React decide a tela.
 index=settings.FRONTEND_DIST/'index.html'
 if not index.is_file():return HttpResponseNotFound('Frontend não compilado. Rode "npm run build" em frontend/ ou use "npm run dev".')
 resposta=FileResponse(open(index,'rb'),content_type='text/html; charset=utf-8')
 resposta['Cache-Control']='no-cache'
 return resposta

urlpatterns=[path('admin/',admin.site.urls),path('api/',include('reservas.urls')),re_path(r'^(?!api/|admin/|static/).*$',site)]
