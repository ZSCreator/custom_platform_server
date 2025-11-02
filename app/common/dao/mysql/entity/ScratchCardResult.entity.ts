import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate ,Index } from "typeorm";
import {IsDate} from "class-validator";
/**
 *  系统配置刮刮乐开奖表
 */
@Entity("Sys_ScratchCardResult")
export class ScratchCardResult {
    @PrimaryGeneratedColumn()
    id: number;
    /** 卡的编号 */
    @Index()
    @Column({ default: 0 })
    cardNum: string;
    /** 刮刮乐的结果集 */
    @Column({ default: "" })
    result: string;
    /** 赔率 */
    @Column("int", {
        default: 0
    })
    rebate: number;
    /** 奖池id */
    @Column()
    jackpotId: number;
    /**  数据状态 ，初始为0,如果被使用那么就变为1 然后不停的累加  */
    @Column({ default: 0 })
    status: number;

}
