import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    BeforeInsert,
    BeforeUpdate
} from "typeorm";
import { ThirdGoldRecordType } from "./enum/ThirdGoldRecordType.enum";
import { ThirdGoldRecordStatus } from "./enum/ThirdGoldRecordStatus.enum";
/**
 *  第三方上下分记录
 */
@Entity("Log_ThirdGoldRecord")
export class ThirdGoldRecord {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        name: "order_id",
        comment: "流水号"
    })
    orderId: string;

    @Column("varchar", {
        name: "fk_uid",
        comment: "用户编号外键"
    })
    uid: string;

    @Column({
        type: "enum",
        enum: ThirdGoldRecordType,
        default: ThirdGoldRecordType.Player,
        comment: "上下分对象"
    })
    type: number;

    @Column({
        nullable: true,
        comment: "平台名"
    })
    agentRemark: string;

    @Column({
        name: "gold_change_before",
        type:"double",
        default: 0,
        comment: "金币变化前数值"
    })
    goldChangeBefore: number;

    @Column({
        type: "double",
        default: 0,
        comment: "金币变化数值"
    })
    gold: number;

    @Column({
        type: "double",
        default: 0,
        comment: "金币变化后数值"
    })
    goldChangeAfter: number;

    @Column({
        type: "enum",
        enum: ThirdGoldRecordStatus,
        default: ThirdGoldRecordStatus.WaitingForReview,
        comment: "记录状态"
    })
    status: number;

    @Column({
        nullable: true,
        comment: "备注"
    })
    remark: string;

    @CreateDateColumn({
        comment: "创建时间"
    })
    createDateTime: Date;

    @UpdateDateColumn({
        nullable: true,
        comment: "最近修改时间"
    })
    updateDateTime: Date;

    @BeforeInsert()
    private initCreateDate() {
        this.createDateTime = new Date();
    }

    @BeforeUpdate()
    private updateDate() {
        this.updateDateTime = new Date();
    }
}
