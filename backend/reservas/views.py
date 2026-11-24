import re
from django.contrib.auth import authenticate,login,logout
from django.middleware.csrf import get_token
from django.utils import timezone
from rest_framework import generics,status
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import api_view,permission_classes,throttle_classes
from rest_framework.exceptions import NotFound,ValidationError
from rest_framework.permissions import AllowAny,IsAdminUser
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from .models import Mesa,Reserva
from .serializers import MesaSerializer,ReservaSerializer,CriarReservaSerializer,AREAS_RESERVA
from .services import configuracao,disponibilidade,criar_reserva,cancelar_pelo_cliente,acao_da_equipe

# Limite de requisições por IP para visitantes (taxas em settings.REST_FRAMEWORK).
class LimiteReservas(AnonRateThrottle):scope='reservas'
class LimiteLogin(AnonRateThrottle):scope='login'

def exigir_csrf(request):
 # O DRF só verifica CSRF para usuários logados; as escritas públicas também exigem o token emitido em /staff/session/.
 SessionAuthentication().enforce_csrf(request)

def buscar_por_token(request):
 token=str(request.data.get('token',''))
 if not re.fullmatch(r'[a-f0-9]{64}',token):raise NotFound('Link inválido ou reserva não encontrada.')
 try:return Reserva.objects.prefetch_related('alocacoes__mesa').get(token=token)
 except Reserva.DoesNotExist:raise NotFound('Link inválido ou reserva não encontrada.')

@api_view(['GET'])
@permission_classes([AllowAny])
def saude(request):return Response({'status':'ok'})

@api_view(['GET'])
@permission_classes([AllowAny])
def configuracao_publica(request):return Response(configuracao())

# ---------- Sessão da equipe ----------

@api_view(['GET'])
@permission_classes([AllowAny])
def sessao(request):
 # Funciona para visitantes: emite o cookie CSRF usado pelas escritas do frontend.
 return Response({'authenticated':bool(request.user.is_authenticated and request.user.is_staff),'csrfToken':get_token(request)})

@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([LimiteLogin])
def entrar(request):
 exigir_csrf(request)
 usuario=authenticate(request,username=str(request.data.get('username','')).strip(),password=str(request.data.get('password','')))
 if usuario is None or not usuario.is_staff:raise ValidationError({'detail':'Usuário ou senha incorretos.'})
 login(request._request,usuario)
 return Response({'authenticated':True,'csrfToken':get_token(request)})

@api_view(['POST'])
@permission_classes([AllowAny])
def sair(request):
 exigir_csrf(request)
 logout(request._request)
 return Response(status=status.HTTP_204_NO_CONTENT)

# ---------- Cliente (sem conta, acesso pelo link exclusivo) ----------

@api_view(['GET'])
@permission_classes([AllowAny])
def consultar_disponibilidade(request):
 try:
  data=timezone.datetime.strptime(request.query_params['date'],'%Y-%m-%d').date()
  pessoas=int(request.query_params['guests'])
  if pessoas<1:raise ValueError()
 except (KeyError,ValueError):raise ValidationError({'date':'Informe date=AAAA-MM-DD e guests maior que zero.'})
 if data<timezone.localdate():raise ValidationError({'date':'Escolha uma data a partir de hoje.'})
 area=request.query_params.get('area','any')
 if area not in AREAS_RESERVA.values():raise ValidationError({'area':'Use interna, externa ou any.'})
 return Response(disponibilidade(data,pessoas,area))

@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([LimiteReservas])
def nova_reserva(request):
 exigir_csrf(request)
 chave=request.headers.get('Idempotency-Key','').strip()[:64] or None
 serializer=CriarReservaSerializer(data=request.data)
 serializer.is_valid(raise_exception=True)
 reserva,criada=criar_reserva(serializer.validated_data,chave)
 return Response(ReservaSerializer(reserva,context={'publico':True}).data,status=status.HTTP_201_CREATED if criada else status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([LimiteReservas])
def reserva_por_token(request):
 exigir_csrf(request)
 return Response(ReservaSerializer(buscar_por_token(request),context={'publico':True}).data)

@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([LimiteReservas])
def cancelar_reserva(request):
 exigir_csrf(request)
 reserva=cancelar_pelo_cliente(buscar_por_token(request).token)
 return Response(ReservaSerializer(reserva,context={'publico':True}).data)

# ---------- Equipe (exige usuário is_staff logado) ----------

@api_view(['GET'])
@permission_classes([IsAdminUser])
def reservas_do_dia(request):
 try:dia=timezone.datetime.strptime(request.query_params.get('date',''),'%Y-%m-%d').date()
 except ValueError:raise ValidationError({'date':'Informe date=AAAA-MM-DD.'})
 qs=Reserva.objects.filter(data=dia).prefetch_related('alocacoes__mesa').order_by('previsao_chegada','criado_em')
 return Response(ReservaSerializer(qs,many=True,context={'publico':False}).data)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def acao_reserva(request):
 acao=request.data.get('action')
 if acao not in ('arrive','complete','cancel','release'):raise ValidationError({'action':'Ação inválida.'})
 reserva=acao_da_equipe(buscar_por_token(request).token,acao)
 return Response(ReservaSerializer(reserva,context={'publico':False}).data)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def resumo(request):
 dia=request.query_params.get('date',str(timezone.localdate()))
 qs=Reserva.objects.filter(data=dia)
 return Response({'date':dia,'activeTables':Mesa.objects.filter(ativa=True).count(),**{s:qs.filter(status=s).count() for s,_ in Reserva.STATUS}})

class MesasEquipe(generics.ListCreateAPIView):
 queryset=Mesa.objects.order_by('numero')
 serializer_class=MesaSerializer
 permission_classes=[IsAdminUser]

class MesaEquipeDetalhe(generics.UpdateAPIView):
 queryset=Mesa.objects.all()
 serializer_class=MesaSerializer
 permission_classes=[IsAdminUser]
 http_method_names=['patch','put']
