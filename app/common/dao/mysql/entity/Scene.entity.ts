import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, AfterLoad } from "typeorm";

@Entity("Sys_Scene")
export class Scene {

    @PrimaryGeneratedColumn()
    id: number;

    /**
     * @property 游戏编号
     */
    @Column("varchar", {
        name: "game_id",
        length: 5,
        comment: "游戏编号"
    })
    nid: string;

    @Column({
        name: "scene_id",
        comment: "场编号"
    })
    sceneId: number;

    /**
     * @property 场名称
     */
    @Column("varchar", {
        name: "scene_name",
        length: 50,
        comment: "场名称"
    })
    name: string;

    @Column({
        name: "entry_cond_gold",
        default: -1,
        comment: "准入金额"
    })
    entryCond: number;

    @Column({
        name: "lower_bet",
        default: 0,
        comment: "最低下注额"
    })
    lowBet: number;

    @Column({
        name: "upper_bet",
        nullable: true,
        comment: "最高下注额"
    })
    capBet: number;

    @Column({
        name: "all_in_max_num",
        nullable: true,
        comment: "全下上限"
    })
    allinMaxNum: number;

    @Column({
        name: "room_count",
        default: 0,
        comment: "房间数量"
    })
    room_count: number;

    @Column({
        default: 0,
        comment: "前注"
    })
    ante: number;

    @Column("json", {
        comment: "可以携带的金币",
        nullable: true
    })
    canCarryGold: any;

    @Column("json", {
        comment: "大、小盲",
        nullable: true
    })
    blindBet: any;

    @Column({
        name: "bullet_value",
        default: 0,
        comment: "子弹价值"
    })
    bullet_value: number;

}
