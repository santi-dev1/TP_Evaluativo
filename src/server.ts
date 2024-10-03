import path from 'path'
import express from 'express'
import cors from 'cors'
import colors from 'colors'
import morgan from 'morgan'
import fileUpload from 'express-fileupload'
import db from './config/db'
import adminRouter from './routes/AdminRoutes'
import userRouter from './routes/UserRoutes'
import authRouter from './routes/AuthRoutes'
import receiptRouter from './routes/ReceiptRoute'

/** Conexion a la base de datos */
export async function connectDB() {
    try {
        await db.authenticate()
        db.sync()
    } catch (error) {
    }
}
connectDB()

const app = express()

/** Configuración */
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cors({}))
app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
    abortOnLimit: true,
    useTempFiles: true,
    tempFileDir: path.join(__dirname, 'tmp'),
}));

/** Middlewares */
app.use(morgan('dev'))

/** Rutas */
app.get('/api', (req, res) => {
    res.json({ msg: 'Desde API' })
})

app.use('/api/admins', adminRouter)
app.use('/api/users', userRouter)
app.use('/api/auth', authRouter)
app.use('/api/receipts', receiptRouter)


export default app