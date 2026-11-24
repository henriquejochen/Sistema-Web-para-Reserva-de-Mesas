import os
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
class Command(BaseCommand):
 help='Cria o superusuário a partir de DJANGO_SUPERUSER_USERNAME/PASSWORD, se ainda não existir (usado no deploy sem terminal)'
 def handle(self,*args,**kwargs):
  usuario=os.getenv('DJANGO_SUPERUSER_USERNAME','').strip();senha=os.getenv('DJANGO_SUPERUSER_PASSWORD','')
  if not usuario or not senha:
   self.stdout.write('DJANGO_SUPERUSER_USERNAME/PASSWORD não definidos; nenhum administrador criado.');return
  User=get_user_model()
  if User.objects.filter(username=usuario).exists():
   # Não sobrescreve: a senha pode ter sido trocada depois pelo /admin.
   self.stdout.write(f'Administrador "{usuario}" já existe.');return
  User.objects.create_superuser(username=usuario,email=os.getenv('DJANGO_SUPERUSER_EMAIL',''),password=senha)
  self.stdout.write(self.style.SUCCESS(f'Administrador "{usuario}" criado.'))
