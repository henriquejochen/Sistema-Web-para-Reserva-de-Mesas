from django.contrib import admin
from .models import Mesa,Reserva
@admin.register(Mesa)
class MesaAdmin(admin.ModelAdmin):
 list_display=('numero','capacidade','area','ativa')
 list_filter=('area','ativa')
@admin.register(Reserva)
class ReservaAdmin(admin.ModelAdmin):
 list_display=('codigo','mesa','data','previsao_chegada','status')
 list_filter=('data','status')
 search_fields=('codigo','nome')
 readonly_fields=('codigo','token','criado_em','atualizado_em')
