import { Request, Response, NextFunction} from "express";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { JWTPayload } from "../types";
import User from "../models/User.model";
import Admin from "../models/Admin.model";



/** EXPRESS VALIDATOR */
export const handleErrors = (req: Request, res: Response, next: NextFunction) => {
    let result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
    }
    next();
};



/** JWT VALIDATOR */
export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    //Extrae el token desde el header
    const auth = req.headers["authorization"];
    const token = auth && auth.split(" ")[1];

    //Verifica si esta vacío
    if (token == null) return res.status(401).send('Sin token en el header');

    try {
        //Verifica si el token es valido
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;

        //Revisa si el usuario del jwt existe en mi la base BD
        let user: Admin | User | null = await Admin.findByPk(decoded.id);

        if (!user) {
            user = await User.findByPk(decoded.id);
        }

        if (!user) {
            return res.status(409).send('Usuario no valido');
        }

    
        req.user = { id: decoded.id, email: decoded.email, rol: decoded.rol };
    } catch (error) {
        return res.status(403).send("Token no valido");
    }

    next();
};


/** AUTORIZACIONES DE USUARIOS */

export const isSuperAdmin = async (req: Request, res: Response, next: NextFunction) => {
    if (req.user.rol !== 'superadmin') {
        return res.status(403).send("Solo el superusuario esta autorizado");
    }
    next()
}


/* Verifica si el usuario del request es admin*/

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    if (req.user.rol !== 'admin' && req.user.rol !== 'superadmin') {
        return res.status(403).send("Solo administradores estan autorizados");
    }
    next()
}


/*Verifica si el usuario del request es user*/
export const isUser = async (req: Request, res: Response, next: NextFunction) => {
    if (req.user.rol !== 'superadmin' && req.user.rol !== 'admin' && req.user.rol !== 'user') {
        return res.status(403).send("No autorizado");
    }
    next()
}