from django.db import IntegrityError,transaction
from rest_framework.exceptions import ValidationError
from .models import Reserva

def criar_reserva(dados):
 try:
  with transaction.atomic():
   # A restrição UNIQUE condicional no banco evita duas confirmações simultâneas.
   return Reserva.objects.create(**dados)
 except IntegrityError:
  raise ValidationError({'mesa':'Mesa já reservada neste dia. Escolha outra mesa ou data.'})
