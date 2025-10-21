# Dashboard WebGIS Kekeringan Indonesia — v2 (34 provinsi)

Paket ini berisi dashboard versi penuh dengan 34 provinsi Indonesia. Poligon dibuat secara disederhanakan (representatif) untuk demonstrasi visual dan analisis contoh — bukan batas administrasi resmi.

## Cara menjalankan
1. Ekstrak ZIP
2. Jalankan server lokal:
   python -m http.server 8000
3. Buka http://localhost:8000

## Catatan
- Untuk penggunaan operasional, disarankan mengganti `data/wilayah.geojson` dengan shapefile resmi (mis. dari BPS, Geonode, atau repository pemerintah) dan menyesuaikan script.
- Open-Meteo dipanggil dari browser; bila diblokir, data cuaca tidak akan tampil.
- Versi ini menggunakan CDN untuk library JS.
