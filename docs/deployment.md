# CHAPTERS AI Hub Admin Panel - Azure Deployment Guide

## Architecture

```
Internet
  │
  ▼
App Gateway (appgw-hub-aihub-prod) — WAF_v2, Germany West Central
  │
  ├─ ai.chaptersgroup.com       → ca-chgaihub-prod          (Open WebUI)
  ├─ ai.software24.com          → ca-software24aihub-prod   (Open WebUI)
  └─ admin.chaptersgroup.com    → ca-chgadmin-prod           (This app)
                                      │
                                      └─ FastAPI + React SPA (single container)
                                         Port 8000, internal ingress only
```

All Container Apps run in `cae-chgaihub-prod` (internal load balancer, no public access).
The App Gateway is the only entry point from the internet, protected by WAF.

## Infrastructure

| Resource | Name | Details |
|----------|------|---------|
| VNet | `vnet-hub-aihub-prod` | `10.0.0.0/16` |
| App Gateway Subnet | `snet-appgw` | `10.0.0.0/24` |
| Container Apps Subnet | `snet-container-apps` | `10.0.2.0/23` |
| Container Apps Env | `cae-chgaihub-prod` | Internal LB |
| Container App | `ca-chgadmin-prod` | 1 CPU / 2 GB, port 8000 |
| ACR | `aihubprodacr.azurecr.io` | Image: `chapters-admin` |
| PostgreSQL | `psql-chgaihub-prod` | Database: `chapters_admin` |
| Key Vault | `kv-hub-aihub-prod` | SSL certs |
| Certbot VM | `vm-certbot-aihub-prod` | Auto-renews certs every 12h |

## CI/CD Pipeline (GitHub Actions)

**Repo**: `Chapters-Group/ai-hub-admin`

### What happens on every push to `main`:

1. Build Docker image (multi-stage: Node builds frontend, Python serves everything)
2. Push to ACR with commit SHA tag + `latest`
3. Update Container App to use new image

### Authentication: Azure OIDC (federated credentials)

No client secrets to manage or rotate. GitHub Actions gets a short-lived token.

**GitHub Secrets (3)**:

| Secret | Value |
|--------|-------|
| `AZURE_CLIENT_ID` | Service principal app ID |
| `AZURE_TENANT_ID` | `0497a289-ce05-46b2-9d69-6aee3a4d4ce9` |
| `AZURE_SUBSCRIPTION_ID` | `70a307ab-ade5-4abf-b100-545e2cc806d5` |

## Container App Environment Variables

| Variable | Secret? | Description |
|----------|---------|-------------|
| `DATABASE_URL` | Yes | `postgresql+asyncpg://user:pass@psql-chgaihub-prod.postgres.database.azure.com:5432/chapters_admin?ssl=require` |
| `SECRET_KEY` | Yes | Random 64-char string for JWT signing |
| `ENCRYPTION_KEY` | Yes | Fernet key for encrypting stored API keys |
| `ADMIN_EMAIL` | No | Initial admin user email |
| `ADMIN_PASSWORD` | Yes | Initial admin user password (only used at first seed) |
| `CORS_ORIGINS` | No | `https://admin.chaptersgroup.com` |
| `HEALTH_CHECK_INTERVAL` | No | `60` (seconds) |

## Container Startup Sequence

The entrypoint script (`backend/entrypoint.sh`) runs on every container start:

1. `alembic upgrade head` — run database migrations (idempotent, no-op if current)
2. `python -m app.seed` — create admin user if not exists (idempotent)
3. `uvicorn app.main:app` — start the server with 2 workers + proxy headers

## SSL Certificates

Managed by the existing certbot VM. Fully automated:

1. Certbot renews certs every 12 hours via cron
2. Deploy hook converts to PFX and uploads to Key Vault (`kv-hub-aihub-prod`)
3. App Gateway reads certs from Key Vault automatically

**Currently managed domains**: `ai.chaptersgroup.com`, `ai.software24.com`, `chat.chaptersgroup.com`

To add `admin.chaptersgroup.com`, issue the cert once on the certbot VM:
```bash
sudo certbot certonly --webroot -w /var/www/certbot -d admin.chaptersgroup.com
```
After that, renewal is automatic.

## One-Time Setup Steps

Run these commands once before the first deployment.

### 1. DNS Record

Create a CNAME or A record:
```
admin.chaptersgroup.com → App Gateway public IP (pip-appgw-aihub-prod)
```

### 2. Database

From a machine inside the VNet (e.g., certbot VM):
```bash
PGHOST=psql-chgaihub-prod.postgres.database.azure.com
psql "host=$PGHOST user=<admin_user> dbname=postgres sslmode=require" <<EOF
CREATE DATABASE chapters_admin;
CREATE ROLE chapters_admin_user WITH LOGIN PASSWORD '<strong_password>';
GRANT ALL PRIVILEGES ON DATABASE chapters_admin TO chapters_admin_user;
\c chapters_admin
GRANT ALL ON SCHEMA public TO chapters_admin_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO chapters_admin_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO chapters_admin_user;
EOF
```

### 3. SSL Certificate

```bash
# On the certbot VM
sudo certbot certonly --webroot -w /var/www/certbot -d admin.chaptersgroup.com
# Deploy hook auto-uploads to Key Vault as "admin-chaptersgroup-com"
```

### 4. OIDC Service Principal (for GitHub Actions)

