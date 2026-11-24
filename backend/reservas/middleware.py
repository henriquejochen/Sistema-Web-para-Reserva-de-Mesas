class SemCacheNaApi:
 # Respostas da API trazem dados pessoais e tokens: nenhum navegador ou proxy deve guardá-las.
 def __init__(self,get_response):self.get_response=get_response
 def __call__(self,request):
  resposta=self.get_response(request)
  if request.path.startswith('/api/'):resposta['Cache-Control']='no-store'
  return resposta
