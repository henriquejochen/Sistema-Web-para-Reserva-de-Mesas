
# RN03 - Verificar capacidade da mesa
def validar_capacidade(quantidade_pessoas, capacidade_mesa):
    if quantidade_pessoas <= 0:
        return "Quantidade de pessoas inválida"

    if quantidade_pessoas > capacidade_mesa:
        return "A mesa não comporta essa quantidade de pessoas"

    return "Capacidade permitida"


# RN04 - Verificar se a mesa está ativa
def validar_mesa(ativa):
    if not ativa:
        return "Mesa indisponível"

    return "Mesa disponível"


# RN05 - Validar dados do cliente
def validar_cliente(nome, telefone):
    if not nome.strip() or not telefone.strip():
        return "Nome e telefone são obrigatórios"

    return "Dados válidos"


# RN06 - Definir status inicial da reserva
def criar_status():
    return "confirmada"
