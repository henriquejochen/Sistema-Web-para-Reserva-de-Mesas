from datetime import datetime,timedelta
from django.contrib.auth.models import User
from django.core.cache import cache
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from .models import Mesa,Reserva,ReservaMesa

class Base(TestCase):
 def setUp(self):
  cache.clear()
  self.client=APIClient()
  self.mesa=Mesa.objects.create(numero=1,capacidade=4)
  self.dia=timezone.localdate()+timedelta(days=3)
  self.dados={'date':str(self.dia),'arrivalTime':'20:00','guests':3,'area':'any','note':'','name':'Maria','phone':'(48) 99999-8888'}
 def criar(self,chave=None,**extra):
  return self.client.post('/api/reservations/',{**self.dados,**extra},format='json',**({'HTTP_IDEMPOTENCY_KEY':chave} if chave else {}))
 def reserva_passada(self,minutos):
  # Reserva confirmada cuja previsão de chegada foi há `minutos` minutos.
  chegada=timezone.localtime()-timedelta(minutes=minutos)
  r=Reserva.objects.create(nome='Ana',telefone='48999990000',pessoas=2,data=chegada.date(),previsao_chegada=chegada.time().replace(second=0,microsecond=0))
  ReservaMesa.objects.create(reserva=r,mesa=self.mesa,data=r.data)
  return r
 def entrar_equipe(self):
  User.objects.create_user('equipe',password='senha-forte-123',is_staff=True)
  self.assertEqual(self.client.post('/api/staff/login/',{'username':'equipe','password':'senha-forte-123'},format='json').status_code,200)

class ReservaClienteTests(Base):
 def test_cria_reserva_no_formato_do_contrato(self):
  r=self.criar();self.assertEqual(r.status_code,201)
  self.assertRegex(r.data['token'],r'^[a-f0-9]{64}$')
  self.assertEqual((r.data['status'],r.data['tables'],r.data['arrivalTime'],r.data['phone'],r.data['area']),('Confirmada',[1],'20:00','48999998888','any'))
  self.assertEqual(r.data['allowedActions'],['cancel'])
  self.assertEqual(r['Cache-Control'],'no-store')
 def test_mesa_ocupada_no_dia_gera_409(self):
  self.assertEqual(self.criar().status_code,201)
  r=self.criar();self.assertEqual(r.status_code,409);self.assertIn('detail',r.data)
 def test_escolhe_menor_mesa_que_comporta(self):
  Mesa.objects.create(numero=2,capacidade=2)
  self.assertEqual(self.criar(guests=2).data['tables'],[2])
 def test_grupo_grande_recebe_mais_de_uma_mesa_da_mesma_area(self):
  Mesa.objects.create(numero=2,capacidade=4);Mesa.objects.create(numero=3,capacidade=4,area='externa')
  r=self.criar(guests=7);self.assertEqual(r.status_code,201);self.assertEqual(r.data['tables'],[1,2])
 def test_preferencia_de_area(self):
  Mesa.objects.create(numero=13,capacidade=4,area='externa')
  self.assertEqual(self.criar(area='externa').data['tables'],[13])
 def test_erros_de_campo_no_formato_do_contrato(self):
  r=self.criar(phone='123',guests=50,arrivalTime='23:00')
  self.assertEqual(r.status_code,400)
  self.assertEqual(set(r.data['fields']),{'phone','guests','arrivalTime'})
  self.assertIsInstance(r.data['detail'],str)
 def test_data_passada(self):
  r=self.criar(date=str(timezone.localdate()-timedelta(days=1)))
  self.assertEqual(r.status_code,400);self.assertIn('arrivalTime',r.data['fields'])
 def test_mesa_inativa_nao_recebe_reserva(self):
  self.mesa.ativa=False;self.mesa.save()
  self.assertEqual(self.criar().status_code,409)
 def test_idempotencia_devolve_a_mesma_reserva(self):
  a=self.criar('chave-1');b=self.criar('chave-1')
  self.assertEqual((a.status_code,b.status_code),(201,200));self.assertEqual(a.data['token'],b.data['token'])
  self.assertEqual(Reserva.objects.count(),1)
 def test_idempotencia_com_dados_diferentes_e_rejeitada(self):
  self.criar('chave-1')
  self.assertEqual(self.criar('chave-1',name='Outra').status_code,409)
 def test_consulta_e_cancelamento_pelo_token(self):
  token=self.criar().data['token']
  r=self.client.post('/api/reservations/access/',{'token':token},format='json');self.assertEqual(r.data['name'],'Maria')
  r=self.client.post('/api/reservations/cancel/',{'token':token},format='json')
  self.assertEqual((r.status_code,r.data['status'],r.data['allowedActions']),(200,'Cancelada',[]))
  self.assertEqual(self.client.post('/api/reservations/cancel/',{'token':token},format='json').status_code,409)
  # Cancelada libera a mesa (RN08)
  self.assertEqual(self.criar().status_code,201)
 def test_token_invalido_404(self):
  self.assertEqual(self.client.post('/api/reservations/access/',{'token':'a'*64},format='json').status_code,404)
  self.assertEqual(self.client.post('/api/reservations/access/',{'token':'../x'},format='json').status_code,404)
 def test_cliente_nao_cancela_reserva_passada(self):
  r=self.reserva_passada(10)
  self.assertEqual(self.client.post('/api/reservations/cancel/',{'token':r.token},format='json').status_code,409)

