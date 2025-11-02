import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate } from "typeorm";
import { IsDate } from "class-validator";
/**
 *  玩家充值记录
 */
@Entity("Sp_PayOrder")
export class PayOrder {

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

    /** 充值金额（分） */
    @Column({ default: 0 })
    money: number;

    /**  备注信息 */
    @Column({ nullable: true })
    remark: string;

    /**  支付通道  */
    @Column({ nullable: true })
    platform: string;

    /**  支付类型  */
    @Column({ nullable: true })
    payType: string;

    /**  状态回调 */
    @Column({ default: 0 })
    status: number;

    /**  附加信息 */
    @Column({ default: 0 })
    field1: string;

    /**  商品Id */
    @Column({ default: -1 })
    shopId: string;

    /**  不发状态 */
    @Column({ default: 0 })
    reissue: boolean;

    /**  是否锁定 */
    @Column({ default: 0 })
    isLock: boolean;

    /**  回调事件 */
    @Column({ nullable: true })
    callBackTime: Date;

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
