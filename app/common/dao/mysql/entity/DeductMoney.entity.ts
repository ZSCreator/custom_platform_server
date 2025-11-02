import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from "typeorm";
/**
 *  @name 人工扣款表结构
 */
@Entity("Sp_DeductMoney")
export class DeductMoney {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        default: 0,
        comment: "扣款金额: 单位分"
    })
    total_fee: number;

    @Column({
        default: 0,
        comment: "钱包金额: 单位分"
    })
    walletGoldToGold: number;

    @Column("varchar", {
        name: "fk_uid",
        comment: "玩家编号"
    })
    @Index()
    uid: string;

    @Column({
        comment: "备注信息"
    })
    remark: string;

    @Column({
        default: 0,
        comment: "增加的金币"
    })
    addGold: number;

    @Column({
        default: 0,
        comment: "玩家当前身上的金币"
    })
    gold: number;

    @Column({
        comment: "客服编号"
    })
    customerId: string;

    @Column({
        default: 0,
        comment: "扣款完最后玩家身上的金币"
    })
    lastGold: number;

    @Column({
        default: 0,
        comment: "扣款过后玩家身上的钱包金币"
    })
    lastWalletGold: number;

    @CreateDateColumn({
        comment: "创建时间"
    })
    createDate: Date;

}
