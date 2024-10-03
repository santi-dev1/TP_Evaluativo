import path from "path";
import fs from "fs";
import { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import User from "../models/User.model";
import Receipt from "../models/Receipt.model";

const extensions = ["pdf"];


/**
 * Crea un recibo y sube un archivo PDF asociado a un usuario,
 * verifica si el tipo de archivo es correcto y si el usuario existe
 * 
 * @param {Request} req - Solicitud de Express con el PDF y id del usuario
 * @param {Response} res - Respuesta de Express
 * @returns {Promise<Response>} Devuelve un error o un mensaje de exito
 */
export const createReceipt = async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
        //Primero revisa si existe el usuario
        const userExist = await User.findByPk(userId);
        if (!userExist) return res.status(404).send("Usuario No Existe");

        //Revisa si hay un archivo
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(403).send("Archivo obligatorio");
        }

        const { file } = req.files as any;
        if (!file) {
            return res.status(403).send("Archivo obligatorio");
        }

        //Sube el archivo
        const nameAndExtension: string[] = file.name.split(".");
        const extension = nameAndExtension[nameAndExtension.length - 1];
        if (!extensions.includes(extension)) {
            return res.status(403).json({
                msg: `Archivo no valido, tipo de archivos permitidos: ${extensions}`,
            });
        }

        const tempName = uuid() + "." + extension;
        const uploadPath = path.join(__dirname, "../uploads/", tempName);
        file.mv(uploadPath, function (err: any) {
            if (err) {
                res.status(500).send("Error al subir el archivo");
            }
        });

        //Creo el recibo
        const receipt = await Receipt.create({
            ...req.body,
            userId: userExist.id,
            location: tempName,
        });
        await receipt.save();

        res.status(201).send("Recibo creado correctamente");
    } catch (error) {
        console.log(error);
    }
};

export const getReceipts = async (req: Request, res: Response) => {
    const receipts = await Receipt.findAll();
    res.status(200).json({ data: receipts });
};

/** DESCARGO UN RECIBO */
/**
 * Descarga el recibo por id, en el caso de ser un usuario el que lo quiere descargar
 * verifica si el recibo es de dicho usuario
 * 
 * @param {Request} req - Solicitud de Express con el id del recibo
 * @param {Response} res - Respuesta de Express.
 * @returns {Promise<Response>} Devuelve un error o descarga el archivo
 */
export const getReceiptById = async (req: Request, res: Response) => {
    const { receiptId } = req.params;
    try {
        //Vemos si el recibo existe
        const receipt = await Receipt.findByPk(receiptId);
        if (!receipt) return res.status(404).send("El Recibo no Existe");

        //Vemos si el recibo pertenece a el usuario
        if (req.user.rol === "user" && req.user.id !== receipt.userId) {
            return res.status(409).send("El Recibo no es tuyo");
        }

        //Armo la ruta de busqueda del archivo
        const pathFile = path.join(__dirname, "../uploads/", receipt.location);

        //Lo descargo
        return res.download(pathFile, (err) => {
            if (err) {
                console.error("Error al descargar el archivo:", err);
                return res.status(500).send("Error al descargar el archivo");
            }
        });
    } catch (error) {
        res.status(500).send("Ha ocurrido un error");
    }
};


export const getReceiptsByUser = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const receipts = await Receipt.findAll({ where: { userId } });
    const receipt = receipts[0];

    //Primero revisa si existe el usuario
    const userExist = await User.findByPk(userId);
    if (!userExist) return res.status(404).send("Usuario No Existe");


    //Vemos si el recibo pertenece a el usuario
    if (req.user.rol === "user" && receipt && req.user.id !== receipt.userId) return res.status(409).send("Los Recibos no son tuyos");


    res.status(200).json({ data: receipts });
};


/**
 * Elimina un recibo por su ID y borra el archivo asociado
 * 
 * @param {Request} req - Solicitud de Express con el id del recibo
 * @param {Response} res - Respuesta de Express
 * @returns {Promise<Response>} Devuelve error o un mensaje de exito
 */
export const deleteReceipt = async (req: Request, res: Response) => {
    const { receiptId } = req.params;

    try {
        const receipt = await Receipt.findByPk(receiptId);
        if (!receipt) return res.status(404).send('El Recibo no Existe');

        //Armo la ruta de busqueda del archivo
        const pathFile = path.join(__dirname, '../uploads/', receipt.location);

        //Borro el recibo de la base de datos
        await receipt.destroy();

        //Borrar el archivo
        fs.unlink(pathFile, () => { });


        return res.status(200).send('Recibo eliminado correctamente');
    } catch (err) {
        return res.status(500).send('Error al eliminar el recibo');
    }
};
