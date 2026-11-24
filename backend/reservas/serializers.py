from datetime import datetime
from django.conf import settings
from django.utils import timezone
from rest_framework import serializers
from .models import Mesa,Reserva
from .services import acoes_permitidas,atraso_minutos,horario_chegada

# Os nomes dos campos da API seguem o contrato do frontend (docs/contrato-api-frontend.md);
# no banco e no código Python os nomes continuam em português (source=...).

class CampoTraduzido(serializers.Field):
 # Traduz valores internos (ex.: 'qualquer') para os valores do contrato (ex.: 'any') e vice-versa.
 def __init__(self,traducao,**kwargs):
  self.traducao=traducao;self.inverso={v:k for k,v in traducao.items()}
  super().__init__(**kwargs)
 def to_representation(self,value):return self.traducao[value]
 def to_internal_value(self,data):
  if data not in self.inverso:raise serializers.ValidationError('Valor inválido. Use: '+', '.join(self.inverso)+'.')
  return self.inverso[data]

AREAS_MESA={'interna':'interna','externa':'externa'}
AREAS_RESERVA={'interna':'interna','externa':'externa','qualquer':'any'}
SITUACOES={'disponivel':'Disponível','reservada':'Reservada','ocupada':'Ocupada'}
STATUS={'confirmada':'Confirmada','presente':'Presente','concluida':'Concluída','cancelada':'Cancelada','nao_compareceu':'Cancelada'}

class MesaSerializer(serializers.ModelSerializer):
 number=serializers.IntegerField(source='numero',min_value=1)
 capacity=serializers.IntegerField(source='capacidade',min_value=1,max_value=50)
 area=CampoTraduzido(AREAS_MESA)
 active=serializers.BooleanField(source='ativa')
 status=CampoTraduzido(SITUACOES,source='situacao')
 class Meta:
  model=Mesa
  fields=['id','number','capacity','area','active','status']
 def validate_number(self,value):
  if Mesa.objects.filter(numero=value).exclude(pk=getattr(self.instance,'pk',None)).exists():raise serializers.ValidationError('Já existe uma mesa com essa identificação.')
  return value
 def validate(self,attrs):
  extras=set(self.initial_data)-set(self.fields)
  if extras:raise serializers.ValidationError({c:'Campo não permitido.' for c in extras})
  # RN18: inativar não apaga histórico, mas não pode deixar reservas ativas futuras sem mesa.
  if self.instance and attrs.get('ativa') is False and self.instance.alocacoes.filter(ativa=True,data__gte=timezone.localdate()).exists():
   raise serializers.ValidationError({'active':'Mesa possui reservas ativas a partir de hoje. Cancele ou conclua essas reservas antes de inativar.'})
  return attrs

class ReservaSerializer(serializers.ModelSerializer):
 code=serializers.CharField(source='codigo')
 date=serializers.DateField(source='data')
 arrivalTime=serializers.TimeField(source='previsao_chegada',format='%H:%M')
 guests=serializers.IntegerField(source='pessoas')
 area=CampoTraduzido(AREAS_RESERVA)
 note=serializers.CharField(source='observacao')
 name=serializers.CharField(source='nome')
 phone=serializers.CharField(source='telefone')
 status=CampoTraduzido(STATUS)
 tables=serializers.SerializerMethodField()
 allowedActions=serializers.SerializerMethodField()
 late=serializers.SerializerMethodField()
 delayMinutes=serializers.SerializerMethodField()
 cancellationReason=serializers.CharField(source='motivo_cancelamento')
 class Meta:
  model=Reserva
  fields=['token','code','date','arrivalTime','guests','area','note','name','phone','status','tables','allowedActions','late','delayMinutes','cancellationReason']
 def get_tables(self,obj):return sorted(a.mesa.numero for a in obj.alocacoes.all())
 def get_allowedActions(self,obj):return acoes_permitidas(obj,publico=self.context.get('publico',True))
 def get_late(self,obj):return atraso_minutos(obj)>=settings.RESERVA_ALERTA_MINUTOS
 def get_delayMinutes(self,obj):return atraso_minutos(obj)

class CriarReservaSerializer(serializers.Serializer):
 date=serializers.DateField()
 arrivalTime=serializers.TimeField()
 guests=serializers.IntegerField(min_value=1)
 area=CampoTraduzido(AREAS_RESERVA)
 note=serializers.CharField(max_length=500,allow_blank=True,required=False,default='')
 name=serializers.CharField(max_length=120,trim_whitespace=True)
 phone=serializers.CharField(max_length=20,trim_whitespace=True)
 def validate_name(self,value):
  if len(value)<2:raise serializers.ValidationError('Informe seu nome.')
  return value
 def validate_phone(self,value):
  digitos=''.join(c for c in value if c.isdigit())
  if len(digitos) not in (10,11):raise serializers.ValidationError('Informe telefone com DDD (10 ou 11 dígitos).')
  return digitos
 def validate_guests(self,value):
  if value>settings.RESERVA_MAX_PESSOAS:raise serializers.ValidationError(f'Informe de 1 a {settings.RESERVA_MAX_PESSOAS} pessoas.')
  return value
 def validate_arrivalTime(self,value):
  minimo=datetime.strptime(settings.RESERVA_CHEGADA_MINIMA,'%H:%M').time();maximo=datetime.strptime(settings.RESERVA_CHEGADA_MAXIMA,'%H:%M').time()
  if not minimo<=value<=maximo:raise serializers.ValidationError(f'Informe a chegada entre {settings.RESERVA_CHEGADA_MINIMA} e {settings.RESERVA_CHEGADA_MAXIMA}.')
  return value
 def validate(self,attrs):
  dados={'data':attrs['date'],'previsao_chegada':attrs['arrivalTime'],'pessoas':attrs['guests'],'area':attrs['area'],'observacao':attrs.get('note',''),'nome':attrs['name'],'telefone':attrs['phone']}
  if horario_chegada(Reserva(**dados))<=timezone.now():raise serializers.ValidationError({'arrivalTime':'Data ou previsão de chegada deve ser futura.'})
  return dados
