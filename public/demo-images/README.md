# Imagens Padrão - Demo

Esta pasta contém as imagens padrão usadas para demonstração no editor de temas.

## 📁 Estrutura

```
public/demo-images/
├── products/     # Imagens de produtos de exemplo (8 imagens)
│   ├── produto-1.jpg
│   ├── produto-2.jpg
│   ├── produto-3.jpg
│   ├── produto-4.jpg
│   ├── produto-5.jpg
│   ├── produto-6.jpg
│   ├── produto-7.jpg
│   └── produto-8.jpg
├── banners/      # Imagens de banners de exemplo
│   └── banner-1.jpg
└── categories/    # Imagens de categorias de exemplo (opcional)
```

## 📝 Como adicionar imagens

### Produtos (8 imagens necessárias)

1. Coloque as imagens em `products/`
2. Nomeie como: `produto-1.jpg`, `produto-2.jpg`, até `produto-8.jpg`
3. **Especificações recomendadas:**
   - Tamanho: 400x400px ou maior (quadrado)
   - Formatos: JPG, PNG, WebP
   - Peso: Máximo 500KB por imagem (otimizado para web)

### Banners

1. Coloque as imagens em `banners/`
2. Nomeie como: `banner-1.jpg`, `banner-2.jpg`, etc.
3. **Especificações recomendadas:**
   - Tamanho: 1200x400px ou maior (landscape/panorâmico)
   - Formatos: JPG, PNG, WebP
   - Peso: Máximo 1MB por imagem

### Categorias (opcional)

1. Coloque as imagens em `categories/`
2. Nomeie como: `categoria-1.jpg`, `categoria-2.jpg`, etc.
3. **Especificações recomendadas:**
   - Tamanho: 400x400px ou maior (quadrado)
   - Formatos: JPG, PNG, WebP

## 💻 Uso no código

As imagens são referenciadas no arquivo `lib/demo-data.ts` usando caminhos relativos a partir de `/public`:

```typescript
// Produto
image_url: '/demo-images/products/produto-1.jpg'

// Banner
image_url: '/demo-images/banners/banner-1.jpg'

// Categoria
image_url: '/demo-images/categories/categoria-1.jpg'
```

## ✅ Checklist

- [ ] Adicionar 8 imagens de produtos (`produto-1.jpg` até `produto-8.jpg`)
- [ ] Adicionar pelo menos 1 imagem de banner (`banner-1.jpg`)
- [ ] Otimizar imagens para web (compressão)
- [ ] Verificar se os nomes dos arquivos correspondem aos caminhos em `lib/demo-data.ts`

## 🔧 Ferramentas recomendadas

- **Compressão de imagens**: TinyPNG, Squoosh, ImageOptim
- **Redimensionamento**: Photoshop, GIMP, ou ferramentas online
- **Conversão de formato**: Use JPG para fotos, PNG para transparência, WebP para melhor compressão

## 📌 Notas importantes

- As imagens devem estar na pasta `public/` para serem acessíveis via URL
- Use caminhos absolutos começando com `/` (ex: `/demo-images/...`)
- Mantenha os nomes dos arquivos consistentes com o código em `lib/demo-data.ts`
- Imagens muito grandes podem afetar o desempenho do preview


