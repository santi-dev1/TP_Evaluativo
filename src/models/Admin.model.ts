import { Model, Column, DataType, Table } from "sequelize-typescript";


@Table({
    tableName: 'admins'
})

class Admin extends Model {
    @Column({
        type: DataType.STRING(100),
        allowNull: false
    })
    declare name: string

    @Column({
        type: DataType.STRING(),
        allowNull: false
    })
    declare email: string

    @Column({
        type: DataType.STRING(),
        allowNull: false
    })
    declare password: string

    @Column({
        type: DataType.STRING(),
        defaultValue: "admin"
    })
    declare rol: string
}

export default Admin