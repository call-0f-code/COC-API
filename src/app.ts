// src/app.ts
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { json, urlencoded } from 'body-parser'
import routes from './routes'
import { errorHandler } from './utils/apiError'
import { createClient } from '@supabase/supabase-js'
import config from './config'
import path from 'path'



// Initialize Supabase client for storage operations
export const supabase = createClient(
  config.SUPABASE_URL,
  config.SUPABASE_SERVICE_ROLE_KEY
)

const app = express()

// 1) Enable CORS for your domains
app.use(cors({
  origin: config.ALLOWED_ORIGINS.split(','),  // e.g. 'https://club.example.com'
  methods: ['GET','POST','PATCH','DELETE','OPTIONS'],
  credentials: true,
}))

// 2) Parse JSON and form data
app.use(json())
app.use(urlencoded({ extended: true }))

// 3) Handle file uploads (in-memory)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {fileSize: 2 * 1024 * 1024}
 })

// 4) Mount your routes, injecting `upload` middleware where needed
//    For endpoints that accept file uploads, you can do e.g.:
//    router.post('/members/:memberId/photo', upload.single('photo'), ...)

app.use('/api/v1', routes(upload, supabase))

// 5) 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Not Found' })
})

// 6) Global error handler
app.use(errorHandler)

// 7) do 'npm run apidoc to generate the documentation, I have added it in the scripts
//    then you can go to localhost:3000/docs to see the docs
app.use('/docs', express.static(path.join(__dirname, '..', 'docs/apidoc')))
export default app
