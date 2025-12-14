# Executar Migrations no Supabase

## Passo a Passo

1. Acesse o painel do Supabase: https://app.supabase.com
2. Selecione seu projeto: `nscaprjqzpwifoireppt`
3. No menu lateral, clique em **SQL Editor**
4. Clique em **New Query**
5. Execute as migrations na ordem:
   - `001_initial_schema.sql` - Tabelas e políticas básicas
   - `002_add_plans_and_onboarding.sql` - Planos e onboarding
   - `003_create_storage_bucket.sql` - Bucket para upload de imagens
6. Para cada migration:
   - Abra o arquivo e copie TODO o conteúdo
   - Cole no SQL Editor do Supabase
   - Clique em **Run** (ou pressione Cmd/Ctrl + Enter)

## O que cada migration cria:

### 001_initial_schema.sql
- ✅ Tabela `stores` - Informações das lojas
- ✅ Tabela `store_settings` - Configurações de cada loja
- ✅ Tabela `categories` - Categorias de produtos
- ✅ Tabela `products` - Produtos das lojas
- ✅ Tabela `banners` - Banners das lojas
- ✅ Tabela `visits` - Analytics de visitas
- ✅ Tabela `whatsapp_clicks` - Analytics de cliques no WhatsApp
- ✅ Políticas RLS (Row Level Security) para segurança
- ✅ Índices para performance
- ✅ Triggers para atualização automática de timestamps

### 002_add_plans_and_onboarding.sql
- ✅ Campos de plano e onboarding na tabela `stores`
- ✅ Tabela `plans` - Planos disponíveis (free, pro, enterprise)
- ✅ Tabela `templates` - Templates de layout
- ✅ Função e trigger para verificar limite de produtos

### 003_create_storage_bucket.sql
- ✅ Bucket `store-assets` no Supabase Storage
- ✅ Políticas RLS para leitura pública e upload por usuários autenticados
- ✅ Organização de arquivos por usuário: `{user_id}/{folder}/{filename}`

## Importante

⚠️ Execute TODAS as migrations na ordem ANTES de usar o sistema pela primeira vez!

Após executar, você poderá:
- Criar uma conta
- Fazer login
- Criar sua loja no onboarding
- Fazer upload de logos e banners
- Começar a usar o sistema
