# LumisDex Backend

API REST para a Pokédex LumisDex, construída com Node.js, TypeScript e Express.

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **TypeScript** - Tipagem estática
- **Express** - Framework web
- **Redis** - Cache de dados
- **PostgreSQL** - Banco de dados relacional (preparado para favoritos)
- **Jest** - Framework de testes
- **Zod** - Validação de schemas

## 📁 Estrutura do Projeto

```
src/
├── config/         # Configurações da aplicação
├── controllers/    # Controladores das rotas
├── middlewares/    # Middlewares Express
├── routes/         # Definição das rotas
├── services/       # Lógica de negócio
├── types/          # Definições TypeScript
├── utils/          # Funções utilitárias
├── __tests__/      # Testes unitários
├── app.ts          # Configuração Express
└── server.ts       # Ponto de entrada
```

## 🛠️ Instalação

```bash
# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp env.example .env

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar em produção
npm start
```

## 🧪 Testes

```bash
# Rodar testes
npm test

# Testes em modo watch
npm run test:watch

# Cobertura de testes
npm run test:coverage
```

## 📡 API Endpoints

### Health Check
```
GET /api/health
```

### Listar Pokémon
```
GET /api/pokemon
Query params:
  - page (number): Página atual (default: 1)
  - limit (number): Itens por página (default: 20, max: 100)
  - type (string): Filtrar por tipo
```

### Buscar Pokémon por ID ou Nome
```
GET /api/pokemon/:idOrName
```

### Pesquisar Pokémon
```
GET /api/pokemon/search
Query params:
  - q (string): Termo de busca
```

## 🗃️ Configuração Redis (Opcional)

O Redis é usado para cache, mas a aplicação funciona sem ele.

```bash
# Docker
docker run -d -p 6379:6379 redis:alpine
```

## 📋 Variáveis de Ambiente

| Variável | Descrição | Default |
|----------|-----------|---------|
| PORT | Porta do servidor | 3001 |
| NODE_ENV | Ambiente | development |
| REDIS_URL | URL do Redis | redis://localhost:6379 |
| DATABASE_URL | URL do PostgreSQL | - |
| POKEAPI_BASE_URL | URL da PokéAPI | https://pokeapi.co/api/v2 |
| CACHE_TTL | TTL do cache (segundos) | 3600 |

## 📝 Git Flow

Este projeto segue o Git Flow:

- `main` - Código de produção
- `develop` - Branch de desenvolvimento
- `feature/*` - Features em desenvolvimento
- `release/*` - Preparação para release
- `hotfix/*` - Correções urgentes

## 📄 Licença

MIT

