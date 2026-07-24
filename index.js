const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const schoolRoute = require('./src/routes/school.routes');
const authRoute = require('./src/routes/auth.routes');
const teacherRoute = require('./src/routes/teacher.routes');
const errorMiddleware = require('./src/middlewares/error.middleware');
const createSuperAdmin = require('./src/seeds/superAdmin');
const logger = require("./src/logger/logger");
const pinoHttp = require('pino-http');
const compression = require('compression');
const helmet = require('helmet');
const cookieParser = require("cookie-parser");
const { ALLOWED_ADDRESS } = require('./src/config/env');

const app = express();

// Middlewares
app.use(
  cors({
    origin: ALLOWED_ADDRESS,
    credentials: true,
  }),
  pinoHttp({
    logger,
  }),
  helmet(),
  compression(),
  cookieParser()
);
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/school', schoolRoute);
app.use('/api/v1/teacher', teacherRoute);
app.get('/api/v1/health', (req, res) => {
  logger.info('App working Correctly');
  return res.status(200).json({ message: 'App working Correctly' });
});

app.use(errorMiddleware);
module.exports = app;