from rest_framework.exceptions import NotAuthenticated,ValidationError
from rest_framework.views import exception_handler

def mensagens(valor):
 if isinstance(valor,dict):return [m for v in valor.values() for m in mensagens(v)]
 if isinstance(valor,(list,tuple)):return [m for v in valor for m in mensagens(v)]
 return [str(valor)]

def tratar_erros(exc,context):
 # Padroniza os erros no formato do contrato: {"detail": "...", "fields": {"campo": ["..."]}}
 resposta=exception_handler(exc,context)
 if resposta is None:return None
 # Sem sessão da equipe: 401 para o frontend pedir novo login (o DRF devolveria 403).
 if isinstance(exc,NotAuthenticated):resposta.status_code=401;resposta.data={'detail':'Sua sessão expirou. Entre novamente.'};return resposta
 dados=resposta.data
 if isinstance(exc,ValidationError):
  if isinstance(dados,dict):
   detalhe=dados.pop('detail',None);gerais=dados.pop('non_field_errors',None)
   campos={k:mensagens(v) for k,v in dados.items()}
   texto=' '.join(mensagens(detalhe)) if detalhe else ' '.join(mensagens(gerais)) if gerais else 'Confira os campos indicados.'
   resposta.data={'detail':texto,**({'fields':campos} if campos else {})}
  else:resposta.data={'detail':' '.join(mensagens(dados))}
 elif not (isinstance(dados,dict) and 'detail' in dados):resposta.data={'detail':' '.join(mensagens(dados))}
 return resposta
