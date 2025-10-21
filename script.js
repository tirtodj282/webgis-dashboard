// script.js - WebGIS Dashboard logic (modern, interactive)
// Map init
const map = L.map('map').setView([-2.5, 118], 5);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap'
}).addTo(map);

let geoLayer = null;

// color scale
function getColor(d) {
  return d > 0.75 ? '#7f0000' :
         d > 0.65 ? '#c62828' :
         d > 0.5  ? '#f57c00' :
         d > 0.35 ? '#fdd835' :
         d > 0.2  ? '#a5d6a7' : '#e8f5e9';
}
function styleFeature(feature) {
  const tahun = document.getElementById('tahun').value || '2023';
  const key = 'indeks' + tahun;
  const val = feature.properties[key] !== undefined ? feature.properties[key] : 0.0;
  return {
    fillColor: getColor(val),
    color: '#ffffff',
    weight: 1,
    fillOpacity: 0.85
  };
}

// load geojson
fetch('data/wilayah.geojson').then(r=>r.json()).then(data=>{
  geoLayer = L.geoJSON(data, {
    style: styleFeature,
    onEachFeature: (feature, layer) => {
      layer.on('click', async () => {
        await showDetails(feature.properties);
      });
      layer.on('mouseover', () => {
        layer.setStyle({ weight:2, color:'#003049' });
      });
      layer.on('mouseout', () => {
        geoLayer.resetStyle(layer);
      });
    }
  }).addTo(map);

  // add search control
  setTimeout(()=> {
    const searchControl = new L.Control.Search({
      layer: geoLayer,
      propertyName: 'nama',
      marker: false,
      moveToLocation: function(latlng, title, map) {
        map.setView(latlng, 7);
      }
    });
    map.addControl(searchControl);
  }, 300);

  // legend
  const legend = L.control({ position: 'bottomright' });
  legend.onAdd = function() {
    const div = L.DomUtil.create('div','legend');
    const grades = [0, 0.2, 0.35, 0.5, 0.65, 0.75];
    div.innerHTML = '<strong>Indeks Kekeringan</strong><br>';
    for (let i=0;i<grades.length;i++){
      const a = grades[i] + 0.01;
      div.innerHTML += '<i style="background:'+getColor(a)+'"></i> ' + grades[i] + (grades[i+1]? '&ndash;'+grades[i+1] + '<br>':'+');
    }
    return div;
  };
  legend.addTo(map);
});

// Chart
const ctx = document.getElementById('chart').getContext('2d');
const chart = new Chart(ctx, {
  type: 'line',
  data: { labels: [], datasets:[{ label:'Indeks Kekeringan', data: [], tension:0.3, pointRadius:4 }]},
  options: { responsive:true, plugins:{ legend:{ display:false } }, scales:{ y:{ min:0, max:1 }}}
});

// show details + fetch Open-Meteo sample
async function showDetails(props) {
  // update chart from props.tren if present
  const tren = props.tren || { '2019':0.3,'2020':0.35,'2021':0.45,'2022':0.55,'2023':0.6 };
  chart.data.labels = Object.keys(tren);
  chart.data.datasets[0].data = Object.values(tren);
  chart.update();

  // fetch small climate sample via Open-Meteo for centroid if available
  const lat = props.center_lat || -2.5;
  const lon = props.center_lon || 118;
  let weatherText = '';
  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=precipitation_sum,temperature_2m_max&timezone=auto`);
    const json = await res.json();
    const p = json.daily.precipitation_sum ? json.daily.precipitation_sum.slice(0,3).join(', ') : 'n/a';
    const t = json.daily.temperature_2m_max ? json.daily.temperature_2m_max.slice(0,3).join(', ') : 'n/a';
    weatherText = `<p><strong>Prakiraan 3 hari (mm):</strong> ${p}</p><p><strong>Suhu max (°C):</strong> ${t}</p>`;
  } catch (e) {
    weatherText = '<p>Data cuaca tidak tersedia (koneksi API diblokir atau offline).</p>';
  }

  document.getElementById('details').innerHTML = `
    <h4>${props.nama}</h4>
    <p><strong>Indeks 2023:</strong> ${props.indeks2023 ?? 'n/a'}</p>
    <p><strong>Status:</strong> ${props.status ?? '—'}</p>
    ${weatherText}
  `;
}

// Controls: year change
document.getElementById('tahun').addEventListener('change', ()=>{
  if (geoLayer) geoLayer.setStyle(styleFeature);
});

// Heatmap toggle
let heatLayer = null;
document.getElementById('toggleHeat').addEventListener('click', ()=>{
  if (heatLayer) { map.removeLayer(heatLayer); heatLayer=null; return; }
  if (!geoLayer) return;
  const heatData = [];
  geoLayer.eachLayer(l=>{
    const p = l.feature.properties;
    if (p.center_lat && p.center_lon) heatData.push([p.center_lat, p.center_lon, p.indeks2023 || 0.3]);
  });
  heatLayer = L.heatLayer(heatData, { radius: 40, blur: 30, maxZoom: 7 }).addTo(map);
});

// Buffer demo (100 km)
document.getElementById('addBuffer').addEventListener('click', ()=>{
  const pt = L.latLng(-0.02, 110.35); // sample point (Kalimantan)
  L.marker(pt).addTo(map).bindPopup('Titik contoh').openPopup();
  const circle = L.circle(pt, { radius:100000, color:'#ff006e', fillColor:'#ffb3c1', fillOpacity:0.25 }).addTo(map);
  map.fitBounds(circle.getBounds());
});

// Simulated API update (kekeringan_api.json)
async function updateFromAPI() {
  try {
    const r = await fetch('data/kekeringan_api.json');
    const j = await r.json();
    if (!geoLayer) return;
    geoLayer.eachLayer(l=>{
      const name = l.feature.properties.nama;
      if (j[name]) {
        l.feature.properties.indeks2023 = j[name]['2023'];
        l.feature.properties.status = j[name]['status'];
      }
    });
    geoLayer.setStyle(styleFeature);
  } catch(e) {
    console.warn('API update failed', e);
  }
}
setInterval(updateFromAPI, 30000);
updateFromAPI();
