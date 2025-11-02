import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert } from "typeorm";

@Entity("Log_TelegramCustomer_record")
export class LogTelegramCustomerRecord {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        comment: "Sp_TelegramCustomer 表主键"
    })
    fk_telegramCustomer_id: number;


    @Column({
        comment: "创建时间"
    })
    createDateTime: Date;

    @BeforeInsert()
    private firstInsert() {
        this.createDateTime = new Date();
    }
}