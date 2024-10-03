import {Router} from 'express'
import { body, param } from 'express-validator'
import { handleErrors, isAdmin, isUser, verifyToken } from '../middlewares'
import { createUser, deleteUser, getUserById, getUsers, updateUser } from '../controllers/user'


const router = Router()
router.use(verifyToken, isAdmin)

router.post('/register', 
    body('name')
        .isString().withMessage('El nombre debe ser un string')
        .trim().isLength({min: 5, max: 15}).withMessage('Minimo 5 caracteres, maximo 15'),

    body('email')
        .trim()
        .isEmail().withMessage('Ingrese un correo valido'),
    
    body('password')
        .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
        .matches(/\d/).withMessage('La contraseña debe tener al menos un número')
        .matches(/[A-Za-z]/).withMessage('La contraseña debe contener al menos una letra'),
    handleErrors,
    createUser
)

router.get('/', getUsers)

router.get('/:userId', 
    param('userId')
        .isInt({ gt: 0 }).withMessage('El ID del Usuario debe ser un número entero positivo'),
    handleErrors,
    getUserById
)

router.put('/:userId',
    param('userId')
        .isInt({ gt: 0 }).withMessage('El ID del Usuario debe ser un número entero positivo'), 
    body('name')
        .isString().withMessage('El nombre debe ser un string')
        .trim().isLength({min: 5, max: 15}).withMessage('Minimo 5 caracteres, maximo 15'),

    body('email')
        .trim()
        .isEmail().withMessage('Ingrese un email valido'),
    
    body('password')
        .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
        .matches(/\d/).withMessage('La contraseña debe contener al menos un número')
        .matches(/[A-Za-z]/).withMessage('La contraseña debe contener al menos una letra'),
    handleErrors,
    updateUser
)

router.delete('/:userId', 
    param('userId')
        .isInt({ gt: 0 }).withMessage('El ID del Usuario debe ser un número entero positivo'),
    handleErrors,
    deleteUser
)

export default router