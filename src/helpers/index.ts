import { exit } from 'node:process'
import dotenv from 'dotenv'
import jwt from "jsonwebtoken";
import db from '../config/db';
import { Payload } from "../types";
import bcrypt from 'bcrypt'

dotenv.config()

/*Genera un JWT que dura 90 días utilizando una palabra secreta*/
export function generateToken(payload: Payload) {
    const options = {
        expiresIn: "90d",
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, options);
    return token;
}

/*Hashea la contraseña con bcrypt y un salt de 10*/
export const hashPassword = async (password: string) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

/*Verifica si la contraseña hasheada es correcta*/
export const checkPassword = async (enteredPassword: string, storedHash: string) => {
    return await bcrypt.compare(enteredPassword, storedHash)
}