const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

// Données mock
const drivers = [
  { id: 1, name: 'Jean Dupont', email: 'jean@email.com', phone: '771234567', vehicleType: 'Berline', licensePlate: 'AA-123-BB', status: 'pending' },
  { id: 2, name: 'Marie Camara', email: 'marie@email.com', phone: '772345678', vehicleType: 'SUV', licensePlate: 'BB-456-CC', status: 'pending' },
];

const users = [
  { id: 1, name: 'Alice Diallo', email: 'alice@email.com', phone: '773456789', totalTrips: 25, status: 'active' },
  { id: 2, name: 'Bob Koné', email: 'bob@email.com', phone: '774567890', totalTrips: 12, status: 'suspended' },
];

const trips = [
  { id: 1, driverName: 'Jean Dupont', userName: 'Alice Diallo', date: '2024-01-15', gpsDistance: 12.5, theoreticalDistance: 10.2, anomaly: null },
];

// Routes API
app.post('/api/admin/login/', (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@transport.com' && password === 'admin123') {
    res.json({ user: { name: 'Admin', email }, token: 'fake-jwt-token' });
  } else {
    res.status(401).json({ error: 'Identifiants invalides' });
  }
});

app.get('/api/admin/drivers/', (req, res) => res.json(drivers));
app.get('/api/admin/users/', (req, res) => res.json(users));
app.get('/api/admin/trips/', (req, res) => res.json(trips));
app.get('/api/admin/disputes/', (req, res) => res.json([]));
app.get('/api/admin/pricing/', (req, res) => res.json({ pricePerKm: 1.5, baseFare: 50 }));
app.get('/api/admin/stats/', (req, res) => res.json({
  activeTrips: 45,
  totalRevenue: 1250000,
  activeDrivers: 128,
  totalUsers: 5420,
  revenueData: [
    { date: 'Lun', revenu: 150000 },
    { date: 'Mar', revenu: 180000 },
    { date: 'Mer', revenu: 220000 },
  ],
  tripsData: [
    { jour: 'Lun', courses: 45 },
    { jour: 'Mar', courses: 52 },
    { jour: 'Mer', courses: 68 },
  ],
}));

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`✅ Serveur API démarré sur http://localhost:${PORT}`);
  console.log(`📝 Email: admin@transport.com`);
  console.log(`🔑 Mot de passe: admin123`);
});