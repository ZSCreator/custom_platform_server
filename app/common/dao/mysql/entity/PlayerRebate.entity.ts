import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn
} from "typeorm";
/**
 *  玩家获得返佣
 */
@Entity("Sp_PlayerRebate")
export class PlayerRebate {

    // @PrimaryGeneratedColumn()
    // id: number;

    /** uid */
    @PrimaryGeneratedColumn()
    uid: string;

    /** 总返佣 */
    @Column({ default: 0 })
    allRebate: number;

    /**  今日返佣 */
    @Column({  default: 0 })
    todayRebate: number;

    /** 昨日返佣 */
    @Column({ default: 0 })
    yesterdayRebate: number;

    /** 邀请人数  */
    @Column({ default: 0 })
    sharePeople: number;

    /**  今日邀请人数 */
    @Column({ default: 0 })
    dayPeople: number;

    /**  IPL  */
    @Column({ default: 0 })
    iplRebate: number;

    @CreateDateColumn({
        comment: "创建时间"
    })
    createDate: Date;




}
