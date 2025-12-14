# Configuração do Sistema Admin

## 📋 Passo a Passo

### 1. Executar a Migration

Execute a migration `008_create_admin_system.sql` no Supabase SQL Editor.

### 2. Criar o Primeiro Admin

#### Opção A: Usando um usuário existente

1. No Supabase, vá em **Authentication** > **Users**
2. Encontre o usuário que será admin (ou crie um novo)
3. Copie o **User ID** (UUID)
4. No SQL Editor, execute:

```sql
INSERT INTO admins (user_id, email, is_active)
VALUES ('USER_ID_AQUI', 'seu-email@exemplo.com', true);
```

**Exemplo:**
```sql
INSERT INTO admins (user_id, email, is_active)
VALUES ('123e4567-e89b-12d3-a456-426614174000', 'admin@shopey.com', true);
```

#### Opção B: Criar novo usuário e torná-lo admin

1. Crie uma conta normal no sistema (`/auth/register`)
2. No Supabase, vá em **Authentication** > **Users**
3. Encontre o usuário recém-criado
4. Copie o **User ID**
5. Execute o SQL acima com o User ID

### 3. Acessar o Painel Admin

1. Acesse: `http://localhost:3000/admin/login`
2. Faça login com as credenciais do usuário admin
3. Você será redirecionado para `/admin`

## 🔒 Segurança

- Apenas usuários na tabela `admins` com `is_active = true` podem acessar `/admin`
- O middleware verifica autenticação antes de permitir acesso
- As políticas RLS garantem que apenas admins possam gerenciar outros admins

## 📝 Adicionar Mais Admins

Depois de ter o primeiro admin, você pode adicionar mais admins através do painel ou diretamente no banco:

```sql
-- Encontrar user_id pelo email
SELECT id, email FROM auth.users WHERE email = 'novo-admin@exemplo.com';

-- Adicionar como admin (substitua USER_ID)
INSERT INTO admins (user_id, email, is_active)
VALUES ('USER_ID', 'novo-admin@exemplo.com', true);
```

## 🚨 Desativar Admin

Para desativar um admin sem deletar:

```sql
UPDATE admins 
SET is_active = false 
WHERE email = 'admin@exemplo.com';
```

## 📊 Funcionalidades do Painel Admin

- **Dashboard**: Estatísticas gerais do sistema
- **Lojas**: Visualizar e gerenciar todas as lojas
- **Usuários**: Visualizar usuários do sistema
- **Configurações**: Configurações gerais do sistema

## 🔍 Verificar se um usuário é admin

```sql
SELECT * FROM admins WHERE email = 'email@exemplo.com';
```


