import secrets
from django.db import models
from django.db.models import Q

def gerar_codigo():
 return secrets.token_hex(4).upper()
def gerar_token():
 return secrets.token_urlsafe(32)

class Mesa(models.Model):
 AREA_CHOICES=[('interna','Interna'),('externa','Externa')]
 numero=models.PositiveIntegerField(unique=True)
 capacidade=models.PositiveIntegerField()
 area=models.CharField(max_length=10,choices=AREA_CHOICES,default='interna')
 ativa=models.BooleanField(default=True)
 criado_em=models.DateTimeField(auto_now_add=True)
 def __str__(self):return f'Mesa {self.numero}'

class Reserva(models.Model):
 STATUS=[('confirmada','Confirmada'),('cancelada','Cancelada'),('concluida','Concluída'),('nao_compareceu','Não compareceu')]
 mesa=models.ForeignKey(Mesa,on_delete=models.PROTECT,related_name='reservas')
 nome=models.CharField(max_length=120)
 telefone=models.CharField(max_length=20)
 pessoas=models.PositiveIntegerField()
 data=models.DateField()
 previsao_chegada=models.TimeField()
 status=models.CharField(max_length=20,choices=STATUS,default='confirmada')
 codigo=models.CharField(max_length=16,unique=True,default=gerar_codigo,editable=False)
 token=models.CharField(max_length=64,unique=True,default=gerar_token,editable=False)
 chegada_confirmada_em=models.DateTimeField(null=True,blank=True)
 criado_em=models.DateTimeField(auto_now_add=True)
 atualizado_em=models.DateTimeField(auto_now=True)
 cancelado_em=models.DateTimeField(null=True,blank=True)
 class Meta:
  constraints=[models.UniqueConstraint(fields=['mesa','data'],condition=Q(status='confirmada'),name='reserva_ativa_unica_mesa_dia')]
 def __str__(self):return f'{self.codigo} - Mesa {self.mesa.numero}'
