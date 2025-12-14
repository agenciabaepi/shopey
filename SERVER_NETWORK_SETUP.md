# 🌐 Configuração de IP de Rede no Servidor

## 📍 Descobrir o IP do Servidor

### Linux/macOS:
```bash
# Ver todos os IPs
ip addr show

# Ou mais simples:
hostname -I

# Ver apenas IPv4
ip -4 addr show | grep inet

# Ver IP específico de uma interface
ip addr show eth0  # Para ethernet
ip addr show wlan0 # Para WiFi
```

### Windows Server:
```powershell
# Ver todas as interfaces
ipconfig /all

# Ver apenas IPv4
ipconfig | findstr IPv4
```

### Usando ifconfig (Linux/macOS):
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

## 🚀 Configurar Next.js para Aceitar Conexões de Rede

### 1. Desenvolvimento no Servidor

```bash
# Iniciar em modo rede (aceita conexões externas)
npm run dev:network

# Ou manualmente:
next dev -H 0.0.0.0 -p 3000
```

### 2. Produção no Servidor

```bash
# Build do projeto
npm run build

# Iniciar em modo rede
npm run start:network

# Ou manualmente:
next start -H 0.0.0.0 -p 3000
```

### 3. Usando PM2 (Recomendado para Produção)

```bash
# Instalar PM2
npm install -g pm2

# Criar arquivo ecosystem.config.js
```

Crie o arquivo `ecosystem.config.js` na raiz do projeto:

```javascript
module.exports = {
  apps: [{
    name: 'shopey',
    script: 'node_modules/next/dist/bin/next',
    args: 'start -H 0.0.0.0 -p 3000',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOST: '0.0.0.0'
    }
  }]
}
```

Depois execute:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Para iniciar automaticamente no boot
```

## 🔧 Configuração com Variáveis de Ambiente

Você também pode configurar via variáveis de ambiente:

```bash
# Criar arquivo .env.local no servidor
HOSTNAME=0.0.0.0
PORT=3000
```

E modificar o `package.json`:

```json
{
  "scripts": {
    "start": "next start -H ${HOSTNAME:-0.0.0.0} -p ${PORT:-3000}"
  }
}
```

## 🌐 Configurar Firewall

### Ubuntu/Debian (UFW):
```bash
# Permitir porta 3000
sudo ufw allow 3000/tcp

# Verificar status
sudo ufw status
```

### CentOS/RHEL (firewalld):
```bash
# Permitir porta 3000
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

### iptables (Linux genérico):
```bash
# Permitir porta 3000
sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
sudo iptables-save
```

## 🔒 Usando Nginx como Proxy Reverso (Recomendado)

### 1. Instalar Nginx:
```bash
# Ubuntu/Debian
sudo apt update && sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx
```

### 2. Configurar Nginx:

Crie o arquivo `/etc/nginx/sites-available/shopey`:

```nginx
server {
    listen 80;
    server_name seu-dominio.com ou IP-do-servidor;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Ativar configuração:
```bash
# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/shopey /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### 4. Configurar SSL (Opcional, mas recomendado):
```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado SSL
sudo certbot --nginx -d seu-dominio.com
```

## 📱 Acessar do Servidor

Após configurar, você pode acessar:

- **Localmente no servidor:** `http://localhost:3000`
- **Da rede local:** `http://IP-DO-SERVIDOR:3000`
- **Com Nginx:** `http://IP-DO-SERVIDOR` ou `http://seu-dominio.com`

## ⚠️ Configurações Importantes

### 1. Supabase Redirect URLs

Se estiver usando autenticação, adicione as URLs do servidor no Supabase:

1. Acesse: https://app.supabase.com
2. Vá em **Authentication** > **URL Configuration**
3. Adicione nas **Redirect URLs**:
   - `http://IP-DO-SERVIDOR:3000/**`
   - `http://seu-dominio.com/**`
   - `https://seu-dominio.com/**` (se usar SSL)

### 2. Variáveis de Ambiente no Servidor

Certifique-se de que as variáveis estão configuradas:

```bash
# Criar arquivo .env.local no servidor
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-key
```

### 3. Porta Personalizada

Se quiser usar outra porta (ex: 8080):

```bash
# Desenvolvimento
next dev -H 0.0.0.0 -p 8080

# Produção
next start -H 0.0.0.0 -p 8080
```

## 🔍 Verificar se está Funcionando

### No servidor:
```bash
# Verificar se a porta está aberta
netstat -tulpn | grep 3000

# Ou com ss
ss -tulpn | grep 3000

# Testar localmente
curl http://localhost:3000
```

### De outro dispositivo na mesma rede:
```bash
# Testar conectividade
ping IP-DO-SERVIDOR

# Testar HTTP
curl http://IP-DO-SERVIDOR:3000
```

## 📝 Exemplo Completo - Servidor Ubuntu

```bash
# 1. Descobrir IP
hostname -I

# 2. Configurar firewall
sudo ufw allow 3000/tcp

# 3. Build e start
npm run build
npm run start:network

# 4. Acessar de outro dispositivo
# http://192.168.1.100:3000
```

## 🐳 Docker (Opcional)

Se estiver usando Docker:

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start", "--", "-H", "0.0.0.0"]
```

```bash
# Build e run
docker build -t shopey .
docker run -p 3000:3000 --env-file .env.local shopey
```
