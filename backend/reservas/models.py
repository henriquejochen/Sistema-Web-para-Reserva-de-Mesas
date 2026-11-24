import secrets
from django.db import models
from django.db.models import Q

def gerar_codigo():
 return 'R-'+secrets.token_hex(4).upper()
def gerar_token():
 # 64 caracteres hexadecimais, formato exigido pelo frontend
 return secrets.token_hex(32)

class Mesa(models.Model):
 AREA_CHOICES=[('interna','Interna'),('externa','Externa')]
 SITUACAO=[('disponivel','Disponível'),('reservada','Reservada'),('ocupada','Ocupada')]
 numero=models.PositiveIntegerField(unique=True)
 capacidade=models.PositiveIntegerField()
 area=models.CharField(max_length=10,choices=AREA_CHOICES,default='interna')
 ativa=models.BooleanField(default=True)
 situacao=models.CharField(max_length=12,choices=SITUACAO,default='disponivel')
 criado_em=models.DateTimeField(auto_now_add=True)
 atualizado_em=models.DateTimeField(auto_now=True)
 def __str__(self):return f'Mesa {self.numero}'

class Reserva(models.Model):
 STATUS=[('confirmada','Confirmada'),('presente','Presente'),('cancelada','Cancelada'),('concluida','Concluída'),('nao_compareceu','Não compareceu')]
 ATIVOS=('confirmada','presente')
 AREA_CHOICES=[('interna','Interna'),('externa','Externa'),('qualquer','Qualquer')]
 mesas=models.ManyToManyField(Mesa,through='ReservaMesa',related_name='reservas')
 nome=models.CharField(max_length=120)
 telefone=models.CharField(max_length=20)
 pessoas=models.PositiveIntegerField()
 data=models.DateField()
 previsao_chegada=models.TimeField()
 area=models.CharField(max_length=10,choices=AREA_CHOICES,default='qualquer')
 observacao=models.TextField(max_length=500,blank=True)
 status=models.CharField(max_length=20,choices=STATUS,default='confirmada')
 motivo_cancelamento=models.CharField(max_length=120,blank=True)
 codigo=models.CharField(max_length=16,unique=True,default=gerar_codigo,editable=False)
 token=models.CharField(max_length=64,unique=True,default=gerar_token,editable=False)
 chave_idempotencia=models.CharField(max_length=64,unique=True,null=True,blank=True,editable=False)
 assinatura_requisicao=models.CharField(max_length=64,blank=True,editable=False)
 chegada_confirmada_em=models.DateTimeField(null=True,blank=True)
 concluido_em=models.DateTimeField(null=True,blank=True)
 criado_em=models.DateTimeField(auto_now_add=True)
 atualizado_em=models.DateTimeField(auto_now=True)
 cancelado_em=models.DateTimeField(null=True,blank=True)
 class Meta:
  indexes=[models.Index(fields=['data','status'])]
 def __str__(self):return self.codigo

class ReservaMesa(models.Model):
 # Uma linha por mesa atribuída. A restrição única condicional impede duas reservas ativas na mesma mesa/dia (RN01).
 reserva=models.ForeignKey(Reserva,on_delete=models.CASCADE,related_name='alocacoes')
 mesa=models.ForeignKey(Mesa,on_delete=models.PROTECT,related_name='alocacoes')
 data=models.DateField()
 ativa=models.BooleanField(default=True)
 class Meta:
  constraints=[models.UniqueConstraint(fields=['mesa','data'],condition=Q(ativa=True),name='mesa_ativa_unica_dia'),models.UniqueConstraint(fields=['reserva','mesa'],name='reserva_mesa_unica')]
 def __str__(self):return f'{self.reserva.codigo} - Mesa {self.mesa.numero}'
