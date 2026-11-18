from django.core.management.base import BaseCommand
from reservas.models import Mesa
class Command(BaseCommand):
 help='Cadastra as 16 mesas iniciais do protótipo'
 def handle(self,*args,**kwargs):
  capacidades={1:2,2:2,3:4,4:4,5:4,6:4,7:2,8:2,9:2,10:2,11:2,12:2,13:4,14:4,15:4,16:4}
  for numero,capacidade in capacidades.items():
   Mesa.objects.get_or_create(numero=numero,defaults={'capacidade':capacidade,'area':'externa' if numero in (13,14) else 'interna'})
  self.stdout.write(self.style.SUCCESS('Mesas cadastradas.'))
