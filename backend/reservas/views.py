from datetime import datetime
from django.db.models import Count,Q
from django.utils import timezone
from rest_framework import generics,status
from rest_framework.decorators import api_view,permission_classes
from rest_framework.permissions import AllowAny,IsAdminUser
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from .models import Mesa,Reserva
from .serializers import MesaSerializer,ReservaSerializer,CriarReservaSerializer
from .services import criar_reserva

@api_view(['GET'])
@permission_classes([AllowAny])
def saude(request):return Response({'status':'ok'})

@api_view(['GET'])
@permission_classes([AllowAny])
def disponibilidade(request):
 try:
  data=timezone.datetime.strptime(request.query_params['data'],'%Y-%m-%d').date()
  pessoas=int(request.query_params['pessoas'])
  if pessoas<1:raise ValueError()
 except (KeyError,ValueError):raise ValidationError({'detalhes':'Informe data=AAAA-MM-DD e pessoas maior que zero.'})
 if data<timezone.localdate():raise ValidationError({'data':'Data passada.'})
 mesas=Mesa.objects.filter(ativa=True,capacidade__gte=pessoas).exclude(reservas__data=data,reservas__status='confirmada').order_by('numero')
 area=request.query_params.get('area')
 if area in ('interna','externa'):mesas=mesas.filter(area=area)
 return Response(MesaSerializer(mesas,many=True).data)

@api_view(['POST'])
@permission_classes([AllowAny])
def nova_reserva(request):
 serializer=CriarReservaSerializer(data=request.data)
 serializer.is_valid(raise_exception=True)
 reserva=criar_reserva(serializer.validated_data)
 return Response({**ReservaSerializer(reserva).data,'token':reserva.token,'link':f'/reservas/{reserva.token}'},status=status.HTTP_201_CREATED)

@api_view(['GET','POST'])
@permission_classes([AllowAny])
def reserva_por_token(request,token):
 from django.shortcuts import get_object_or_404
 reserva=get_object_or_404(Reserva,token=token)
 if request.method=='GET':return Response(ReservaSerializer(reserva).data)
 if request.data.get('confirmar') is not True:raise ValidationError({'confirmar':'Confirme o cancelamento enviando true.'})
 if reserva.status!='confirmada':raise ValidationError({'status':'A reserva não pode ser cancelada.'})
 chegada=timezone.make_aware(datetime.combine(reserva.data,reserva.previsao_chegada),timezone.get_current_timezone())
 if chegada<=timezone.now():raise ValidationError({'data':'Somente reservas futuras podem ser canceladas.'})
 reserva.status='cancelada';reserva.cancelado_em=timezone.now();reserva.save(update_fields=['status','cancelado_em','atualizado_em'])
 return Response({'mensagem':'Reserva cancelada.','codigo':reserva.codigo})

class MesasAdmin(generics.ListCreateAPIView):
 queryset=Mesa.objects.order_by('numero')
 serializer_class=MesaSerializer
 permission_classes=[IsAdminUser]

class MesaAdminDetalhe(generics.RetrieveUpdateAPIView):
 queryset=Mesa.objects.all()
 serializer_class=MesaSerializer
 permission_classes=[IsAdminUser]

@api_view(['GET'])
@permission_classes([IsAdminUser])
def listar_reservas(request):
 qs=Reserva.objects.select_related('mesa').order_by('data','previsao_chegada')
 if request.query_params.get('data'):qs=qs.filter(data=request.query_params['data'])
 if request.query_params.get('status'):qs=qs.filter(status=request.query_params['status'])
 if request.query_params.get('cliente'):qs=qs.filter(nome__icontains=request.query_params['cliente'])
 if request.query_params.get('horario'):qs=qs.filter(previsao_chegada=request.query_params['horario'])
 return Response(ReservaSerializer(qs[:500],many=True).data)

@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def alterar_status(request,pk):
 from django.shortcuts import get_object_or_404
 reserva=get_object_or_404(Reserva,pk=pk)
 novo=request.data.get('status')
 if novo not in dict(Reserva.STATUS):raise ValidationError({'status':'Status inválido.'})
 if reserva.status=='cancelada' and novo=='confirmada':
  if Reserva.objects.filter(mesa=reserva.mesa,data=reserva.data,status='confirmada').exclude(pk=pk).exists():raise ValidationError({'status':'Já existe reserva ativa para esta mesa e dia.'})
 reserva.status=novo
 if novo=='cancelada':reserva.cancelado_em=timezone.now()
 try:
  from django.db import transaction,IntegrityError
  with transaction.atomic():reserva.save()
 except IntegrityError:raise ValidationError({'status':'Conflito de disponibilidade.'})
 return Response(ReservaSerializer(reserva).data)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def confirmar_chegada(request,pk):
 from django.shortcuts import get_object_or_404
 reserva=get_object_or_404(Reserva,pk=pk)
 if reserva.status!='confirmada':raise ValidationError({'status':'Reserva não está confirmada.'})
 reserva.chegada_confirmada_em=timezone.now();reserva.save(update_fields=['chegada_confirmada_em','atualizado_em'])
 return Response(ReservaSerializer(reserva).data)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def resumo(request):
 dia=request.query_params.get('data',str(timezone.localdate()))
 qs=Reserva.objects.filter(data=dia)
 return Response({'data':dia,'mesas_ativas':Mesa.objects.filter(ativa=True).count(),'reservas_confirmadas':qs.filter(status='confirmada').count(),'reservas_canceladas':qs.filter(status='cancelada').count(),'reservas_concluidas':qs.filter(status='concluida').count(),'nao_compareceu':qs.filter(status='nao_compareceu').count()})
