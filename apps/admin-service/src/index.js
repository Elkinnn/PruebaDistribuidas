const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(helmet())
app.use(cors())
app.use(morgan('combined'))
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'admin-service',
    timestamp: new Date().toISOString() 
  })
})

// Routes
app.use('/users', require('./presentation/routes/userRoutes'))
app.use('/config', require('./presentation/routes/configRoutes'))
app.use('/reports', require('./presentation/routes/reportRoutes'))
app.use('/dashboard', require('./presentation/routes/dashboardRoutes'))

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.listen(PORT, () => {
  console.log(`🔧 Admin Service running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
})
