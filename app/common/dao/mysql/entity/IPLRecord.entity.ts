import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, PrimaryColumn } from "typeorm";

@Entity("log_IPL_walletRecord")
export class IPLRecord {

    @PrimaryGeneratedColumn()
    id: number;

    /**
     * @property 玩家id
     */
    @PrimaryColumn("varchar", {
        length: 8,
        unique: true,
        comment: "本平台用户编号"
    })
    uid: string;

    /**
     * @property 第三方：板球用户id
     */
    @Column("varchar", {
        length: 100,
        comment: "板球平台用户编号"
    })
    userId: string;

    @Column("varchar", {
        length: 100,
        comment: "板球平台交易编号"
    })
    transfer_id: string;

    @Column("varchar", {
        length: 100,
        comment: "本平台交易编号"
    })
    customer_ref: string;

    @Column("varchar", {
        length: 100,
        comment: "平台编号"
    })
    merchant_code: string;

    @Column("varchar", {
        length: 100,
        comment: "交易日志编号"
    })
    wallet_log_id: string;

    @Column({
        comment: "旧余额"
    })
    old_balance: number;

    @Column({
        comment: "新余额"
    })
    new_balance: number;

    @Column("varchar", {
        length: 50,
        comment: "交易类型"
    })
    type: string;

    @Column({
        comment: "变化金额"
    })
    change: number;

    @CreateDateColumn({
        comment: "创建时间"
    })
    createTime: Date;
}

