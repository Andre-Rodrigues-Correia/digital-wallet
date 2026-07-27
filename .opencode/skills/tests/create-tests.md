---
name: gerar-testes
description: Gera testes automatizados essenciais utilizando mocks para dependências externas e banco de dados.
---

# Objetivo

Criar testes automatizados de qualidade para a aplicação, garantindo cobertura dos fluxos mais importantes sem depender de serviços externos.

A prioridade é testar regras de negócio e comportamento da aplicação, não detalhes de implementação.

# Regras principais

- Nunca conectar em banco de dados real.
- Nunca executar migrations.
- Nunca depender de serviços externos.
- Sempre mockar chamadas ao banco de dados.
- Sempre mockar APIs externas.
- Sempre mockar filas, cache, storage ou integrações externas.
- Os testes devem ser rápidos e independentes.
- Não criar testes excessivos apenas para aumentar cobertura.
- Priorizar testes que evitam regressões.

# Estratégia de testes

Antes de criar testes:

1. Analise a arquitetura do projeto.
2. Identifique:
   - Controllers/Handlers
   - Services/Use Cases
   - Repositories
   - Entidades/Models
   - Integrações externas
3. Encontre os pontos onde existem regras de negócio.
4. Escolha os cenários mais importantes.

# O que testar

## Services / Use Cases

Prioridade máxima.

Criar testes para:

- fluxo principal de sucesso;
- validações importantes;
- regras de negócio;
- erros esperados;
- comportamentos alternativos.

Exemplo:

- usuário existente;
- usuário inexistente;
- dados inválidos;
- permissão negada;
- recurso duplicado.

## Controllers / API

Testar somente:

- status HTTP esperado;
- validação de entrada;
- tratamento de erros;
- chamada correta dos serviços.

Não testar toda a lógica novamente se ela já existe nos Services.

## Repositories

Não testar banco real.

Quando um Service chamar um Repository:

Criar mocks:

Exemplo:

```javascript
repository.findById = jest.fn()
  .mockResolvedValue(mockEntity)
```

Validar:

- se o método correto foi chamado;
- parâmetros enviados;
- comportamento quando retorna dados;
- comportamento quando não retorna dados.

# Banco de dados

Sempre substituir:

- Prisma
- TypeORM
- Sequelize
- Mongoose
- Hibernate
- JPA
- qualquer ORM

por mocks.

Exemplo:

```javascript
mockRepository.save.mockResolvedValue(entity)
```

Nunca:

- subir container de banco;
- usar banco em memória;
- criar registros reais.

# Integrações externas

Mockar:

- HTTP clients;
- APIs externas;
- serviços de pagamento;
- autenticação externa;
- envio de email;
- armazenamento.

Validar:

- chamada realizada corretamente;
- tratamento de sucesso;
- tratamento de erro.

# Quantidade de testes

Criar testes essenciais.

Prioridade:

1. Casos críticos do negócio.
2. Fluxos principais.
3. Cenários de erro relevantes.
4. Validações importantes.

Evitar:

- testes redundantes;
- testar getters/setters simples;
- testar código sem regra de negócio.

# Organização

Seguir o padrão existente no projeto.

Criar testes próximos ao código quando essa for a convenção existente.

Exemplos:

```
src/
 ├── services/
 │    └── user.service.ts
 └── services/
      └── user.service.spec.ts
```

ou:

```
tests/
 └── services/
```

# Boas práticas

Cada teste deve ter:

- nome claro;
- cenário explícito;
- Arrange;
- Act;
- Assert.

Exemplo:

```javascript
it('should create user when data is valid', async () => {
  // Arrange
  // Act
  // Assert
})
```

# Antes de finalizar

Verifique:

- Os testes executam sem banco.
- Todos os mocks estão isolados.
- Não existem chamadas reais externas.
- O comando de teste do projeto funciona.
- A documentação dos testes está alinhada ao padrão existente.

# Resultado esperado

Entregar:

- novos arquivos de teste;
- mocks necessários;
- ajustes mínimos na configuração caso necessário;
- resumo dos testes criados;
- comando para executar os testes.