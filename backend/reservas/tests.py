from datetime import timedelta
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient
from .models import Mesa,Reserva
class ReservaTests(TestCase):
 def setUp(self):
  self.client=APIClient();self.mesa=Mesa.objects.create(numero=1,capacidade=4)
  self.dia=timezone.localdate()+timedelta(days=3)
  self.dados={'mesa':self.mesa.pk,'nome':'Maria','telefone':'48999998888','pessoas':3,'data':str(self.dia),'previsao_chegada':'19:00'}
 def test_cria_reserva_e_impede_duplicata(self):
  r=self.client.post('/api/reservas/',self.dados,format='json');self.assertEqual(r.status_code,201)
  r=self.client.post('/api/reservas/',self.dados,format='json');self.assertEqual(r.status_code,400)
 def test_capacidade(self):
  dados={**self.dados,'pessoas':5}
  self.assertEqual(self.client.post('/api/reservas/',dados,format='json').status_code,400)
 def test_cancelamento_libera_mesa(self):
  r=self.client.post('/api/reservas/',self.dados,format='json')
  token=r.data['token']
  self.assertEqual(self.client.post(f'/api/reservas/acesso/{token}/',{'confirmar':True},format='json').status_code,200)
  self.assertEqual(self.client.post('/api/reservas/',self.dados,format='json').status_code,201)
 def test_sem_token_nao_consulta_reserva(self):
  self.client.post('/api/reservas/',self.dados,format='json')
  self.assertEqual(self.client.get('/api/admin/reservas/').status_code,403)
 def test_mesa_inativa(self):
  self.mesa.ativa=False;self.mesa.save()
  self.assertEqual(self.client.post('/api/reservas/',self.dados,format='json').status_code,400)
