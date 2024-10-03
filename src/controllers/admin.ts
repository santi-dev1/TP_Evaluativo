import { Request, Response } from "express";
import Admin from "../models/Admin.model";
import { hashPassword } from "../helpers";
import User from "../models/User.model";


export const getAdmins = async (req: Request, res: Response) => {
    const users = await Admin.findAll()
    res.json({data: users})
}

export const getAdminById = async (req: Request, res: Response) => {
    const {adminId} = req.params
    try {
        //Ve si el usuario existe
        const admin = await Admin.findByPk(adminId)
        if(!admin) return res.status(404).send('El Admin no existe') 

        res.status(200).json({data: admin})
    } catch (error) {
        res.status(500).send('Se ha producido un error')
    }
}

export const createAdmin = async (req: Request, res: Response) => {
    const {email, password} = req.body

    //Ve si el usuario ya existe
    let exist : User | Admin | null = await User.findOne({where: {email}})
    if(!exist) exist = await Admin.findOne({where: {email}})
    
    if(exist) return res.status(409).send('El Usuario ya existe')

    const user = await Admin.create(req.body)

    user.password = await hashPassword(password)

    await user.save()

    return res.status(201).json({data: {user: user.name, email}})
}

export const updateAdmin = async (req: Request, res: Response) => {
    const {adminId} = req.params
    try {
        //Ve si el usuario existe
        const admin = await Admin.findByPk(adminId)
        if(!admin) return res.status(404).send('El Admin no existe') 

        await admin.update(req.body)
        await admin.save()
        
        res.status(200).json({data: admin})
    } catch (error) {
        res.status(500).send('Se ha producido un error')
    }
}

export const deleteAdmin = async (req: Request, res: Response) => {
    const {adminId} = req.params
    try {
        //Vem si el usuario existe
        const admin = await Admin.findByPk(adminId)
        if(!admin) return res.status(404).send('El Admin no existe') 

        //Ve si no es el superusuario
        if(admin.rol === 'superadmin'){
            return res.status(409).send('No se puede eliminar el superusuario') 
        }

        admin.destroy()

        res.status(200).send('Admin eliminado')
    } catch (error) {
        res.status(500).send('Se ha producido un error')
    }
}


/* Crea un superusuario*/
const createSuperAdmin = async () => {
    const superUser = await Admin.findOne({where: {rol: 'superadmin'}})
    const password = await hashPassword('superadmin')
    if(!superUser) {
        Admin.create({
            name: 'superadmin',
            email: 'super@super.com',
            password,
            rol: 'superadmin'
        })
    }
}

createSuperAdmin()