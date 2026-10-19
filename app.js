// Data storage
let vehicles = [];
let maintenanceRecords = [];
let fuelRecords = [];

// DOM elements
const navLinks = document.querySelectorAll('.nav-link');
const sectionContents = document.querySelectorAll('.section-content');

// Vehicle form elements
const vehicleForm = document.getElementById('vehicle-form');
const vehiclesBody = document.getElementById('vehicles-body');

// Maintenance form elements
const maintenanceForm = document.getElementById('maintenance-form');
const maintenanceVehicleSelect = document.getElementById('maintenance-vehicle');
const maintenanceFilterVehicle = document.getElementById('maintenance-filter-vehicle');
const maintenanceBody = document.getElementById('maintenance-body');

// Fuel form elements
const fuelForm = document.getElementById('fuel-form');
const fuelVehicleSelect = document.getElementById('fuel-vehicle');
const fuelFilterVehicle = document.getElementById('fuel-filter-vehicle');
const fuelBody = document.getElementById('fuel-body');

// Import/Export elements
const exportAllBtn = document.getElementById('export-all-btn');
const exportVehiclesBtn = document.getElementById('export-vehicles-btn');
const exportMaintenanceBtn = document.getElementById('export-maintenance-btn');
const exportFuelBtn = document.getElementById('export-fuel-btn');
const importBtn = document.getElementById('import-btn');
const importFile = document.getElementById('import-file');
const mergeDataCheckbox = document.getElementById('merge-data');

// Load data from localStorage on page load
document.addEventListener('DOMContentLoaded', () => {
  loadDataFromLocalStorage();
  renderVehicles();
  renderMaintenanceRecords();
  renderFuelRecords();
  populateVehicleDropdowns();
});

// Navigation functionality
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    navLinks.forEach(l => l.classList.remove('active'));
    sectionContents.forEach(s => s.classList.remove('active'));
    link.classList.add('active');
    const targetSection = document.getElementById(link.getAttribute('data-section'));
    targetSection.classList.add('active');
  });
});

// ===== VEHICLE MANAGEMENT =====
vehicleForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const vehicleId = document.getElementById('vehicle-id').value.trim();
  const make = document.getElementById('vehicle-make').value.trim();
  const model = document.getElementById('vehicle-model').value.trim();
  const year = document.getElementById('vehicle-year').value.trim();
  const type = document.getElementById('vehicle-type').value.trim();

  // Check if any field is empty
  if (!vehicleId || !make || !model || !year || !type) {
    alert('Please fill in all fields.');
    return;
  }
  // Check if vehicle ID already exists
  if (vehicles.some(v => v.vehicleId === vehicleId)) {
    alert('A vehicle with this ID already exists!');
    return;
  }
  vehicles.push({ id: Date.now(), vehicleId, make, model, year, type });
  saveDataToLocalStorage();
  renderVehicles();
  populateVehicleDropdowns();
  vehicleForm.reset();
  alert('Vehicle added successfully!');
});

function renderVehicles() {
  vehiclesBody.innerHTML = '';
  if (vehicles.length === 0) {
    vehiclesBody.innerHTML = '<tr><td colspan="6">No vehicles registered.</td></tr>';
    return;
  }
  vehicles.forEach(vehicle => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${vehicle.vehicleId}</td>
      <td>${vehicle.make}</td>
      <td>${vehicle.model}</td>
      <td>${vehicle.year}</td>
      <td>${vehicle.type}</td>
      <td>
        <button class="btn danger-btn" onclick="deleteVehicle('${vehicle.vehicleId}')">Delete</button>
      </td>
    `;
    vehiclesBody.appendChild(row);
  });
}

window.deleteVehicle = function(vehicleId) {
  if (!confirm('Are you sure you want to delete this vehicle?')) return;
  vehicles = vehicles.filter(v => v.vehicleId !== vehicleId);
  maintenanceRecords = maintenanceRecords.filter(m => m.vehicleId !== vehicleId);
  fuelRecords = fuelRecords.filter(f => f.vehicleId !== vehicleId);
  saveDataToLocalStorage();
  renderVehicles();
  renderMaintenanceRecords();
  renderFuelRecords();
  populateVehicleDropdowns();
  alert('Vehicle and all associated records deleted.');
};

function populateVehicleDropdowns() {
  [maintenanceVehicleSelect, maintenanceFilterVehicle, fuelVehicleSelect, fuelFilterVehicle].forEach(select => {
    if (!select) return;
    // For filter selects, add "All" option
    const isFilter = select === maintenanceFilterVehicle || select === fuelFilterVehicle;
    select.innerHTML = isFilter ? '<option value="">All</option>' : '';
    vehicles.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v.vehicleId;
      opt.textContent = v.vehicleId + ' - ' + v.make + ' ' + v.model;
      select.appendChild(opt.cloneNode(true));
    });
  });
}

// ===== MAINTENANCE MANAGEMENT =====
maintenanceForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const vehicleId = maintenanceVehicleSelect.value.trim();
  const date = document.getElementById('maintenance-date').value.trim();
  const mileage = document.getElementById('maintenance-mileage').value.trim();
  const cost = document.getElementById('maintenance-cost').value.trim();
  const notes = document.getElementById('maintenance-notes').value.trim();

  if (!vehicleId || !date || !mileage || !cost) {
    alert('Please fill in all required fields.');
    return;
  }
  maintenanceRecords.push({ id: Date.now(), vehicleId, date, mileage, cost, notes });
  saveDataToLocalStorage();
  renderMaintenanceRecords();
  maintenanceForm.reset();
  alert('Maintenance record added!');
});

maintenanceFilterVehicle.addEventListener('change', renderMaintenanceRecords);

function renderMaintenanceRecords() {
  maintenanceBody.innerHTML = '';
  let filtered = maintenanceRecords;
  const filter = maintenanceFilterVehicle.value;
  if (filter) filtered = filtered.filter(m => m.vehicleId === filter);
  if (filtered.length === 0) {
    maintenanceBody.innerHTML = '<tr><td colspan="6">No maintenance records.</td></tr>';
    return;
  }
  filtered.forEach(m => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${m.vehicleId}</td>
      <td>${m.date}</td>
      <td>${m.mileage}</td>
      <td>${m.cost}</td>
      <td>${m.notes || ''}</td>
      <td>
        <button class="btn danger-btn" onclick="deleteMaintenance(${m.id})">Delete</button>
      </td>
    `;
    maintenanceBody.appendChild(row);
  });
}

