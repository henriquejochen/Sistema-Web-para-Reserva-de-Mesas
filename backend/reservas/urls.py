from django.urls import path
from . import views
urlpatterns=[
 path('saude/',views.saude),
 path('mesas/disponiveis/',views.disponibilidade),
 path('reservas/',views.nova_reserva),
 path('reservas/acesso/<str:token>/',views.reserva_por_token),
 path('admin/mesas/',views.MesasAdmin.as_view()),
 path('admin/mesas/<int:pk>/',views.MesaAdminDetalhe.as_view()),
 path('admin/reservas/',views.listar_reservas),
 path('admin/reservas/<int:pk>/status/',views.alterar_status),
 path('admin/reservas/<int:pk>/chegada/',views.confirmar_chegada),
 path('admin/resumo/',views.resumo),
]
