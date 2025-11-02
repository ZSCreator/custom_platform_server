import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn} from "typeorm";
/**
 *  玩家日签记录
 */
@Entity("Sp_SignRecord")
export class SignRecord {

    @PrimaryGeneratedColumn()
    id: number;
    /**
     * @property 玩家uid
     */
    @Column()
    uid: string;
    /** 
     * @property 日签到类型 ，1为日签 2为周签 3为月签
     */
    @Column()
    type: number;

    /** 领取前金币 */
    @Column()
    beginGold: number;

    /** 领取后金币 */
    @Column()
    lastGold: number;

    /**  领取金币 */
    @Column()
    gold: number;

    @CreateDateColumn({
        comment: "创建时间"
    })
    createDate: Date;


}
