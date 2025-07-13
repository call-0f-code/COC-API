import express from 'express'
import { json, urlencoded } from 'body-parser'
import routes from './routes'      // your index.ts that mounts all sub‑routers
import { errorHandler } from './utils/apiError'

const app = express()

// 1) Global middleware
app.use(json())
app.use(urlencoded({ extended: true }))

// 2) Mount routes
app.use('/api', routes)

// 3) 404 handler (if no route matched)
app.use((req, res, next) => {
  res.status(404).json({ message: 'Not Found' })
})

// 4) Global error handler
app.use(errorHandler)

export default app
