# IT Admin Setup Guide — AI Hub Admin Panel

## What We Need and Why

We're deploying an internal admin panel at `admin.chaptersgroup.com` for managing the AI Hub. It runs behind the existing App Gateway (`appgw-hub-aihub-prod`), same as `ai.chaptersgroup.com`.

We need the IT administrator to configure two things:

1. **DNS Record** — point `admin.chaptersgroup.com` to the App Gateway
2. **Entra ID App Registration** — so our GitHub Actions CI/CD pipeline can deploy to Azure securely (no passwords)

A future third item (Entra ID SSO for restricting app access to 2-3 users) will be done after the initial deployment is working.

---

## 1. DNS Configuration

### What is needed?

A DNS record to route `admin.chaptersgroup.com` to our existing App Gateway.

| Record Type | Name | Value |
|-------------|------|-------|
| **A** | `admin.chaptersgroup.com` | `20.218.245.34` |

Or alternatively:

| Record Type | Name | Value |
|-------------|------|-------|
| **CNAME** | `admin` | Point to the App Gateway's public IP FQDN |

### Why?

The admin panel is deployed as an Azure Container App with **no public IP** — it's only accessible inside our virtual network. The App Gateway (`appgw-hub-aihub-prod`) is the single entry point that handles:

- TLS termination (HTTPS)
- WAF protection
- Routing to the correct backend based on hostname

This is exactly how `ai.chaptersgroup.com` and `ai.software24.com` already work. The DNS record tells browsers to send traffic for `admin.chaptersgroup.com` to the same App Gateway, which then routes it to the admin panel's Container App internally.

### What is `20.218.245.34`?

This is the public IP of the existing App Gateway (`pip-appgw-aihub-prod`). It's the same IP that `ai.chaptersgroup.com` already points to. Adding `admin.chaptersgroup.com` to this IP does not affect existing services — the App Gateway uses SNI (Server Name Indication) to route each hostname to its own backend.

### Does this expose the admin panel to the internet?

The DNS record makes the hostname resolvable, but the admin panel is still protected by:

1. **WAF** — blocks malicious traffic at the App Gateway
2. **Application authentication** — requires login with admin credentials
3. **Entra ID SSO** (planned) — will restrict access to 2-3 named users only
4. **No direct access** — the Container App itself has no public IP; it's only reachable through the App Gateway

### SSL Certificate

After the DNS record is live, we will issue an SSL certificate for `admin.chaptersgroup.com` using the existing certbot VM (`vm-certbot-aihub-prod`). This is the same process used for all other domains. The certificate auto-renews every 90 days.

**Note**: The DNS record must be active before we can issue the certificate, because Let's Encrypt needs to reach the domain to verify ownership.

---

## 2. Entra ID App Registration (GitHub Actions OIDC)

### What is this?

When we push code to GitHub, a GitHub Actions pipeline automatically builds the app and deploys it to our Azure Container App. For this to work, GitHub needs permission to:

- **Push Docker images** to our Azure Container Registry (`aihubprodacr`)
- **Update the Container App** (`ca-chgadmin-prod`) with the new image

### Why OIDC instead of a client secret?

There are two ways GitHub can authenticate to Azure:

| Method | How it works | Risk |
|--------|-------------|------|
| **Client Secret** | A password stored in GitHub secrets. Azure trusts whoever has this password. | If the secret leaks, anyone can deploy. Secrets expire and must be rotated manually. |
| **OIDC Federated Credential** (recommended) | GitHub proves its identity to Azure using a short-lived token. No password is stored anywhere. | No secret to leak or rotate. Azure only trusts tokens from our specific GitHub repo + branch. |

**We use OIDC because there is no password to manage, rotate, or risk leaking.**

### What permissions does it get?

The service principal gets the **minimum permissions** needed:

| Role | Scope | Why |
|------|-------|-----|
| `AcrPush` | `aihubprodacr` (Container Registry only) | Push Docker images. Cannot delete images or manage the registry. |
| `Contributor` | `CHAPTERS-AI-Hub` (resource group) | Update the Container App with the new image. |

It **cannot**:
- Access other subscriptions or resource groups
- Modify Entra ID, users, or tenant settings
- Access Key Vault secrets
- Modify the App Gateway, VNet, or DNS

### Who can trigger it?

Only pushes to the `main` branch of `Chapters-Group/ai-hub-admin` can use this credential. The federated credential's subject claim is locked to:

```
repo:Chapters-Group/ai-hub-admin:ref:refs/heads/main
```

