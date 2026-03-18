# Sincronização com Omie - Estoque e Movimentações

Este documento descreve a implementação da sincronização de estoque e movimentações entre o WMS e a API do Omie.

## 🚀 Funcionalidades Implementadas

### 📦 Sincronização de Estoque
- **Bidirecional**: Sincronização do WMS para Omie e vice-versa
- **Consulta em tempo real**: Verificação de estoque atual no Omie
- **Ajustes manuais**: Possibilidade de ajustar estoque diretamente no Omie
- **Erros tratados**: Logging detalhado de falhas e sucessos

### 🔄 Sincronização de Movimentações
- **Todos os tipos**: Entrada (IN), Saída (OUT) e Transferências (TRANSFER)
- **Mapeamento automático**: Conversão entre tipos de movimentação WMS e Omie
- **Sincronização automática**: Movimentações criadas no WMS são enviadas ao Omie
- **Histórico**: Importação de movimentações históricas do Omie

### 📍 Sincronização de Localizações
- **Importação automática**: Sincronização de locais de estoque do Omie
- **Mapeamento**: Associação entre localizações WMS e Omie

### ⏰ Jobs Automáticos
- **Frequências configuráveis**: Diferentes intervalos para cada tipo de sincronização
- **Execução resiliente**: Continua mesmo com falhas parciais
- **Logging completo**: Registro de todas as execuções

## 📁 Estrutura de Arquivos

### Serviços Principais
- `services/omieStockService.js` - Sincronização de estoque
- `services/omieMovementService.js` - Sincronização de movimentações
- `services/omieClient.js` - Cliente base da API Omie

### Models Atualizados
- `models/Stock.js` - Com campos de sincronização
- `models/Movement.js` - Com omieId, syncedAt, date, description
- `models/Location.js` - Com omieId
- `models/Product.js` - Com omieId (já existia)

### Jobs e Rotinas
- `jobs/syncJob.js` - Jobs automáticos de sincronização
- `routes/sync.js` - Endpoints REST para sincronização manual

### Utilitários
- `utils/syncLogger.js` - Sistema de logging especializado

## 🛠️ Endpoints da API

### Estoque
```
POST /api/sync/stock/from-omie     - Sincronizar estoque do Omie
POST /api/sync/stock/to-omie       - Enviar estoque para Omie
GET  /api/sync/stock/:productId    - Consultar estoque específico
POST /api/sync/stock/adjust        - Ajustar estoque no Omie
```

### Movimentações
```
POST /api/sync/movements/from-omie    - Sincronizar movimentações do Omie
POST /api/sync/movements/to-omie/:id  - Enviar movimentação para Omie
```

### Localizações
```
POST /api/sync/locations/from-omie    - Sincronizar localizações do Omie
```

### Produtos
```
POST /api/sync/products/from-omie     - Sincronizar produtos do Omie
```

### Completo
```
POST /api/sync/full                   - Sincronização completa
GET  /api/sync/status                 - Status da sincronização
```

## ⏰ Agenda de Jobs Automáticos

| Job | Frequência | Descrição |
|-----|-----------|-----------|
| Orders | A cada 10 minutos | Sincronização de pedidos |
| Products | A cada 30 minutos | Sincronização de produtos |
| Locations | Diário às 2AM | Sincronização de localizações |
| Stock (from Omie) | A cada hora | Importação de estoque |
| Stock (to Omie) | A cada 15 minutos | Envio de estoque |
| Movements | A cada 2 horas | Importação de movimentações |

## 🔧 Configuração

### Variáveis de Ambiente
```env
OMIE_APP_KEY=sua_chave_app
OMIE_APP_SECRET=seu_secret
NODE_ENV=development  # Para debug logs
```

### Dependências
- `axios` - Client HTTP
- `node-cron` - Agendamento de jobs
- `mongoose` - Banco de dados

## 📊 Modelos de Dados

