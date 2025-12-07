const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

const { connectDB } = require('./config/db');
const { syncModels } = require('./models'); // Import to load associations
const authRoutes = require('./routes/authRoutes');
const landRoutes = require('./routes/landRoutes');
const locationRoutes = require('./routes/locationRoutes');
const userRoutes = require('./routes/userRoutes');
const cropRoutes = require('./routes/cropRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const aiRoutes = require('./routes/aiRoutes');

const adminRoutes = require('./routes/adminRoutes');
const godownRoutes = require('./routes/godownRoutes');
const govRoutes = require('./routes/govRoutes');

// Connect to Database
connectDB().then(() => {
  syncModels(); // Sync models after connection
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/land', landRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/godowns', godownRoutes);
app.use('/api/gov', govRoutes);

app.get('/', (req, res) => {
  res.send('AI Smart Farmer Backend is running');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
