# Configuração de Autenticação no Supabase

## ⚠️ IMPORTANTE: Configurar Supabase Auth

Para que o cadastro e login funcionem corretamente, você precisa configurar o Supabase Auth:

### 1. Desabilitar Confirmação de Email (para desenvolvimento)

1. Acesse: https://app.supabase.com
2. Selecione seu projeto
3. Vá em **Authentication** > **Settings**
4. Em **Email Auth**, desative:
   - ✅ **Enable email confirmations** (desmarque para desenvolvimento)
   - ✅ **Secure email change** (opcional, desmarque para desenvolvimento)

### 2. Configurar Redirect URLs

1. Em **Authentication** > **URL Configuration**
2. Adicione nas **Redirect URLs**:
   - `http://localhost:3000/**`
   - `http://localhost:3000/onboarding`
   - `http://localhost:3000/dashboard`

### 3. Verificar Site URL

1. Em **Authentication** > **URL Configuration**
2. **Site URL** deve estar como: `http://localhost:3000`

### 4. Para Produção

Quando for para produção, você pode:
- Reativar confirmação de email
- Adicionar URLs de produção nas Redirect URLs
- Configurar templates de email personalizados

## 🔧 Problemas Comuns

### "Email not confirmed"
**Solução:** Desative "Enable email confirmations" nas configurações do Supabase Auth

### Erro 406 nas queries
**Solução:** Execute a migration `003_fix_rls_policies.sql`

### Usuário não consegue fazer login após cadastro
**Solução:** 
1. Verifique se a confirmação de email está desativada
2. Verifique se as Redirect URLs estão configuradas
3. Limpe os cookies do navegador e tente novamente