### Movement (atualizado)
```javascript
{
  type: 'IN' | 'OUT' | 'TRANSFER',
  product: ObjectId,
  fromLocation: ObjectId,
  toLocation: ObjectId,
  quantity: Number,
  omieId: String,          // ID no Omie
  date: Date,              // Data da movimentação
  description: String,     // Descrição
  syncedAt: Date          // Data da última sincronização
}
```

### Location (atualizado)
```javascript
{
  code: String,
  description: String,
  omieId: String          // ID no Omie
}
```

## 📝 Logs e Monitoramento

### Sistema de Logging
- **Arquivos**: `logs/sync-YYYY-MM-DD.log`
- **Níveis**: info, warn, error, debug
- **Rotação**: Logs automáticos por data
- **Limpeza**: Remoção automática de logs antigos (30 dias)

### Exemplo de Log
```json
{
  "timestamp": "2024-03-18T10:30:00.000Z",
  "level": "info",
  "message": "Stock sync success: sent_to_omie",
  "data": {
    "productId": "507f1f77bcf86cd799439011",
    "sku": "PROD-001",
    "omieId": "12345",
    "quantity": 100,
    "action": "sent_to_omie"
  }
}
```

## 🔄 Fluxo de Sincronização

### Estoque WMS → Omie
1. Busca todos os registros de estoque com produtos que têm omieId
2. Para cada produto, chama API de ajuste de estoque do Omie
3. Registra sucesso/erro com logging detalhado

### Estoque Omie → WMS
1. Lista todos os produtos com omieId
2. Para cada produto, consulta estoque atual no Omie
3. Atualiza registro local com quantidade do Omie
4. Cria/atualiza registro de estoque na localização padrão

### Movimentações WMS → Omie
1. Após criar movimentação no WMS, tenta enviar para Omie
2. Mapeia tipo WMS → Omie (IN=E, OUT=S, TRANSFER=E+S)
3. Para transferências, cria dois movimentos (OUT + IN)
4. Atualiza movimento com omieId e syncedAt

### Movimentações Omie → WMS
1. Consulta movimentações no período especificado
2. Para cada movimentação não existente localmente:
   - Mapeia tipo Omie → WMS
   - Cria registro local
   - Atualiza estoque correspondente
   - Marca com omieId

## 🚨 Tratamento de Erros

### Estratégias
- **Non-blocking**: Falhas na sincronização não impedem operações locais
- **Retry automático**: Jobs continuam executando mesmo com erros
- **Logging detalhado**: Todos os erros são registrados com contexto
- **Partial success**: Sincronização continua mesmo com falhas parciais

### Tipos de Erros Comuns
- Produto sem omieId (skip com warning)
- API Omie indisponível (retry no próximo job)
- Dados inválidos (log e continue)
- Conflitos de sincronização (previne duplicação com omieId)

## 🧪 Testes e Validação

### Testes Manuais
```bash
# Sincronização completa
curl -X POST http://localhost:3000/api/sync/full

# Status da sincronização
curl -X GET http://localhost:3000/api/sync/status

# Sincronizar estoque específico
curl -X POST http://localhost:3000/api/sync/stock/from-omie
```

### Validação
- Verificar logs em `logs/sync-*.log`
- Comparar quantidades entre WMS e Omie
- Testar criação de movimentações
- Validar jobs automáticos

## 📈 Performance

### Otimizações
- **Batch processing**: Processamento em lote para grandes volumes
- **Indexação**: Índices em omieId para consultas rápidas
- **Conexão reutilizada**: Client HTTP otimizado
- **Logging assíncrono**: Não bloqueia operações

### Limitações
- Rate limiting da API Omie
- Volume de dados em sincronizações completas
- Conexões simultâneas

## 🔮 Futuras Melhorias

- Webhooks para sincronização em tempo real
- Dashboard de monitoramento
- Alertas de falhas
- Sincronização seletiva por produto/local
- Histórico de alterações
- Reconciliação automática

## 📞 Suporte

Em caso de problemas:
1. Verificar logs em `logs/`
2. Validar configuração das chaves Omie
3. Testar conectividade com API Omie
4. Verificar consistência dos dados
