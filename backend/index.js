const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const dataRoutes = require('./routes/dataRoutes');

app.use('/api', authRoutes);
app.use('/api', dataRoutes);

// Health Check (Optional)
app.get('/', (req, res) => {
    res.send('Wedding Planner Backend Running');
});

// Listen
app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Server is running on port ${port}`);
});
