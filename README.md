# Shopey

Plataforma para criação de lojas virtuais e cardápios digitais.

## 🚀 Tecnologias

- Next.js 14 (App Router)
- TypeScript
- Supabase (Database + Auth + Storage)
- TailwindCSS
- Vercel (Deploy)

## ⚡ Início Rápido

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar Supabase

**IMPORTANTE**: Antes de continuar, você precisa:

1. Criar um projeto no [Supabase](https://app.supabase.com)
2. Obter a URL e a chave anon do projeto (Settings > API)
3. Criar o arquivo `.env.local`:
```bash
cp env.example .env.local
```

4. Preencher as variáveis no `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-aqui
```

5. Executar as migrations:
   - Abra o SQL Editor no Supabase
   - Execute o conteúdo de `supabase/migrations/001_initial_schema.sql`

6. Configurar Storage (veja `SETUP.md` para detalhes)

### 3. Executar o projeto
```bash
npm run dev
```

Acesse: http://localhost:3000

## 📚 Documentação Completa

Veja o arquivo [SETUP.md](./SETUP.md) para instruções detalhadas de configuração.

## 🎯 Funcionalidades

- ✅ Autenticação com Supabase
- ✅ Onboarding para criação de loja
- ✅ Dashboard administrativo
- ✅ CRUD de produtos e categorias
- ✅ Sistema de banners
- ✅ Página pública da loja
- ✅ Carrinho de compras
- ✅ Redirecionamento para WhatsApp
- ✅ Personalização de cores e layout
