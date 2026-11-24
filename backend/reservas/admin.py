from django.contrib import admin
from .models import Mesa,Reserva,ReservaMesa
@admin.register(Mesa)
class MesaAdmin(admin.ModelAdmin):
 list_display=('numero','capacidade','area','ativa','situacao')
 list_filter=('area','ativa','situacao')
class ReservaMesaInline(admin.TabularInline):
 model=ReservaMesa
 extra=0
 readonly_fields=('mesa','data','ativa')
 can_delete=False
@admin.register(Reserva)
class ReservaAdmin(admin.ModelAdmin):
 list_display=('codigo','nome','data','previsao_chegada','pessoas','status')
 list_filter=('data','status')
 search_fields=('codigo','nome')
 readonly_fields=('codigo','token','chave_idempotencia','criado_em','atualizado_em','cancelado_em','concluido_em','chegada_confirmada_em')
 exclude=('assinatura_requisicao',)
 inlines=[ReservaMesaInline]
