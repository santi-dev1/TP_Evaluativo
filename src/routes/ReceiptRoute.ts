import { Router } from "express";
import { createReceipt, deleteReceipt, getReceiptById, getReceipts, getReceiptsByUser } from "../controllers/receipt";
import { handleErrors, isAdmin, isUser, verifyToken } from "../middlewares";
import { body, param } from "express-validator";


const router = Router()
router.use(verifyToken)


router.post('/:userId', 
    param('userId')
        .isInt({ gt: 0 }).withMessage('El ID del Usuario debe ser un número entero positivo'),
    body('description')
        .isString().withMessage('La descripcion debe ser un string')
        .trim().isLength({min: 5}).withMessage('Minimo 5 caracteres'),
    body('amount')
        .isInt({gt: 0}).withMessage('El monto debe ser un número'),
    isAdmin,
    handleErrors,
    createReceipt
)

router.get('/', isAdmin,getReceipts)

router.get('/:receiptId', 
    param('receiptId')
        .isInt({ gt: 0 }).withMessage('El ID del Recibo debe ser un número entero positivo'),
    isUser,
    handleErrors,
    getReceiptById
)

router.get('/user/:userId', 
    param('userId')
        .isInt({ gt: 0 }).withMessage('El ID del Usuario debe ser un número entero positivo'),
    isUser,
    handleErrors,
    getReceiptsByUser
)

router.delete('/:receiptId', 
    param('receiptId')
        .isInt({ gt: 0 }).withMessage('El ID del Recibo debe ser un número entero positivo'),
    isAdmin,
    handleErrors,
    deleteReceipt
)


export default router