class DisponibilidadeTests(Base):
 def test_disponivel(self):
  r=self.client.get('/api/availability/',{'date':str(self.dia),'guests':3,'area':'any'})
  self.assertEqual(r.data['available'],True)
 def test_indisponivel_sugere_alternativas(self):
  self.criar()
  r=self.client.get('/api/availability/',{'date':str(self.dia),'guests':3,'area':'interna'})
  self.assertFalse(r.data['available']);self.assertTrue(r.data['alternatives'])
 def test_parametros_invalidos(self):
  self.assertEqual(self.client.get('/api/availability/',{'date':'x','guests':3}).status_code,400)
 def test_configuracao(self):
  r=self.client.get('/api/configuration/')
  self.assertEqual(set(r.data),{'minArrival','maxArrival','maxGuests','graceMinutes','warningMinutes','contactPhone'})

class EquipeTests(Base):
 def test_sem_login_retorna_401(self):
  self.assertEqual(self.client.get('/api/staff/reservations/',{'date':str(self.dia)}).status_code,401)
  self.assertEqual(self.client.get('/api/staff/tables/').status_code,401)
 def test_sessao_login_logout(self):
  r=self.client.get('/api/staff/session/')
  self.assertEqual(r.data['authenticated'],False);self.assertTrue(r.data['csrfToken'])
  self.entrar_equipe()
  self.assertTrue(self.client.get('/api/staff/session/').data['authenticated'])
  self.assertEqual(self.client.post('/api/staff/logout/').status_code,204)
  self.assertFalse(self.client.get('/api/staff/session/').data['authenticated'])
 def test_login_errado_e_usuario_sem_permissao(self):
  User.objects.create_user('cliente',password='senha-forte-123')
  r=self.client.post('/api/staff/login/',{'username':'cliente','password':'senha-forte-123'},format='json')
  self.assertEqual(r.status_code,400);self.assertEqual(r.data['detail'],'Usuário ou senha incorretos.')
 def test_fluxo_chegada_e_conclusao(self):
  token=self.criar().data['token'];self.entrar_equipe()
  lista=self.client.get('/api/staff/reservations/',{'date':str(self.dia)}).data
  self.assertEqual(lista[0]['allowedActions'],['arrive','cancel'])
  r=self.client.post('/api/staff/reservations/action/',{'token':token,'action':'arrive'},format='json')
  self.assertEqual((r.data['status'],r.data['allowedActions']),('Presente',['complete','cancel']))
  r=self.client.post('/api/staff/reservations/action/',{'token':token,'action':'complete'},format='json')
  self.assertEqual(r.data['status'],'Concluída')
  self.assertEqual(self.client.post('/api/staff/reservations/action/',{'token':token,'action':'cancel'},format='json').status_code,409)
 def test_liberacao_por_ausencia_so_apos_tolerancia(self):
  self.entrar_equipe()
  cedo=self.reserva_passada(20)
  r=self.client.post('/api/staff/reservations/action/',{'token':cedo.token,'action':'release'},format='json')
  self.assertEqual(r.status_code,409)
  cedo.alocacoes.update(ativa=False);tarde=self.reserva_passada(40)
  r=self.client.post('/api/staff/reservations/action/',{'token':tarde.token,'action':'release'},format='json')
  self.assertEqual((r.status_code,r.data['status']),(200,'Cancelada'));self.assertIn('Não compareceu',r.data['cancellationReason'])
 def test_atraso_calculado_no_servidor(self):
  self.entrar_equipe();r=self.reserva_passada(20)
  dados=self.client.get('/api/staff/reservations/',{'date':str(r.data)}).data[0]
  self.assertTrue(dados['late']);self.assertGreaterEqual(dados['delayMinutes'],20)
 def test_mesas_cadastro_edicao_e_campos_nao_permitidos(self):
  self.entrar_equipe()
  r=self.client.post('/api/staff/tables/',{'number':20,'capacity':6,'area':'externa','active':True,'status':'Disponível'},format='json')
  self.assertEqual(r.status_code,201)
  r=self.client.patch(f"/api/staff/tables/{r.data['id']}/",{'id':r.data['id'],'number':20,'capacity':8,'area':'externa','active':True,'status':'Ocupada'},format='json')
  self.assertEqual((r.data['capacity'],r.data['status']),(8,'Ocupada'))
  self.assertEqual(self.client.post('/api/staff/tables/',{'number':20,'capacity':2,'area':'interna','active':True,'status':'Disponível'},format='json').status_code,400)
  r=self.client.post('/api/staff/tables/',{'number':21,'capacity':2,'area':'interna','active':True,'status':'Disponível','criado_em':'x'},format='json')
  self.assertEqual(r.status_code,400);self.assertIn('criado_em',r.data['fields'])
 def test_nao_inativa_mesa_com_reserva_futura(self):
  self.criar();self.entrar_equipe()
  r=self.client.patch(f'/api/staff/tables/{self.mesa.pk}/',{'active':False},format='json')
  self.assertEqual(r.status_code,400);self.assertIn('active',r.data['fields'])

class CsrfTests(Base):
 def test_escrita_publica_exige_csrf(self):
  cliente=APIClient(enforce_csrf_checks=True)
  self.assertEqual(cliente.post('/api/reservations/',self.dados,format='json').status_code,403)
  token=cliente.get('/api/staff/session/').data['csrfToken']
  self.assertEqual(cliente.post('/api/reservations/',self.dados,format='json',HTTP_X_CSRFTOKEN=token).status_code,201)
