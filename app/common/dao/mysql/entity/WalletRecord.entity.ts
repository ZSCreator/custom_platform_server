import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate } from "typeorm";
import { IsDate } from "class-validator";
/**
 *  大厅转保险箱的记录
 */
@Entity("Sp_WalletRecord")
export class WalletRecord {

    @PrimaryGeneratedColumn()
    id: number;
    /** 
     * @property 玩家编号
     */
    @Column()
    uid: string;

    /** 操作类型 */
    @Column("int",{ default: 0 })
    op_type: number;

    /** 操作金额 */
    @Column("int",{ default: 0 })
    changed_gold: number;

    /** 操作后身上金币 */
    @Column("int",{ default: 0 })
    curr_gold: number;

    /**  操作后钱包金币 */
    @Column("int",{ default: 0 })
    curr_wallet_gold: number;

    /** 创建时间 */
    @Column()
    @IsDate()
    createDate: Date;

    @BeforeInsert()
    private initCreateDate() {
        // this.createDate = moment().format("YYYY年MM月DD日 HH:mm:ss");
        this.createDate = new Date();
    }



}
