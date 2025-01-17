require('dotenv').config()

const express = require('express')
const mongoose =require('mongoose')
const cors = require ('cors')
const bodyparser = require('body-parser')

const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');

const app = express()
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyparser.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('Database connection error:', err));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));  