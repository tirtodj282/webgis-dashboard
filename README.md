# Dashboard WebGIS Kekeringan Indonesia

Paket ini berisi contoh **Dashboard WebGIS interaktif** yang menampilkan indeks kekeringan contoh per wilayah, grafik tren, heatmap, serta integrasi sederhana ke Open-Meteo untuk contoh data cuaca.

## Fitur
- Peta tematik (Leaflet) untuk berbagai wilayah di Indonesia
- Pencarian wilayah (Leaflet Control Search)
- Heatmap interaktif (Leaflet.heat)
- Grafik tren (Chart.js)
- Filter tahun, buffer demo, dan update nilai dari file `kekeringan_api.json`
- Desain modern-interaktif (warna cerah, animasi tombol)

## Cara menjalankan
1. Ekstrak ZIP.
2. Jalankan server HTTP sederhana (direkomendasikan):
   ```
   python -m http.server 8000
   ```
3. Buka browser: http://localhost:8000

## Catatan
- File menggunakan CDN untuk Leaflet, Chart.js, dan plugin. Jika ingin gunakan tanpa koneksi internet, download library ke folder `libs/` dan sesuaikan `index.html`.
- Ganti `data/kekeringan_api.json` dengan API real atau endpoint dinamis untuk integrasi produksi.
- Untuk deploy cepat: push folder ke GitHub dan aktifkan GitHub Pages.

--- 
Versi paket: 1.0 — Oktober 2025
