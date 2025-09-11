import L from 'leaflet';

export function initMap(coordinates, address) {
  const map = L.map('map').setView(coordinates, 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  L.marker(coordinates).addTo(map)
    .bindPopup(address)
    .openPopup();
}
