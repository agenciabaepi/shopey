# Configuração de Fontes - Shopey

## Fontes Utilizadas

O sistema utiliza duas fontes principais:

1. **Inter** - Fonte principal (Google Fonts - gratuita)
2. **Avenir Next** - Fonte para títulos e destaques (proprietária - requer licença)

## Configuração Atual

- **Inter** está configurada e funcionando automaticamente via Google Fonts
- **Avenir Next** está configurada como opcional

## Como Adicionar Avenir Next

Se você possui licença para Avenir Next:

1. Crie a pasta `public/fonts/`
2. Adicione os arquivos .woff2:
   - `AvenirNext-Regular.woff2` (weight: 400)
   - `AvenirNext-Medium.woff2` (weight: 500)
   - `AvenirNext-DemiBold.woff2` (weight: 600)
   - `AvenirNext-Bold.woff2` (weight: 700)

3. O sistema detectará automaticamente e usará Avenir Next
4. Se os arquivos não estiverem disponíveis, o sistema usará Inter como fallback

## Uso no Código

### Inter (fonte padrão)
```tsx
// Já aplicada globalmente no body
<div>Texto em Inter</div>
```

### Avenir Next (para títulos)
```tsx
<h1 className="font-avenir">Título em Avenir Next</h1>
```

## Classes Tailwind Disponíveis

- `font-inter` - Fonte Inter
- `font-avenir` - Fonte Avenir Next

## Nota Legal

Avenir Next é uma fonte proprietária da Monotype. Certifique-se de ter a licença adequada antes de usar em produção.
