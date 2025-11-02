import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn} from "typeorm";
/**
 *  玩家提现记录
 */
@Entity("Sp_PlayerCashRecord")
export class PlayerCashRecord {

    @PrimaryGeneratedColumn()
    id: number;
    /**
     * @property 玩家uid
     */
    @Column()
    uid: string;
    /** 
     * @property 银行卡卡号
     */
    @Column()
    bankCardNo: string;

    /**
     * @property 分代号
     */
    @Column("varchar", {
        nullable: true, length: 20
    })
    groupRemark: string;


    /** 开户行 */
    @Column()
    bankName: string;

    /** IFSC CODE（金融系统码） */
    @Column()
    ifscCode: string;

    /**  邮件 */
    @Column()
    email: string;

    /** 银行卡用户名 */
    @Column()
    bankUserName: string;

    /** 提现类型 1 bank  2 UPI */
    @Column()
    type: number;


    /** 累计提现 不包含这次为分*/
    @Column()
    allCash: number;


    /** 累计充值  单位为分*/
    @Column()
    allAddRmb: number;

    /** 本次提现  单位为分*/
    @Column()
    money: number;

    /** 谁通过审核*/
    @Column({ nullable: true  })
    checkName: string;

    /** 订单号*/
    @Column({ default: 0 })
    orderNo: string;

    /** 订单审核状态 0为未审核  1为已审核通过 2为审核不通过               10 为订单审核中*/
    @Column({ default: 0 })
    orderStatus: number;

    /** 汇款状态  0 为默认没汇款 1 为已汇款  2 为出款失败  3 为出款中    10  "挂单" */
    @Column({ default: 0 })
    cashStatus: number;

    /** 谁汇款 */
    @Column({ nullable: true  })
    remittance: string;


    /** 提现前金币 */
    @Column({ default: 0 })
    startGold: number;

    /** 剩余金币 */
    @Column({ default: 0 })
    lastGold: number;

    /** 代付商家 */
    @Column({ nullable: true })
    payAccountName: string;

    /** 是否自动代付   0 标识默认不代付*/
    @Column({ default: 0 })
    payFlag: boolean;

    /** 拒绝理由 */
    @Column({ nullable: true})
    content: string;

    /** 玩家总流水 */
    @Column({ default: 0 })
    flowCount: number;

    /** 提现手续费 */
    @Column({ default: 0 })
    rebateGold: number;

    @CreateDateColumn({
        comment: "创建时间"
    })
    createDate: Date;


}
