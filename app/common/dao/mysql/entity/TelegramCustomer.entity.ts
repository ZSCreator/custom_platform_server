import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, AfterUpdate } from "typeorm";

@Entity("Sp_TelegramCustomer")
export class TelegramCustomer {

    @PrimaryGeneratedColumn()
    id: number;

    /**
      * @property 玩家id
      */
    @Column("varchar", {
        comment: "tele 链接"
    })
    url: string;

    @Column("varchar",{
        comment: "昵称",
        // default: 0
    })
    nickname: string;

    @Column({
        comment: "下发比例",
        default: 0
    })
    per: number;

    @Column({
        comment: "状态: 0停用,1启用",
        default: 0
    })
    status: number;

    @Column({
        comment: "创建时间"
    })
    createDateTime: Date;

    @Column({
        nullable: true,
        comment: "最近更新时间"
    })
    updateDateTime: Date;

    @BeforeInsert()
    private firstInsert() {
        this.createDateTime = new Date();
    }

    @AfterUpdate()
    private everyUpdate() {
        this.updateDateTime = new Date();
    }
}
