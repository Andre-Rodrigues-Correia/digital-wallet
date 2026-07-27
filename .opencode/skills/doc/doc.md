---
name: documentacao-projeto
description: Gera e mantém a documentação geral do projeto, incluindo README e documentação técnica de alto nível.
---

# Objetivo

Sua responsabilidade é manter a documentação do projeto sempre atualizada.

Antes de escrever qualquer documentação:

1. Analise toda a estrutura do projeto.
2. Identifique o propósito da aplicação.
3. Descubra automaticamente as tecnologias utilizadas.
4. Identifique como executar o projeto localmente.
5. Identifique variáveis de ambiente necessárias.
6. Procure comandos disponíveis em package.json, Makefile, docker-compose, compose.yml, pom.xml, build.gradle ou arquivos equivalentes.

## O README deve conter

### Visão Geral

Explique em poucas linhas:

- O que a aplicação faz.
- Qual problema ela resolve.
- Seu principal fluxo de negócio.

### Stack

Liste as tecnologias utilizadas, por exemplo:

- Linguagem
- Framework
- Banco de dados
- ORM
- Cache
- Mensageria
- Docker
- Ferramentas de build
- Bibliotecas importantes

### Estrutura do Projeto

Explique resumidamente as principais pastas e responsabilidades.

### Como executar localmente

Documente:

- Pré-requisitos
- Instalação
- Configuração das variáveis de ambiente
- Instalação das dependências
- Comandos para desenvolvimento
- Comandos para build
- Comandos para testes
- Como iniciar a aplicação

Utilize exatamente os comandos encontrados no projeto. Nunca invente comandos.

### Documentação da API

Caso exista Swagger, OpenAPI ou SpringDoc:

Informe apenas onde acessá-lo.

Exemplo:

- Swagger UI: `/docs`
- OpenAPI JSON: `/openapi.json`

Não documente endpoints individuais.

Nunca replique a documentação das rotas, pois ela já é gerada automaticamente pelo Swagger.

### Banco de Dados

Quando possível explique:

- Qual banco é utilizado.
- Como executar migrações.
- Como popular dados iniciais (seed).

### Arquitetura

Explique brevemente:

- Camadas da aplicação.
- Organização dos módulos.
- Principais padrões utilizados.

### Observações

Inclua informações úteis encontradas no projeto, como:

- autenticação;
- filas;
- cache;
- integrações externas;
- armazenamento de arquivos;
- monitoramento;
- observabilidade.

## Regras

- Não invente funcionalidades.
- Não invente tecnologias.
- Não documente código inexistente.
- Baseie toda a documentação exclusivamente no projeto.
- Atualize o README sempre que houver mudanças relevantes.
- Seja objetivo e técnico.
- Utilize Markdown.
- Evite textos excessivamente longos.
- Não documente endpoints da API quando existir Swagger/OpenAPI.
- Priorize informações úteis para novos desenvolvedores que irão configurar e manter o projeto.