# FC27 Yayın Takip Sitesi

Ege'nin subathon yayını için canlı challenge ve konuk takip sitesi.
Next.js (App Router) + Tailwind CSS ile statik export olarak GitHub Pages'e yayınlanır.

## Özellikler

- **Main Challenge tablosu** — 8 challenge, durum göstergeleri (Tamamlandı / Devam Ediyor / Başarısız), aktif challenge vurgusu
- **Konuk listesi** — Ege Onay ve Gelir/Gelmez kutuları, mobilde yatay kaydırma
- **Admin paneli** (`/admin`) — şifre korumalı, değişiklikleri GitHub API ile `public/data.json`'a commit eder
- **Canlı güncelleme** — site veriyi jsDelivr CDN üzerinden 30 saniyede bir çeker; commit sonrası izleyiciler ~1 dakika içinde güncel veriyi görür

## Kurulum

1. **Repo oluşturun**: GitHub'da `<kullanıcıadı>.github.io` adında **public** bir repo açın (GitHub Pages user site kuralı). Repo adı tam olarak kullanıcı adınız olmalı.
2. Bu projeyi repoya push edin.
3. **Pages ayarı**: Repo → Settings → Pages → Source: **GitHub Actions** seçin.
4. Deploy workflow'u otomatik çalışır; site `https://<kullanıcıadı>.github.io/` adresinde açılır.

### Şifre (Admin Paneli)

Varsayılan şifre: `kilim7mert` (değiştirmeniz **şart**).

Değiştirmek için GitHub'da Repo → Settings → Secrets and variables → Actions → **New repository secret**:
`NEXT_PUBLIC_ADMIN_PASSWORD_HASH` değerine ya istediğiniz şifreyi **düz metin** olarak ya da hash'ini yazabilirsiniz:

```bash
echo -n "YENI_SIFREN" | shasum -a 256 | cut -d' ' -f1
```

> Not: Bu şifre istemci tarafında kontrol edilir — yalnızca görsel bir engeldir, gerçek güvenlik değildir. Gerçek veri koruması, admin işlemlerinin GitHub token ile commit edilmesidir.

### GitHub Token (Admin Panelinde)

Admin panelinde değişiklik yapabilmek için GitHub'a **fine-grained PAT** gerekir:

1. GitHub → Settings → Developer settings → **Fine-grained tokens** → Generate new token
2. **Repository access**: Only select repositories → `<kullanıcıadı>.github.io`
3. **Permissions** → Repository permissions → **Contents: Read and write**
4. Token'ı kopyalayın (bir daha gösterilmez)

Token, admin panelinde ilk oturumda girilir ve yalnızca `sessionStorage`'da tutulur —
koda, git geçmişine veya ortam değişkenlerine **asla** yazılmaz. Çıkış yapınca silinir.

### Veri Akışı

```
Admin paneli ──PUT──▶ api.github.com ──commit──▶ public/data.json (repo main)
                                                        │
                                                        ▼ (CDN)
Ana site ──jsDelivr (30 sn poll)──▶ güncel veri
```

Admin commit'i GitHub Pages'e otomatik deploy tetiklemez (workflow yalnızca koda
bağlı), ancak site veriyi CDN'den çektiği için rebuild'e gerek yoktur.

## Yerel Geliştirme

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # statik çıktı → ./out
npx serve out      # çıktıyı test et
```

## Proje Yapısı

```
app/page.tsx        # Ana site (challenge + konuk tablosu)
app/admin/page.tsx  # Admin paneli (şifre + token + commit)
components/         # UI bileşenleri
lib/github.ts       # GitHub contents API istemcisi
lib/useSiteData.ts  # Canlı veri hook'u (CDN + poll)
lib/site.ts         # Repo/site konfigürasyonu
public/data.json    # Tüm site verisi (commit edilen dosya)
```