# CodeBurger — Plano de Observabilidade com Datadog

## Sumário

- [1. Formato de Log Estruturado](#1-formato-de-log-estruturado)
- [2. Conectar Vercel ao Datadog (Log Forwarder)](#2-conectar-vercel-ao-datadog-log-forwarder)
- [3. Dashboard — CodeBurger API Overview](#3-dashboard--codeburger-api-overview)
- [4. Monitores e Alertas](#4-monitores-e-alertas)
- [5. Variáveis de Ambiente Necessárias](#5-variáveis-de-ambiente-necessárias)

---

## 1. Formato de Log Estruturado

Todos os logs emitidos pelo backend (Vercel Functions e Express local) seguem o mesmo schema JSON. O Datadog Log Forwarder ingere o stdout das funções e faz o parse automático de qualquer linha que seja JSON válido.

### Schema

```json
{
  "timestamp":    "2025-06-11T14:32:01.123Z",
  "level":        "info",
  "message":      "request completed",
  "method":       "GET",
  "url":          "/api/orders",
  "statusCode":   200,
  "responseTime": 42.87,
  "service":      "code-burger-api",
  "env":          "production"
}
```

| Campo          | Tipo    | Mapeamento Datadog        | Descrição                              |
|----------------|---------|---------------------------|----------------------------------------|
| `timestamp`    | string  | `@timestamp`              | ISO-8601, fuso UTC                     |
| `level`        | string  | `status` / `@level`       | `info`, `warn`, `error`                |
| `message`      | string  | `message`                 | Descrição legível do evento            |
| `method`       | string  | `@method`                 | Verbo HTTP                             |
| `url`          | string  | `@url`                    | Path completo (com query string)       |
| `statusCode`   | number  | `@statusCode`             | Código HTTP da resposta                |
| `responseTime` | number  | `@responseTime`           | Latência em milissegundos              |
| `service`      | string  | `service`                 | Identificador do serviço no Datadog    |
| `env`          | string  | `env`                     | Ambiente: `production`, `development`  |

### Níveis de severidade

| Condição           | `level` |
|--------------------|---------|
| `statusCode < 400` | `info`  |
| `statusCode >= 400` | `warn` |
| `statusCode >= 500` | `error`|

---

## 2. Conectar Vercel ao Datadog (Log Forwarder)

### Opção A — Integração oficial via Vercel Marketplace (recomendado)

A integração nativa usa a API de **Log Drains** da Vercel e o **Datadog HTTP Log Intake**.

#### Pré-requisitos

- Conta Datadog com acesso de Administrador
- Projeto Vercel no plano Pro ou Enterprise (Log Drains requerem plano pago)
- API Key do Datadog (`DD_API_KEY`)

#### Passos

1. **Gerar API Key no Datadog**
   - Acesse: _Organization Settings → API Keys → New Key_
   - Nome sugerido: `vercel-log-drain`
   - Copie a chave gerada

2. **Adicionar Log Drain no Vercel**
   - Acesse: _Vercel Dashboard → Team Settings → Log Drains → Add Drain_
   - **Delivery format:** `json`
   - **Endpoint URL:** `https://http-intake.logs.datadoghq.com/api/v2/logs?dd-api-key=<DD_API_KEY>&ddsource=vercel&service=code-burger-api&ddtags=env:production`
   - **Sources:** marque `Build Logs`, `Function Logs`, `Edge Logs`
   - Clique em **Create Log Drain**

3. **Verificar chegada dos logs**
   - Datadog → _Logs → Live Tail_
   - Filtrar por: `service:code-burger-api`
   - Fazer uma requisição na URL de produção e confirmar o log JSON aparece

### Opção B — Log Drain manual (planos gratuitos / hobby)

No plano Hobby da Vercel, Log Drains não estão disponíveis. Use o **Vercel CLI** para redirecionar logs localmente durante desenvolvimento:

```bash
vercel logs <deployment-url> --follow | datadog-ci logs upload --service code-burger-api
```

Ou configure um pipeline no CI que envia logs pós-deploy.

### Configurar Pipeline de Log no Datadog

Após a ingestão, crie um **Log Pipeline** para enriquecer os atributos:

1. Datadog → _Logs → Configuration → Pipelines → Add Pipeline_
2. **Filter:** `service:code-burger-api`
3. Adicionar os processadores:

   **Remapper de Status:**
   - Type: `Log Status Remapper`
   - Set status from attribute: `level`

   **Remapper de Data:**
   - Type: `Log Date Remapper`
   - Set date from attribute: `timestamp`

   **Attribute Remapper (para métricas HTTP padrão):**
   - `statusCode` → `http.status_code`
   - `method` → `http.method`
   - `url` → `http.url`
   - `responseTime` → `duration`

---

## 3. Dashboard — CodeBurger API Overview

### Criar o Dashboard

1. Datadog → _Dashboards → New Dashboard_
2. Nome: `CodeBurger API — Overview`
3. Tipo: `Timeboard`

### Widgets recomendados

#### Widget 1 — Request Rate (req/min)

```
Tipo: Timeseries
Query: logs("service:code-burger-api").index("*").rollup("count").by("method").every("1m")
Título: Requisições por Método
```

#### Widget 2 — Latência P50 / P95 / P99

```
Tipo: Timeseries
Query: logs("service:code-burger-api").index("*").rollup("pct_agg", "@responseTime", 95)
Título: Latência P95 (ms)
Threshold visual: linha vermelha em 500ms
```

#### Widget 3 — Taxa de Erros 5xx

```
Tipo: Query Value
Query (numerador):   logs("service:code-burger-api @statusCode:>=500").count()
Query (denominador): logs("service:code-burger-api").count()
Fórmula: (a / b) * 100
Sufixo: %
Título: Taxa de Erro 5xx
Threshold: vermelho acima de 5%
```

#### Widget 4 — Distribuição de Status Codes

```
Tipo: Top List
Query: logs("service:code-burger-api").index("*").rollup("count").by("@statusCode")
Título: Status Codes
```

#### Widget 5 — Mapa de Calor de Latência por Endpoint

```
Tipo: Heatmap
Query: logs("service:code-burger-api").index("*").rollup("pct_agg", "@responseTime", 95).by("@url")
Título: Latência por Rota (P95)
```

#### Widget 6 — Últimos Erros (Log Stream)

```
Tipo: Log Stream
Query: service:code-burger-api @level:error
Colunas: timestamp, @method, @url, @statusCode, message
Título: Erros Recentes
```

### Variáveis de Template do Dashboard

Configure no topo do dashboard:

| Variável  | Tag          | Valor padrão |
|-----------|--------------|--------------|
| `$env`    | `env`        | `production` |
| `$method` | `@method`    | `*`          |

Use `$env` em todas as queries: `service:code-burger-api env:$env`

---

## 4. Monitores e Alertas

### Monitor 1 — Alerta de Latência (P95 > 500ms)

**Tipo:** Log-based Metric Alert

```
1. Datadog → Monitors → New Monitor → Logs
2. Define the search query:
   service:code-burger-api

3. Evaluate the:
   ☑ Metric: p95(@responseTime)
   Over: last 5 minutes

4. Alert conditions:
   Alert threshold:   > 500   (ms)
   Warning threshold: > 300   (ms)

5. Notify your team:
   @slack-alerts-codeburger
   @email:sre@seudominio.com

6. Message:
   🔴 **[CodeBurger] Latência P95 elevada**
   A latência P95 está em {{value}}ms (limite: 500ms).
   
   - Dashboard: https://app.datadoghq.com/dashboard/<ID>
   - Logs: https://app.datadoghq.com/logs?query=service%3Acode-burger-api
   
   {{#is_recovery}}✅ Latência normalizada: {{value}}ms{{/is_recovery}}
```

---

### Monitor 2 — Alerta de Taxa de Erro 5xx (> 5%)

**Tipo:** Composite Log Alert

```
1. Datadog → Monitors → New Monitor → Logs
2. Define the search query:
   service:code-burger-api @statusCode:(>=500)

3. Evaluate the:
   ☑ Count of logs
   Over: last 5 minutes
   Group by: @url

4. Alert threshold (usando anomaly detection ou threshold fixo):
   Se taxa relativa (5xx / total) > 5%:
   
   — Crie Monitor A (total de requests):
     Query: logs("service:code-burger-api").count()
   
   — Crie Monitor B (requests 5xx):
     Query: logs("service:code-burger-api @statusCode:(>=500)").count()
   
   — Crie Monitor Composite (B / A * 100 > 5):
     Formula: (b / a) * 100
     Alert: > 5

5. Message:
   🔴 **[CodeBurger] Taxa de erro 5xx elevada**
   {{value}}% das requisições estão retornando 5xx (limite: 5%).
   Endpoint mais afetado: {{@url.name}}
   
   Runbook: verifique conexão com Neon DB e logs de erro no Datadog.
   {{#is_recovery}}✅ Taxa de erro normalizada: {{value}}%{{/is_recovery}}
```

---

### Monitor 3 — Synthetics: Health Check Ativo

**Tipo:** Synthetics API Test (monitora endpoint `/api/health` a cada 60s)

```
1. Datadog → Synthetics → New Test → API Test
2. URL: https://<seu-projeto>.vercel.app/api/health
3. HTTP Method: GET
4. Assertions:
   ☑ Response status code: is 200
   ☑ Response time: is less than 800ms
   ☑ Response body: contains "ok"
5. Locations: Americas (N. Virginia), Europe (Frankfurt)
6. Frequency: Every 1 minute
7. Alert:
   Notify after 2 consecutive failures
   @slack-alerts-codeburger
```

---

## 5. Variáveis de Ambiente Necessárias

| Variável       | Onde configurar      | Valor                                      |
|----------------|----------------------|--------------------------------------------|
| `DD_API_KEY`   | Vercel Env Vars      | API Key gerada no passo 2.1                |
| `JWT_SECRET`   | Vercel Env Vars      | String aleatória longa (>= 32 chars)       |
| `DATABASE_URL` | Vercel Env Vars      | Connection string do Neon PostgreSQL       |
| `NODE_ENV`     | Local `.env`         | `development`                              |
| `VERCEL_ENV`   | Injetado pela Vercel | `production` \| `preview` \| `development`|

> **Nota:** `VERCEL_ENV` é injetada automaticamente pela Vercel em todas as funções.
> O campo `env` nos logs usa esta variável para segmentar dashboards por ambiente.
