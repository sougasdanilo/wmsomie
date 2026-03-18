# 🚨 Configuração das Credenciais do Omie

## ❌ Problema Identificado

As credenciais do Omie não estão configuradas no arquivo `.env`, por isso a sincronização não funciona.

## 🔧 Solução Passo a Passo

### 1. Obter Credenciais do Omie

1. Acesse o portal de desenvolvedores: https://developer.omie.com.br/
2. Faça login com suas credenciais do Omie
3. Vá para "Meus Aplicativos": https://developer.omie.com.br/my-apps/
4. Crie um novo aplicativo ou use um existente
5. Anote a **App Key** e **App Secret**

### 2. Configurar Arquivo .env

Edite o arquivo `.env` na raiz do projeto:

```bash
# Abra o arquivo .env
notepad .env
```

Ou se não existir, crie a partir do exemplo:

```bash
cp .env.example .env
```

Adicione suas credenciais:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/wmsomie
OMIE_APP_KEY=sua_app_key_aqui
OMIE_APP_SECRET=sua_app_secret_aqui
```

### 3. Verificar Configuração

Execute o script de verificação:

```bash
node scripts/check-env.js
```

Você deve ver:
```
🔑 Credenciais Omie:
OMIE_APP_KEY: ✅
OMIE_APP_SECRET: ✅
```

### 4. Testar Conexão

Execute o teste de conexão:

```bash
node scripts/test-omie-connection.js
```

Se tudo estiver correto, você verá:
```
✅ Conexão bem-sucedida!
📊 Encontrados X produtos:
1. PROD001 - Produto Exemplo (ID: 12345)
```

### 5. Sincronizar Produtos

Após configurar as credenciais, você pode:

**Via API:**
```bash
curl -X POST http://localhost:3000/api/sync/products/from-omie
```

**Via Script:**
```bash
node -e "
import { syncProducts } from './services/omieProductService.js';
syncProducts().then(count => console.log(\`Sincronizados \${count} produtos\`));
"
```

**Via Job Automático:**
Inicie o servidor e os jobs serão executados automaticamente a cada 30 minutos.

## 🔍 Troubleshooting

### Erro 403 (Forbidden)
- **Causa**: Credenciais incorretas ou sem permissão
- **Solução**: Verifique App Key e App Secret

### Nenhum Produto Encontrado
- **Causa**: Não há produtos no Omie ou filtros muito restritivos
- **Solução**: 
  1. Verifique se há produtos cadastrados no Omie
  2. Teste com diferentes parâmetros na API

### Erro de Conexão
- **Causa**: Problemas de rede ou API Omie indisponível
- **Solução**: 
  1. Verifique conexão com internet
  2. Tente novamente mais tarde
  3. Verifique status da API Omie

## 📋 Verificação Final

Após configurar, verifique:

1. ✅ Arquivo .env existe e está configurado
2. ✅ Credenciais estão corretas
3. ✅ Teste de conexão funciona
4. ✅ Produtos aparecem na listagem
5. ✅ Sincronização funciona

## 🚀 Próximos Passos

Com as credenciais configuradas:

1. **Sincronize todos os produtos**: `POST /api/sync/products/from-omie`
2. **Sincronize localizações**: `POST /api/sync/locations/from-omie`
3. **Sincronize estoque**: `POST /api/sync/stock/from-omie`
4. **Sincronize movimentações**: `POST /api/sync/movements/from-omie`
5. **Sincronização completa**: `POST /api/sync/full`

## 📞 Ajuda

Se continuar com problemas:

1. Verifique o log em `logs/sync-YYYY-MM-DD.log`
2. Execute `node scripts/test-omie-connection.js` para diagnóstico
3. Confirme permissões do aplicativo no Omie
4. Entre em contato com suporte Omie se necessário

---

**Importante**: Nunca compartilhe suas credenciais (App Key e App Secret) em repositórios públicos!
