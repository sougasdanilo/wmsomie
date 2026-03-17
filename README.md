# WMS Omie

Sistema de Gerenciamento de Armazém (WMS) integrado com Omie API.

## Estrutura do Projeto

- **Backend**: Node.js + Express + MongoDB (porta 3000)
- **Frontend**: React + Vite (porta 5173)
- **Integração**: API Omie para sincronização de dados

## Instalação

### Instalar todas as dependências (backend + frontend):
```bash
npm run install:all
```

### Ou instalar separadamente:
```bash
# Backend
npm install

# Frontend
cd ui
npm install
```

## Execução

### Desenvolvimento (Backend + Frontend simultâneo):
```bash
npm run dev:all
```
Isso iniciará:
- Backend em http://localhost:3000
- Frontend em http://localhost:5173

### Parar serviços:
```bash
npm run stop
```

### Produção:
```bash
npm run start:all
```
Isso irá:
1. Buildar o frontend
2. Iniciar o backend em produção

### Executar serviços separadamente:

#### Backend apenas:
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

#### Frontend apenas:
```bash
cd ui

# Desenvolvimento
npm run dev

# Build para produção
npm run build
```

## Variáveis de Ambiente

Configure o arquivo `.env` na raiz do projeto:

```
PORT=3000
MONGODB_URI=sua_string_de_conexao_mongodb
OMIE_APP_KEY=sua_app_key_omie
OMIE_APP_SECRET=sua_app_secret_omie
```

## Funcionalidades

- Gestão de produtos
- Controle de estoque
- Integração com Omie API
- Sincronização automática de dados
- Interface web moderna com React

## Comandos Úteis

- `npm run dev:all` - Inicia backend e frontend em desenvolvimento
- `npm run start:all` - Build e inicia em produção
- `npm run stop` - Para todos os serviços
- `npm run install:all` - Instala dependências de ambos os projetos
