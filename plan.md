# GoJar - Roadmap

## Descrição do Projeto
App de gestão financeira pessoal com tracking de entradas, saídas, metas e projeção de saldo.

## Features Planejadas

### 1. Stats (CRUD)
- CRUD de Entradas, Saídas e Metas (funções, interface responsiva)
- Página Stats parametrizada por JSONs (já iniciado)

### 2. Graphs (Análise Visual)
- Entrada de Saldo atual
- Manter todo o histórico
- Gráfico de linhas com:
  - Entradas, Saídas e Metas (linhas contínuas)
  - Saldos (dados discretos)
  - Provavelmente Chart.js
  - Checkboxes para show/hide cada stat
  - Resposta instantânea ao usuário
- Lógica de projeção:
  - Saldo projetado responde a entradas/saídas
  - Cai linearmente até próxima meta
  - Compara projetado vs real

### 3. Autenticação e Backend
- Autenticação por Google (página de login)
- Integração com Firebase

---

## Roadmap de Implementação (Próximos Passos)

### 🔵 Fase 1: CRUD Stats (Essencial)
1. Criar modal/form para adicionar Entradas/Saídas/Metas
2. Implementar função de adicionar (POST)
3. Implementar função de editar (PUT)
4. Implementar função de deletar (DELETE)
5. Persistir dados em localStorage temporariamente

### 🟢 Fase 2: Dados Dinâmicos
1. Atualizar data.json com dados reais
2. Implementar renderização dinâmica baseada em data.json
3. Testes de responsividade (varios tamanhos de tela)

### 🟡 Fase 3: Gráfico Básico
1. Instalar Chart.js
2. Criar seção graphs com gráfico de linhas
3. Popular com dados mock de Entradas/Saídas/Metas
4. Adicionar checkboxes para toggle de series

### 🟠 Fase 4: Lógica de Projeção
1. Algoritmo de projeção de saldo
2. Inserir "saldo real" (baseline)
3. Calcular e renderizar linha de projeção

### 🔴 Fase 5: Backend & Auth
1. Setup Firebase (Realtime DB ou Firestore)
2. Autenticação Google
3. Sincronizar dados com Firebase
4. Remover localStorage