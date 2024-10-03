import { Model, Column, DataType, Table, ForeignKey, BelongsTo } from "sequelize-typescript";
import User from "./User.model";


@Table({
    tableName: 'receipts',
    paranoid: true 
})

class Receipt extends Model {

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare location: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare description: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    declare amount: number;

    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    declare userId: number;

    @BelongsTo(() => User)
    declare user: User;
}

export default Receipt