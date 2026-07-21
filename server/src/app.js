const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const { errorHandler } = require('./middlewares/error.middleware');

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet());

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/health', require('./routes/health.routes'));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/production', require('./routes/production.routes')); 
app.use('/api/inventory', require('./routes/inventory.routes'));
app.use('/api/customers', require('./routes/customer.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/sales', require('./routes/sales.routes')); 
app.use('/api/reports', require('./routes/report.routes')); 
app.use('/api/dashboard', require('./routes/dashboard.routes'));        
app.use('/api/notifications', require('./routes/notification.routes')); 
app.use('/api/settings', require('./routes/settings.routes'));          
app.use('/api/audit', require('./routes/audit.routes'));                
app.use('/api/upload', require('./routes/upload.routes'));              

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Cannot ${req.method} ${req.originalUrl}` 
    });
});

// Global error handler
app.use(errorHandler);

module.exports = app;