import {Router} from 'express'
import { body, param } from 'express-validator'
import { getAdmins, createAdmin, updateAdmin, deleteAdmin, getAdminById } from '../controllers/admin'
import { handleErrors, isAdmin, isSuperAdmin, verifyToken } from '../middlewares'


const router = Router()


router.use(verifyToken, isSuperAdmin)

router.get('/', getAdmins)

router.get('/:adminId', 
    param('adminId')
        .isInt({ gt: 0 }).withMessage('El ID del Admin debe ser un número entero positivo'),
    handleErrors,
    getAdminById
)

router.post('/register', 
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
    createAdmin
)

router.put('/:adminId',
    param('adminId')
        .isInt({ gt: 0 }).withMessage('El ID del Admin debe ser un número entero positivo'), 
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
    updateAdmin
)

router.delete('/:adminId', 
    param('adminId')
        .isInt({ gt: 0 }).withMessage('El ID del Admin debe ser un número entero positivo'),
    handleErrors,
    deleteAdmin
)


export default router