import { Sequelize } from "sequelize-typescript";

const db = new Sequelize({
    database: "bd_backend",
    dialect: "mysql",
    host: 'localhost',
    username: "root",
    password: "root", 
    models: [__dirname + '/../models'],
    logging: false,
});

export default db;
