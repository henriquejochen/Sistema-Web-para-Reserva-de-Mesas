from datetime import datetime
from django.utils import timezone
from rest_framework import serializers
from .models import Mesa,Reserva

class MesaSerializer(serializers.ModelSerializer):
 class Meta:
  model=Mesa
  fields=['id','numero','capacidade','area','ativa']
 def validate_capacidade(self,value):
  if value<1:raise serializers.ValidationError('Capacidade deve ser maior que zero.')
  return value

class ReservaSerializer(serializers.ModelSerializer):
 mesa_numero=serializers.IntegerField(source='mesa.numero',read_only=True)
 class Meta:
  model=Reserva
  fields=['codigo','mesa_numero','pessoas','data','previsao_chegada','status','criado_em','chegada_confirmada_em']

class CriarReservaSerializer(serializers.Serializer):
 mesa=serializers.PrimaryKeyRelatedField(queryset=Mesa.objects.all())
 nome=serializers.CharField(max_length=120,trim_whitespace=True)
 telefone=serializers.CharField(max_length=20,trim_whitespace=True)
 pessoas=serializers.IntegerField(min_value=1)
 data=serializers.DateField()
 previsao_chegada=serializers.TimeField()
 def validate_telefone(self,value):
  digitos=''.join(c for c in value if c.isdigit())
  if len(digitos) not in (10,11):raise serializers.ValidationError('Informe telefone com DDD (10 ou 11 dígitos).')
  return value
 def validate(self,attrs):
  mesa=attrs['mesa']
  if not mesa.ativa:raise serializers.ValidationError({'mesa':'Mesa indisponível.'})
  if attrs['pessoas']>mesa.capacidade:raise serializers.ValidationError({'pessoas':'Capacidade da mesa insuficiente.'})
  chegada=timezone.make_aware(datetime.combine(attrs['data'],attrs['previsao_chegada']),timezone.get_current_timezone())
  if chegada<=timezone.now():raise serializers.ValidationError({'data':'Data ou previsão de chegada deve ser futura.'})
  return attrs
