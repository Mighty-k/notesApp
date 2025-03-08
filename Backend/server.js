require('dotenv').config()

const express = require('express')
const mongoose =require('mongoose')
const cors = require ('cors')
const bodyparser = require('body-parser')

const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');

const corsOptions = {
  origin: [
    'https://notes-app-27g5.vercel.app',
    'https://notes-app-wheat-nu.vercel.app',
    'https://notes-lazydev.vercel.app', 
    'http://127.0.0.1:5500/',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};



const app = express()
// const PORT = process.env.PORT || 5000;

app.get('/', (req,res)=>{
  res.send('Hello world')
});

// Middleware
app.use(cors(corsOptions));
app.use(bodyparser.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: true, 
  serverSelectionTimeoutMS: 5000 // Enabling SSL for secure connection
})
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('Database connection error:', err));

  module.exports = app;

// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));  