A different repo, a different branch, or a forked repo **cannot** use this credential.

---

## Setup Steps

### Prerequisites

- **DNS management access** for `chaptersgroup.com`
- **Entra ID role**: `Application Administrator` or `Cloud Application Administrator` (or Global Admin)
- **Azure subscription role**: `Owner` or `User Access Administrator` on the `CHAPTERS-AI-Hub` resource group (to assign roles to the new service principal)

### Step 1: Create the DNS Record

Add an A record in your DNS provider:

| Field | Value |
|-------|-------|
| Type | `A` |
| Name | `admin` (under `chaptersgroup.com`) |
| Value | `20.218.245.34` |
| TTL | 300 (or default) |

Verify with: `nslookup admin.chaptersgroup.com` — should resolve to `20.218.245.34`.

### Step 2: Create the App Registration

Go to **Azure Portal → Entra ID → App registrations → New registration**

| Field | Value |
|-------|-------|
| Name | `github-chapters-admin-deploy` |
| Supported account types | Single tenant (this organization only) |
| Redirect URI | Leave empty |

Click **Register**.

**Note the Application (client) ID** — this is needed as a GitHub secret.

### Step 3: Create the Service Principal

This is usually created automatically when you register the app. Verify it exists:

**Azure Portal → Entra ID → Enterprise applications → Search for `github-chapters-admin-deploy`**

If it doesn't appear, create it via CLI:
```bash
az ad sp create --id <Application-client-ID>
```

### Step 4: Add Federated Credential

Go to **App registrations → `github-chapters-admin-deploy` → Certificates & secrets → Federated credentials → Add credential**

| Field | Value |
|-------|-------|
| Federated credential scenario | GitHub Actions deploying Azure resources |
| Organization | `Chapters-Group` |
| Repository | `ai-hub-admin` |
| Entity type | Branch |
| GitHub branch name | `main` |
| Name | `github-main-branch` |
| Audience | `api://AzureADTokenExchange` (default) |

Click **Add**.

### Step 5: Assign Azure Roles

Go to **Azure Portal → Resource groups → CHAPTERS-AI-Hub → Access control (IAM) → Add role assignment**

**Role 1: AcrPush on the Container Registry**

| Field | Value |
|-------|-------|
| Role | `AcrPush` |
| Assign access to | User, group, or service principal |
| Members | Search for `github-chapters-admin-deploy` |
| Scope | Resource: `aihubprodacr` (Container Registry) |

**Role 2: Contributor on the Resource Group**

| Field | Value |
|-------|-------|
| Role | `Contributor` |
| Assign access to | User, group, or service principal |
| Members | Search for `github-chapters-admin-deploy` |
| Scope | Resource group: `CHAPTERS-AI-Hub` |

### Step 6: Configure GitHub Secrets

Go to **GitHub → `Chapters-Group/ai-hub-admin` → Settings → Secrets and variables → Actions → New repository secret**

Add these 3 secrets:

| Secret Name | Value | Where to find it |
|-------------|-------|------------------|
| `AZURE_CLIENT_ID` | Application (client) ID of `github-chapters-admin-deploy` | Entra ID → App registrations → Overview |
| `AZURE_TENANT_ID` | `0497a289-ce05-46b2-9d69-6aee3a4d4ce9` | Entra ID → Overview → Tenant ID |
| `AZURE_SUBSCRIPTION_ID` | `70a307ab-ade5-4abf-b100-545e2cc806d5` | Subscriptions → AI Subscription Anuraag |

---

## Verification

After both DNS and Entra ID are configured:

1. **DNS**: Run `nslookup admin.chaptersgroup.com` — should return `20.218.245.34`
2. **OIDC**: Go to **GitHub → `ai-hub-admin` repo → Actions → Build and Deploy → Run workflow** — the "Azure Login via OIDC" step should succeed

---

## Summary

> **DNS**: Add an A record for `admin.chaptersgroup.com` → `20.218.245.34` (same App Gateway IP as `ai.chaptersgroup.com`). This does not affect existing services.
>
> **Entra ID**: Create an App Registration called `github-chapters-admin-deploy` with a **federated credential** (no secrets/passwords) that allows our GitHub Actions pipeline (`Chapters-Group/ai-hub-admin`, `main` branch only) to push Docker images to our Container Registry and update a Container App. The service principal needs `AcrPush` on `aihubprodacr` and `Contributor` on the `CHAPTERS-AI-Hub` resource group. No Entra ID admin permissions, no Key Vault access, no network changes.
