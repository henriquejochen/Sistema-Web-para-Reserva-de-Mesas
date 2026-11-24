from django.urls import path
from . import views
# Rotas conforme docs/contrato-api-frontend.md (o frontend usa VITE_API_BASE_URL=/api).
urlpatterns=[
 path('saude/',views.saude),
 path('configuration/',views.configuracao_publica),
 path('availability/',views.consultar_disponibilidade),
 path('reservations/',views.nova_reserva),
 path('reservations/access/',views.reserva_por_token),
 path('reservations/cancel/',views.cancelar_reserva),
 path('staff/session/',views.sessao),
 path('staff/login/',views.entrar),
 path('staff/logout/',views.sair),
 path('staff/reservations/',views.reservas_do_dia),
 path('staff/reservations/action/',views.acao_reserva),
 path('staff/summary/',views.resumo),
 path('staff/tables/',views.MesasEquipe.as_view()),
 path('staff/tables/<int:pk>/',views.MesaEquipeDetalhe.as_view()),
]
