import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate } from "typeorm";
import { IsDate } from "class-validator";
/**
 *  玩家充值记录
 */
@Entity("Sp_PayInfo")
export class PayInfo {

    @PrimaryGeneratedColumn()
    id: number;
    /**
     * @property 充值订单编号
     */
    @Column({})
    orderNumber: string;
    /** 
     * @property 玩家编号
     */
    @Column("varchar", {
        name: "fk_uid"
    })
    uid: string;

    /** 充值类型 */
    @Column({ nullable: true })
    attach: string;

    /** 充值金额（分） */
    @Column({ default: 0 })
    total_fee: number;

    /**  备注信息 */
    @Column({ nullable: true })
    remark: string;

    /**  新增多少金币+ 彩金  */
    @Column({ default: 0 })
    addgold: number;

    /**  充值钱金币 */
    @Column({ default: 0 })
    gold: number;

    /**  客服Id */
    @Column({ nullable: true })
    customerId: string;

    /**  充值过后身上的金币 */
    @Column({ default: 0 })
    lastGold: number;

    /**  充值过后身上的金币 */
    @Column({ default: false })
    isUpdateGold: boolean;

    /**  带入金额  单位为分 */
    @Column({ default: -1 })
    aisleId: number;

    /**  赠送彩金  单位为分 */
    @Column({ default: 0 })
    bonus: number;

    // /**
    //  * @property 分代号
    //  */
    //  @Column("varchar", {
    //     nullable: true, length: 20
    // })
    // groupRemark: string;

    /** 创建时间 */
    @Column()
    @IsDate()
    createDate: Date;

    /** 更新时间 */
    @Column({ nullable: true })
    @IsDate()
    updatedDate: Date | null;

    @BeforeInsert()
    private initCreateDate() {
        // this.createDate = moment().format("YYYY年MM月DD日 HH:mm:ss");
        this.createDate = new Date();
    }

    @BeforeUpdate()
    private updateDate() {
        this.updatedDate = new Date();
    }

}