window.deleteMaintenance = function(id) {
  if (!confirm('Delete this maintenance record?')) return;
  maintenanceRecords = maintenanceRecords.filter(m => m.id !== id);
  saveDataToLocalStorage();
  renderMaintenanceRecords();
  alert('Record deleted.');
};

// ===== FUEL MANAGEMENT =====
fuelForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const vehicleId = fuelVehicleSelect.value.trim();
  const date = document.getElementById('fuel-date').value.trim();
  const odometer = document.getElementById('fuel-odometer').value.trim();
  const quantity = document.getElementById('fuel-quantity').value.trim();
  const cost = document.getElementById('fuel-cost').value.trim();
  const fuelType = document.getElementById('fuel-type').value.trim();
  const station = document.getElementById('fuel-station').value.trim();
  const efficiency = document.getElementById('fuel-efficiency').value.trim();

  if (!vehicleId || !date || !odometer || !quantity || !cost || !fuelType) {
    alert('Please fill in all required fields.');
    return;
  }
  fuelRecords.push({ id: Date.now(), vehicleId, date, odometer, quantity, cost, fuelType, station, efficiency });
  saveDataToLocalStorage();
  renderFuelRecords();
  fuelForm.reset();
  alert('Fuel record added!');
});

fuelFilterVehicle.addEventListener('change', renderFuelRecords);

function renderFuelRecords() {
  fuelBody.innerHTML = '';
  let filtered = fuelRecords;
  const filter = fuelFilterVehicle.value;
  if (filter) filtered = filtered.filter(f => f.vehicleId === filter);
  if (filtered.length === 0) {
    fuelBody.innerHTML = '<tr><td colspan="9">No fuel records.</td></tr>';
    return;
  }
  filtered.forEach(f => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${f.vehicleId}</td>
      <td>${f.date}</td>
      <td>${f.odometer}</td>
      <td>${f.quantity}</td>
      <td>${f.cost}</td>
      <td>${f.fuelType}</td>
      <td>${f.station || ''}</td>
      <td>${f.efficiency || ''}</td>
      <td>
        <button class="btn danger-btn" onclick="deleteFuel(${f.id})">Delete</button>
      </td>
    `;
    fuelBody.appendChild(row);
  });
}

window.deleteFuel = function(id) {
  if (!confirm('Delete this fuel record?')) return;
  fuelRecords = fuelRecords.filter(f => f.id !== id);
  saveDataToLocalStorage();
  renderFuelRecords();
  alert('Record deleted.');
};

// ===== IMPORT/EXPORT =====
function downloadJSON(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

exportAllBtn.addEventListener('click', () => {
  downloadJSON('all_data.json', { vehicles, maintenanceRecords, fuelRecords });
});
exportVehiclesBtn.addEventListener('click', () => {
  downloadJSON('vehicles.json', vehicles);
});
exportMaintenanceBtn.addEventListener('click', () => {
  downloadJSON('maintenance.json', maintenanceRecords);
});
exportFuelBtn.addEventListener('click', () => {
  downloadJSON('fuel.json', fuelRecords);
});

importBtn.addEventListener('click', () => {
  const file = importFile.files[0];
  if (!file) {
    alert('Please select a file.');
    return;
  }
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (mergeDataCheckbox.checked) {
        if (data.vehicles) vehicles = vehicles.concat(data.vehicles);
        if (data.maintenanceRecords) maintenanceRecords = maintenanceRecords.concat(data.maintenanceRecords);
        if (data.fuelRecords) fuelRecords = fuelRecords.concat(data.fuelRecords);
      } else {
        if (data.vehicles) vehicles = data.vehicles;
        if (data.maintenanceRecords) maintenanceRecords = data.maintenanceRecords;
        if (data.fuelRecords) fuelRecords = data.fuelRecords;
      }
      saveDataToLocalStorage();
      renderVehicles();
      renderMaintenanceRecords();
      renderFuelRecords();
      populateVehicleDropdowns();
      alert('Data imported successfully!');
    } catch (err) {
      alert('Invalid file format.');
    }
  };
  reader.readAsText(file);
});

// ===== LOCAL STORAGE =====
function saveDataToLocalStorage() {
  localStorage.setItem('vehicles', JSON.stringify(vehicles));
  localStorage.setItem('maintenanceRecords', JSON.stringify(maintenanceRecords));
  localStorage.setItem('fuelRecords', JSON.stringify(fuelRecords));
}
function loadDataFromLocalStorage() {
  vehicles = JSON.parse(localStorage.getItem('vehicles') || '[]');
  maintenanceRecords = JSON.parse(localStorage.getItem('maintenanceRecords') || '[]');
  fuelRecords = JSON.parse(localStorage.getItem('fuelRecords') || '[]');
}
