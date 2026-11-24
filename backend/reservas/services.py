import hashlib,json
from datetime import datetime,timedelta
from django.conf import settings
from django.db import IntegrityError,transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.exceptions import APIException
from .models import Mesa,Reserva,ReservaMesa

DIAS_SEMANA=['segunda','terça','quarta','quinta','sexta','sábado','domingo']

class Conflito(APIException):
 status_code=status.HTTP_409_CONFLICT
 default_detail='A disponibilidade mudou. Consulte novamente antes de confirmar.'

def configuracao():
 return {'minArrival':settings.RESERVA_CHEGADA_MINIMA,'maxArrival':settings.RESERVA_CHEGADA_MAXIMA,'maxGuests':settings.RESERVA_MAX_PESSOAS,'graceMinutes':settings.RESERVA_TOLERANCIA_MINUTOS,'warningMinutes':settings.RESERVA_ALERTA_MINUTOS,'contactPhone':settings.RESERVA_TELEFONE_CONTATO}

def horario_chegada(reserva):
 return timezone.make_aware(datetime.combine(reserva.data,reserva.previsao_chegada),timezone.get_current_timezone())

def atraso_minutos(reserva):
 # Calculado no servidor, com o fuso da pizzaria; o relógio do aparelho não decide nada.
 if reserva.status!='confirmada':return 0
 return max(0,int((timezone.now()-horario_chegada(reserva)).total_seconds()//60))

def acoes_permitidas(reserva,publico):
 if publico:return ['cancel'] if reserva.status=='confirmada' and horario_chegada(reserva)>timezone.now() else []
 if reserva.status=='confirmada':
  return ['arrive','cancel']+(['release'] if atraso_minutos(reserva)>=settings.RESERVA_TOLERANCIA_MINUTOS else [])
 if reserva.status=='presente':return ['complete','cancel']
 return []

def mesas_livres(data,area=None):
 mesas=Mesa.objects.filter(ativa=True).exclude(alocacoes__data=data,alocacoes__ativa=True)
 if area in ('interna','externa'):mesas=mesas.filter(area=area)
 return list(mesas.order_by('capacidade','numero'))

def escolher_mesas(livres,pessoas):
 # Prefere a menor mesa que comporte o grupo; se nenhuma comportar, junta mesas da mesma área (maiores primeiro).
 for mesa in livres:
  if mesa.capacidade>=pessoas:return [mesa]
 melhor=[]
 for area in ('interna','externa'):
  escolhidas=[];total=0
  for mesa in sorted([m for m in livres if m.area==area],key=lambda m:(-m.capacidade,m.numero)):
   if total>=pessoas:break
   escolhidas.append(mesa);total+=mesa.capacidade
  if total>=pessoas and (not melhor or len(escolhidas)<len(melhor)):melhor=escolhidas
 return melhor

def tem_vaga(data,pessoas,area=None):
 return bool(escolher_mesas(mesas_livres(data,area),pessoas))

def formatar_dia(dia):
 return f'{DIAS_SEMANA[dia.weekday()]}, {dia:%d/%m}'

def disponibilidade(data,pessoas,area):
 if pessoas>settings.RESERVA_MAX_PESSOAS:
  return {'available':False,'message':f'Reservas online aceitam até {settings.RESERVA_MAX_PESSOAS} pessoas. Para grupos maiores, contate a pizzaria.','alternatives':[]}
 if tem_vaga(data,pessoas,area):return {'available':True,'message':'Há mesa disponível para este dia.','alternatives':[]}
 alternativas=[]
 if area in ('interna','externa') and tem_vaga(data,pessoas):
  alternativas.append('Área '+('externa' if area=='interna' else 'interna')+' disponível neste dia')
 dia=data
 while len(alternativas)<3 and dia<data+timedelta(days=14):
  dia+=timedelta(days=1)
  if tem_vaga(dia,pessoas,area):alternativas.append(formatar_dia(dia).capitalize())
 return {'available':False,'message':'Sem disponibilidade para este dia. Escolha outra data ou área.','alternatives':alternativas}

def assinatura(dados):
 return hashlib.sha256(json.dumps(dados,sort_keys=True,default=str).encode()).hexdigest()

def reserva_repetida(chave,assinatura_atual):
 existente=Reserva.objects.filter(chave_idempotencia=chave).first()
 if existente and existente.assinatura_requisicao!=assinatura_atual:raise Conflito('Esta requisição já foi usada com outros dados. Atualize a página e tente novamente.')
 return existente

def criar_reserva(dados,chave=None):
 # Retorna (reserva, criada). Repetir a mesma Idempotency-Key com os mesmos dados devolve a reserva já gravada.
 assinatura_atual=assinatura(dados)
 if chave and (existente:=reserva_repetida(chave,assinatura_atual)):return existente,False
 try:
  with transaction.atomic():
   mesas=escolher_mesas(mesas_livres(dados['data'],dados['area']),dados['pessoas'])
   if not mesas:raise Conflito('Não há mesa disponível para este dia e grupo. Escolha outra data ou área.')
   reserva=Reserva.objects.create(**dados,chave_idempotencia=chave,assinatura_requisicao=assinatura_atual)
   # A restrição UNIQUE condicional no banco evita duas confirmações simultâneas para a mesma mesa.
   ReservaMesa.objects.bulk_create([ReservaMesa(reserva=reserva,mesa=m,data=reserva.data) for m in mesas])
   return reserva,True
 except IntegrityError:
  if chave and (existente:=reserva_repetida(chave,assinatura_atual)):return existente,False
  raise Conflito('A mesa acabou de ser reservada por outra pessoa. Consulte novamente.')

def encerrar(reserva,novo,motivo=''):
 agora=timezone.now()
 reserva.status=novo
 if novo in ('cancelada','nao_compareceu'):reserva.cancelado_em=agora;reserva.motivo_cancelamento=motivo
 if novo=='concluida':reserva.concluido_em=agora
 reserva.save()
 # Reserva encerrada libera a(s) mesa(s) para o mesmo dia (RN08).
 reserva.alocacoes.update(ativa=False)

def cancelar_pelo_cliente(token):
 with transaction.atomic():
  reserva=Reserva.objects.select_for_update().get(token=token)
  if 'cancel' not in acoes_permitidas(reserva,publico=True):raise Conflito('O cancelamento não está mais disponível para esta reserva.')
  encerrar(reserva,'cancelada','Cancelada pelo cliente')
 return reserva

def acao_da_equipe(token,acao):
 with transaction.atomic():
  reserva=Reserva.objects.select_for_update().get(token=token)
  if acao not in acoes_permitidas(reserva,publico=False):raise Conflito('Esta ação não está mais disponível. Atualize a lista.')
  if acao=='arrive':
   reserva.status='presente';reserva.chegada_confirmada_em=timezone.now();reserva.save()
  elif acao=='complete':encerrar(reserva,'concluida')
  elif acao=='cancel':encerrar(reserva,'cancelada','Cancelada pela equipe')
  elif acao=='release':encerrar(reserva,'nao_compareceu',f'Não compareceu (mais de {settings.RESERVA_TOLERANCIA_MINUTOS} min de atraso)')
 return reserva
