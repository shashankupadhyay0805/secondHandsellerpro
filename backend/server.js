// import path from 'path'
// import express from 'express'

// import dotenv from 'dotenv'

// import connectDB from './config/db.js'
// import productRoutes from './routes/productRoutes.js'
// import userRoutes from './routes/userRoutes.js'
// import uploadRoutes from './routes/uploadRoutes.js'

// dotenv.config()
// // server.js (Insert after Line 11)


// // -----------------------------------------------------
// // TEMPORARY DEBUG CODE TO BE DELETED LATER
// console.log('MONGO_URI CHECK:', process.env.MONGO_URI.substring(0, 30) + '...');
// console.log('SENDGRID_API_KEY CHECK:', process.env.SEND_GRID_API);
// console.log('KEY_LENGTH:', process.env.SEND_GRID_API ? process.env.SEND_GRID_API.length : 'UNDEFINED');
// // -----------------------------------------------------

// connectDB();

// const app = express()
// app.use(express.json())
// app.use('/api/products', productRoutes)
// app.use('/api/users', userRoutes)
// app.use('/api/uploads', uploadRoutes)

// app.get('/api/config/cloudinary', (req, res) => {
//   res.send(process.env.CLOUDINARY_URL)
// })
// app.get('/api/config/cloudinarypreset', (req, res) => {
//   res.send(process.env.CLOUDINARY_UPLOAD_PRESET)
// })

// const __dirname = path.resolve()
// app.use('/uploads', express.static(path.join(__dirname, '/uploads')))
// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static(path.join(__dirname, '/frontend/build')))
//   app.get('*', (req, res) =>
//     res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'))
//   )
// } else {
//   app.get('/', (req, res) => {
//     res.send('API is running...')
//   })
// }

// app.use((err, req, res, next) => {
//   const statusCode = res.statusCode === 200 ? 500 : res.statusCode
//   res.status(statusCode)
//   res.json({
//     message: err.message,
//     stack: process.env.NODE_ENV === 'production' ? null : err.stack,
//   })
// })

// const PORT = process.env.PORT || 5000


import path from 'path'
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'

import connectDB from './config/db.js'
import productRoutes from './routes/productRoutes.js'
import userRoutes from './routes/userRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'

dotenv.config()

connectDB();

const app = express();
app.use(express.json());

// ===============================
// ⭐ FIXED CORS FOR RENDER
// ===============================
app.use(
  cors({
    origin: [
      'https://secondhandsellerpro-1.onrender.com', // your frontend URL
      'http://localhost:3000',                     // dev frontend
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

// ===============================
// API ROUTES
// ===============================
app.use('/api/products', productRoutes)
app.use('/api/users', userRoutes)
app.use('/api/uploads', uploadRoutes)

app.get('/api/config/cloudinary', (req, res) => {
  res.send(process.env.CLOUDINARY_URL)
})

app.get('/api/config/cloudinarypreset', (req, res) => {
  res.send(process.env.CLOUDINARY_UPLOAD_PRESET)
})

// ===============================
// STATIC FILE HANDLING
// ===============================
const __dirname = path.resolve()

app.use('/uploads', express.static(path.join(__dirname, '/uploads')))

// IMPORTANT: Your frontend directory is "Frontend" (capital F)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '/Frontend/build')))

  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, 'Frontend', 'build', 'index.html'))
  )
} else {
  app.get('/', (req, res) => {
    res.send('API is running...')
  })
}

// ===============================
// ERROR HANDLER
// ===============================
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode
  res.status(statusCode)
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  })
})

// ===============================
// START SERVER
// ===============================
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

export default app

// app.listen(PORT, console.log(`Server is running on port ${PORT}`))
// export default app;


