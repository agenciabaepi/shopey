# 🌐 Acessar o Sistema em Rede Local

## 📍 Descobrir seu IP Local

### macOS/Linux:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1
```

### Windows:
```bash
ipconfig | findstr IPv4
```

### Alternativa (todas as plataformas):
```bash
hostname -I
```

## 🚀 Iniciar Servidor em Modo Rede

### Desenvolvimento:
```bash
npm run dev:network
```

### Produção (após build):
```bash
npm run build
npm run start:network
```

## 📱 Acessar de Outros Dispositivos

1. **Certifique-se de que o servidor está rodando em modo rede:**
   ```bash
   npm run dev:network
   ```

2. **Anote seu IP local** (exemplo: `192.168.15.4`)

3. **Acesse de qualquer dispositivo na mesma rede:**
   - No navegador: `http://192.168.15.4:3000`
   - No celular: `http://192.168.15.4:3000`
   - No tablet: `http://192.168.15.4:3000`

## ⚠️ Importante

### Firewall
Se não conseguir acessar, verifique o firewall:

**macOS:**
- Sistema > Configurações > Rede > Firewall
- Permita conexões para Node.js/Next.js

**Windows:**
- Configurações > Firewall do Windows
- Permita Node.js através do firewall

### Supabase Auth
Se estiver usando autenticação do Supabase, adicione seu IP nas **Redirect URLs**:

1. Acesse: https://app.supabase.com
2. Vá em **Authentication** > **URL Configuration**
3. Adicione nas **Redirect URLs**:
   - `http://192.168.15.4:3000/**`
   - `http://192.168.15.4:3000/onboarding`
   - `http://192.168.15.4:3000/dashboard`

## 🔍 Verificar se está funcionando

Após iniciar com `npm run dev:network`, você verá algo como:

```
▲ Next.js 14.1.0
- Local:        http://localhost:3000
- Network:      http://192.168.15.4:3000
```

Use o endereço **Network** para acessar de outros dispositivos!

## 📝 Exemplo Completo

```bash
# 1. Descobrir IP
ifconfig | grep "inet " | grep -v 127.0.0.1

# 2. Iniciar servidor em modo rede
npm run dev:network

# 3. Acessar de outro dispositivo
# http://192.168.15.4:3000
```

