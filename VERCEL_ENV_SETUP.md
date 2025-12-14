# Configuração de Variáveis de Ambiente na Vercel

## 📋 Variáveis Necessárias para Supabase

Para o projeto funcionar na Vercel, você precisa configurar as seguintes variáveis de ambiente:

### 1. **NEXT_PUBLIC_SUPABASE_URL**
- **O que é:** URL do seu projeto Supabase
- **Onde encontrar:** 
  1. Acesse https://app.supabase.com
  2. Selecione seu projeto
  3. Vá em **Settings** > **API**
  4. Copie a **Project URL**
- **Formato:** `https://seu-projeto-id.supabase.co`
- **Exemplo:** `https://abcdefghijklmnop.supabase.co`

### 2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
- **O que é:** Chave pública (anon key) do Supabase
- **Onde encontrar:**
  1. No mesmo lugar: **Settings** > **API**
  2. Copie a **anon/public** key (não a service_role key!)
- **Formato:** Uma string longa começando com `eyJ...`
- **Exemplo:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 🚀 Como Configurar na Vercel

### Passo a Passo:

1. **Acesse o Dashboard da Vercel:**
   - Vá para https://vercel.com
   - Faça login na sua conta

2. **Selecione seu projeto:**
   - Clique no projeto Shopey

3. **Acesse as configurações:**
   - Vá em **Settings** (Configurações)
   - Clique em **Environment Variables** (Variáveis de Ambiente)

4. **Adicione as variáveis:**
   - Clique em **Add New** (Adicionar Nova)
   - Para cada variável:
     - **Key:** `NEXT_PUBLIC_SUPABASE_URL`
     - **Value:** Cole a URL do seu projeto Supabase
     - **Environment:** Selecione todas as opções (Production, Preview, Development)
     - Clique em **Save**
   
   - Repita para a segunda variável:
     - **Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - **Value:** Cole a anon key do Supabase
     - **Environment:** Selecione todas as opções
     - Clique em **Save**

5. **Redeploy (se necessário):**
   - Após adicionar as variáveis, a Vercel pode fazer redeploy automaticamente
   - Se não, vá em **Deployments** e clique em **Redeploy**

## ⚠️ Importante

- ✅ Use a **anon/public key**, nunca a **service_role key** (que é secreta)
- ✅ Configure para todos os ambientes (Production, Preview, Development)
- ✅ Após adicionar as variáveis, faça um novo deploy para que tenham efeito
- ✅ As variáveis que começam com `NEXT_PUBLIC_` são expostas ao cliente (browser)

## 🔒 Segurança

- A `NEXT_PUBLIC_SUPABASE_ANON_KEY` é segura para ser pública
- Ela é limitada pelas políticas RLS (Row Level Security) do Supabase
- Nunca compartilhe a `service_role` key publicamente

## ✅ Verificação

Após configurar, verifique se está funcionando:
1. Acesse sua aplicação na Vercel
2. Tente fazer login
3. Verifique se consegue acessar o dashboard

Se houver erros, verifique:
- Se as variáveis foram salvas corretamente
- Se os valores estão corretos (sem espaços extras)
- Se fez redeploy após adicionar as variáveis