```bash
# Create app registration
az ad app create --display-name "github-chapters-admin-deploy"
APP_ID="<appId from output>"
az ad sp create --id $APP_ID
SP_OBJECT_ID=$(az ad sp show --id $APP_ID --query id -o tsv)

# Assign roles
ACR_ID=$(az acr show --name aihubprodacr --query id -o tsv)
RG_ID=$(az group show --name CHAPTERS-AI-Hub --query id -o tsv)

az role assignment create --assignee-object-id $SP_OBJECT_ID \
  --assignee-principal-type ServicePrincipal --role "AcrPush" --scope $ACR_ID

az role assignment create --assignee-object-id $SP_OBJECT_ID \
  --assignee-principal-type ServicePrincipal --role "Contributor" --scope $RG_ID

# Federated credential for GitHub Actions
az ad app federated-credential create --id $APP_ID --parameters '{
  "name": "github-main-branch",
  "issuer": "https://token.actions.githubusercontent.com",
  "subject": "repo:Chapters-Group/ai-hub-admin:ref:refs/heads/main",
  "audiences": ["api://AzureADTokenExchange"]
}'
```

Then add to GitHub repo secrets: `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`

### 5. Container App

```bash
az containerapp create \
  --name ca-chgadmin-prod \
  --resource-group CHAPTERS-AI-Hub \
  --environment cae-chgaihub-prod \
  --image aihubprodacr.azurecr.io/chapters-admin:latest \
  --registry-server aihubprodacr.azurecr.io \
  --target-port 8000 \
  --ingress internal \
  --cpu 1.0 --memory 2Gi \
  --min-replicas 1 --max-replicas 2 \
  --env-vars \
    ADMIN_EMAIL=admin@chaptersgroup.com \
    CORS_ORIGINS=https://admin.chaptersgroup.com \
    HEALTH_CHECK_INTERVAL=60 \
    DATABASE_URL=secretref:database-url \
    SECRET_KEY=secretref:secret-key \
    ENCRYPTION_KEY=secretref:encryption-key \
    ADMIN_PASSWORD=secretref:admin-password \
  --secrets \
    database-url="<DATABASE_URL>" \
    secret-key="<RANDOM_64_CHARS>" \
    encryption-key="<FERNET_KEY>" \
    admin-password="<STRONG_PASSWORD>"
```

### 6. App Gateway Rules

```bash
RG="CHAPTERS-AI-Hub"
APPGW="appgw-hub-aihub-prod"
ADMIN_FQDN="ca-chgadmin-prod.ashymoss-3dcdfabf.germanywestcentral.azurecontainerapps.io"

# SSL certificate from Key Vault
az network application-gateway ssl-cert create \
  --gateway-name $APPGW --resource-group $RG \
  --name admin-chaptersgroup-com \
  --key-vault-secret-id "https://kv-hub-aihub-prod.vault.azure.net/secrets/admin-chaptersgroup-com"

# Backend pool
az network application-gateway address-pool create \
  --gateway-name $APPGW --resource-group $RG \
  --name bp-admin-chaptersgroup-com \
  --servers $ADMIN_FQDN

# Health probe
az network application-gateway probe create \
  --gateway-name $APPGW --resource-group $RG \
  --name probe-admin-chaptersgroup-com \
  --protocol Https --host $ADMIN_FQDN \
  --path /health --interval 30 --timeout 30 \
  --unhealthy-threshold 3 --match-status-codes "200-399" \
  --host-name-from-http-settings false

# Backend HTTP settings
az network application-gateway http-settings create \
  --gateway-name $APPGW --resource-group $RG \
  --name settings-admin-chaptersgroup-com \
  --port 443 --protocol Https \
  --host-name $ADMIN_FQDN \
  --cookie-based-affinity Disabled \
  --timeout 60 --probe probe-admin-chaptersgroup-com

# HTTPS listener
az network application-gateway http-listener create \
  --gateway-name $APPGW --resource-group $RG \
  --name listener-admin-chaptersgroup-com \
  --frontend-port port-443 \
  --frontend-ip appGwPublicFrontend \
  --ssl-cert admin-chaptersgroup-com \
  --host-name admin.chaptersgroup.com

# Rewrite rule set (fix Location header from Container Apps FQDN)
az network application-gateway rewrite-rule set create \
  --gateway-name $APPGW --resource-group $RG \
  --name rewrite-admin-chaptersgroup-com

az network application-gateway rewrite-rule create \
  --gateway-name $APPGW --resource-group $RG \
  --rule-set-name rewrite-admin-chaptersgroup-com \
  --name fix-host-admin-chaptersgroup-com \
  --sequence 100 \
  --response-headers "Location={http_resp_Location_1}admin.chaptersgroup.com{http_resp_Location_2}" \
  --conditions "http_resp_Location~(https?://)ca-chgadmin-prod\\.ashymoss-3dcdfabf\\.germanywestcentral\\.azurecontainerapps\\.io(.*)"

# Routing rule (priority 400)
az network application-gateway rule create \
  --gateway-name $APPGW --resource-group $RG \
  --name rule-admin-chaptersgroup-com \
  --priority 400 \
  --http-listener listener-admin-chaptersgroup-com \
  --address-pool bp-admin-chaptersgroup-com \
  --http-settings settings-admin-chaptersgroup-com \
  --rewrite-rule-set rewrite-admin-chaptersgroup-com \
  --rule-type Basic
```

## Future: Entra ID SSO

After initial deployment is working, restrict access to 2-3 users via Entra ID:

1. Register an Entra App with redirect URI `https://admin.chaptersgroup.com/api/auth/callback`
2. Set "Assignment required" = Yes in Enterprise Applications
3. Assign only the authorized users
4. Add OIDC login to the FastAPI backend (separate implementation)
