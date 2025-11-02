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
@Entity("Log_PlatformForAgentGold")
export class PlatformForAgentGold {
    @PrimaryGeneratedColumn()
    id: number;


    @Column("varchar", {
        comment: "操作人"
    })
    userName: string;

    @Column({
        nullable: true,
        comment: "平台号"
    })
    platformName: string;

    @Column({
        nullable: true,
        comment: "代理号"
    })
    agentName: string;

    @Column({
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
        nullable: true,
        comment: "备注"
    })
    remark: string;

    @CreateDateColumn({
        comment: "创建时间"
    })
    createDateTime: Date;



}
