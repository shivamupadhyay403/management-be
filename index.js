const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const schoolRoute = require('./src/routes/school.routes');
const authRoute = require('./src/routes/auth.routes');
const teacherRoute = require('./src/routes/teacher.routes');
const errorMiddleware = require('./src/middlewares/error.middleware');
dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/school', schoolRoute);
app.use('/api/v1/teacher', teacherRoute);
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', message: 'Auth API is running' });
});

app.use(errorMiddleware);
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
