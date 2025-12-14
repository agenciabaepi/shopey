# Guia de Configuração - Shopey

## 🚀 Início Rápido

### 1. Configurar Supabase

1. Acesse [Supabase](https://app.supabase.com) e crie um novo projeto
2. No painel do projeto, vá em **Settings** > **API**
3. Copie a **URL** e a **anon/public key**

### 2. Configurar Variáveis de Ambiente

1. Crie o arquivo `.env.local` na raiz do projeto:
```bash
cp env.example .env.local
```

2. Preencha as variáveis no arquivo `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-key-aqui
```

### 3. Executar Migrations no Supabase

1. No painel do Supabase, vá em **SQL Editor**
2. Abra o arquivo `supabase/migrations/001_initial_schema.sql`
3. Copie todo o conteúdo e execute no SQL Editor
4. Isso criará todas as tabelas e políticas de segurança necessárias

### 4. Configurar Storage (para upload de imagens)

1. No painel do Supabase, vá em **Storage**
2. Crie um bucket chamado `store-assets` com as seguintes configurações:
   - **Public bucket**: Sim
   - **File size limit**: 5MB (ou o valor desejado)
   - **Allowed MIME types**: image/*

3. Configure as políticas RLS do bucket:
   - Vá em **Storage** > **Policies** > **New Policy**
   - Crie uma política para permitir leitura pública:
     ```sql
     CREATE POLICY "Public Access"
     ON storage.objects FOR SELECT
     USING (bucket_id = 'store-assets');
     ```
   - Crie uma política para permitir upload aos donos:
     ```sql
     CREATE POLICY "Authenticated users can upload"
     ON storage.objects FOR INSERT
     WITH CHECK (
       bucket_id = 'store-assets' 
       AND auth.uid()::text = (storage.foldername(name))[1]
     );
     ```

### 5. Iniciar o Projeto

O servidor já está rodando! Acesse:
- **Frontend**: http://localhost:3000
- **Login**: http://localhost:3000/auth/login
- **Registro**: http://localhost:3000/auth/register

## 📋 Próximos Passos

1. ✅ Criar conta no sistema
2. ✅ Completar o onboarding
3. ✅ Adicionar produtos e categorias
4. ✅ Configurar banners
5. ✅ Personalizar cores e layout
6. ✅ Acessar sua loja pública em `/[slug-da-loja]`

## 🔧 Comandos Úteis

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Rodar produção
npm start
```

## 📝 Notas Importantes

- O sistema usa **Row Level Security (RLS)** do Supabase para segurança
- Todas as imagens são armazenadas no Supabase Storage
- Os pedidos são redirecionados para WhatsApp (não há pagamento interno)
- A loja pública é acessível via `/[slug]` (ex: `/minha-loja`)

## 🐛 Troubleshooting

### Erro de autenticação
- Verifique se as variáveis de ambiente estão corretas
- Confirme que as migrations foram executadas

### Erro ao fazer upload de imagens
- Verifique se o bucket `store-assets` foi criado
- Confirme que as políticas RLS estão configuradas

### Página 404 na loja pública
- Verifique se o slug da loja está correto
- Confirme que a loja foi criada no onboarding
