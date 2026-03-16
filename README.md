# Sahə Tədqiqatçısı — Backend

## Railway-də Deploy Etmək

### 1. GitHub-a yüklə
Bu qovluğu GitHub-da yeni repo kimi yarat:
- `package.json`
- `server.js`

### 2. Railway-də deploy et
1. **railway.app** → GitHub ilə giriş
2. **"New Project"** → **"Deploy from GitHub repo"**
3. Bu repo-nu seç → Deploy

### 3. API Key əlavə et
Railway layihəsi → **"Variables"** tabı → **"New Variable"**:
```
ANTHROPIC_API_KEY = sk-ant-xxxxxx
```

### 4. URL al
Deploy bitdikdən sonra:
**Settings** → **"Generate Domain"** → URL kopyala

### 5. Oyuna əlavə et
`sahə_tedqiqatcisi.html` faylında bu sətri tap:
```
const BACKEND_URL = 'BURAYA_URL_YAZ';
```
Railway URL-ini ora yaz.

## Test et
```
https://sənin-url.railway.app/
```
Cavab: `{"status": "Sahə Tədqiqatçısı Backend işləyir ✅"}`
