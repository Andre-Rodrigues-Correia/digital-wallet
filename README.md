# Digital Wallet API

API backend para carteira digital, construída com NestJS + MongoDB.  

## Funcionalidades

- **Autenticação**: Registro e login com JWT (Bearer Token)
- **Conta Digital**: Geração automática de número de conta (6 dígitos)
- **Carteira**: Criação automática de carteira vinculada ao usuário
- **Depósito**: Saque de valores na carteira
- **Transferência**: Transferência entre contas com validação de saldo
- **Histórico**: Listagem de transações com direção (entrada/saída)
- **Resumo Financeiro**: Totais de recebidos, enviados, depositados, transferidos
- **Estorno**: Reversão de depósitos e transferências
- **Seed de Dados**: 3 usuários de teste criados automaticamente no startup

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | NestJS 11 |
| Linguagem | TypeScript 5.7 |
| Banco de Dados | MongoDB 8 (Mongoose 9) |
| Autenticação | Passport + JWT |
| Validação | class-validator + class-transformer |
| Documentação | Swagger/OpenAPI |
| Segurança | Helmet, bcrypt (12 rounds), CORS |
| Infraestrutura | Docker Compose |

## Pré-requisitos

- Node.js >= 18
- npm
- Docker (para o MongoDB)

## Instalação

```bash
# Clonar o repositório
git clone <url-do-repositorio>
cd digital-wallet

# Instalar dependências
npm install
```

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
PORT=3000
MONGO_URI=mongodb://admin:admin@localhost:27017/wallet?authSource=admin
JWT_SECRET=secret-token
```

## Inicialização

```bash
# 1. Subir o MongoDB
docker compose up -d

# 2. Iniciar a aplicação (dev)
npm run start:dev

# 3. Acessar a aplicação
# API:       http://localhost:3000
# Swagger:   http://localhost:3000/docs
```

## Scripts Disponíveis

| Script | Descrição |
|---|---|
| `npm run start` | Iniciar servidor |
| `npm run start:dev` | Iniciar em modo watch (hot reload) |
| `npm run build` | Compilar para produção |
| `npm run start:prod` | Iniciar em produção |
| `npm run test` | Executar testes unitários |
| `npm run test:e2e` | Executar testes end-to-end |
| `npm run test:cov` | Gerar relatório de cobertura |
| `npm run lint` | Lint + auto-fix |
| `npm run format` | Formatar código com Prettier |

## Endpoints da API

### Autenticação

| Método | Rota | Autenticação | Descrição |
|---|---|---|---|
| `POST` | `/auth/register` | Não | Registrar novo usuário |
| `POST` | `/auth/login` | Não | Login |

**Register — Request:**

```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "Password123"
}
```

**Login — Request:**

```json
{
  "email": "joao@email.com",
  "password": "Password123"
}
```

**Response (ambos):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "665f1a2b3c4d5e6f7a8b9c0d",
    "name": "João Silva",
    "email": "joao@email.com",
    "accountNumber": "10000001"
  }
}
```

### Usuário

| Método | Rota | Autenticação | Descrição |
|---|---|---|---|
| `GET` | `/users/me` | JWT | Dados do usuário + saldo |

**Response:**

```json
{
  "id": "665f1a2b3c4d5e6f7a8b9c0d",
  "name": "João Silva",
  "email": "joao@email.com",
  "accountNumber": "10000001",
  "balance": 1000
}
```

### Transações

| Método | Rota | Autenticação | Descrição |
|---|---|---|---|
| `POST` | `/transactions/deposit` | JWT | Depositar valor |
| `POST` | `/transactions/transfer` | JWT | Transferir para outra conta |
| `GET` | `/transactions` | JWT | Histórico de transações |
| `GET` | `/transactions/summary` | JWT | Resumo financeiro |
| `POST` | `/transactions/:id/reverse` | JWT | Estornar transação |

**Deposit — Request:**

```json
{
  "amount": 500
}
```

**Transfer — Request:**

```json
{
  "accountNumber": "10000002",
  "amount": 200
}
```

## Dados de Seed (Teste)

A aplicação cria automaticamente 3 usuários ao iniciar:

| Nome | Email | Conta | Senha | Saldo Inicial |
|---|---|---|---|---|
| João Silva | joao@email.com | 10000001 | Password123 | R$ 1.000,00 |
| Maria Souza | maria@email.com | 10000002 | Password123 | R$ 1.000,00 |
| Pedro Santos | pedro@email.com | 10000003 | Password123 | R$ 1.000,00 |

## Arquitetura

```
src/
├── main.ts                    # Bootstrap da aplicação
├── app.module.ts              # Módulo raiz
│
├── auth/                      # Autenticação (register, login, JWT)
├── users/                     # Usuários (perfil, repositório)
├── wallet/                    # Carteira (saldo)
├── account/                   # Geração de número de conta
├── transactions/              # Transações (depósito, transferência, estorno)
├── seed/                      # Seed de dados iniciais
│
├── common/                    # Compartilhado
│   ├── constants/
│   ├── database/              # Módulo MongoDB global
│   ├── decorators/            # @CurrentUser()
│   ├── dto/
│   ├── filters/               # HttpExceptionFilter global
│   ├── responses/             # ApiResponse<T>
│   └── security/              # PasswordService, JwtAuthGuard
│
└── confg/                     # Configuração
    ├── database/              # Conexão MongoDB
    └── swagger/               # Configuração OpenAPI
```

**Padrão adotado:** Clean Architecture com Use Cases isolados por módulo.

## Banco de Dados

**MongoDB 8** via Docker Compose.

| Coleção | Descrição |
|---|---|
| `users` | Nome, email (único), senha (oculta por padrão), número da conta (único), referência à carteira |
| `wallets` | Saldo (padrão: 0) |
| `transactions` | Tipo (DEPOSIT/TRANSFER), status, valor, descrição, carteiras envolvidas, dados de estorno |
| `counters` | Contador auto-incremental para números de conta |

## Segurança

- **JWT**: Autenticação via Bearer Token
- **bcrypt**: Hash de senhas com 12 rounds
- **Helmet**: Headers HTTP seguros
- **CORS**: Restrito a `http://localhost:3001`
- **ValidationPipe**: Whitelist + transform + forbidNonWhitelisted
- **Senha oculta**: Campo `password` não retornado nas queries (`select: false`)

## Licença

UNLICENSED
