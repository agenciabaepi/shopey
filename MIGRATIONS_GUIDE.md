# Guia de Execução das Migrations - Shopey

## ⚠️ IMPORTANTE: Execute na ordem correta!

Você precisa executar as migrations na ordem abaixo. A migration 002 depende da 001.

---

## 📋 Passo 1: Migration Inicial (001)

**Arquivo:** `supabase/migrations/001_initial_schema.sql`

**O que faz:**
- Cria todas as tabelas base do sistema
- Configura Row Level Security (RLS)
- Cria índices e triggers básicos

**Como executar:**
1. Acesse o Supabase: https://app.supabase.com
2. Selecione seu projeto
3. Vá em **SQL Editor** (menu lateral)
4. Clique em **New Query**
5. Abra o arquivo `supabase/migrations/001_initial_schema.sql`
6. Copie TODO o conteúdo
7. Cole no SQL Editor
8. Clique em **Run** (ou pressione Cmd/Ctrl + Enter)

**Tempo estimado:** 2-3 minutos

---

## 📋 Passo 2: Migration de Planos e Onboarding (002)

**Arquivo:** `supabase/migrations/002_add_plans_and_onboarding.sql`

**O que faz:**
- Adiciona campos de plano e onboarding na tabela `stores`
- Cria tabela `plans` (free, pro, enterprise)
- Cria tabela `templates`
- Cria função e trigger para validar limite de produtos

**Como executar:**
1. No mesmo SQL Editor do Supabase
2. Clique em **New Query** (ou limpe o editor)
3. Abra o arquivo `supabase/migrations/002_add_plans_and_onboarding.sql`
4. Copie TODO o conteúdo
5. Cole no SQL Editor
6. Clique em **Run**

**Tempo estimado:** 1-2 minutos

---

## ✅ Verificação

Após executar ambas as migrations, verifique se tudo está correto:

```sql
-- Verificar se as tabelas foram criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verificar se os planos foram criados
SELECT * FROM plans;

-- Verificar se o template padrão foi criado
SELECT * FROM templates;
```

Você deve ver:
- ✅ Tabelas: stores, products, categories, banners, visits, whatsapp_clicks, store_settings, plans, templates
- ✅ 3 planos na tabela plans (free, pro, enterprise)
- ✅ 1 template na tabela templates (default)

---

## 🐛 Resolução de Problemas

### Erro: "relation 'stores' does not exist"
**Causa:** Você tentou executar a migration 002 antes da 001.

**Solução:** Execute primeiro a migration 001 completa.

### Erro: "duplicate key value violates unique constraint"
**Causa:** Você já executou parte da migration antes.

**Solução:** Isso é normal se você já executou antes. Pode ignorar ou usar `ON CONFLICT DO NOTHING` nas queries.

### Erro: "permission denied"
**Causa:** Você não tem permissões suficientes.

**Solução:** Certifique-se de estar usando a conta de administrador do projeto Supabase.

---

## 📝 Resumo Rápido

1. ✅ Execute `001_initial_schema.sql` primeiro
2. ✅ Depois execute `002_add_plans_and_onboarding.sql`
3. ✅ Verifique se tudo foi criado corretamente

---

## 🎯 Próximos Passos

Após executar as migrations:
1. Configure o Storage (veja SETUP.md)
2. Teste o cadastro de usuário
3. Complete o onboarding
4. Crie seu primeiro produto
