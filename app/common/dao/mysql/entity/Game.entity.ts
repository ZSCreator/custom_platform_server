import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
/**
 * @name 游戏配置信息表
 */
@Entity("Sys_Game")
export class Game {

    @PrimaryGeneratedColumn()
    id: number;

    @Column("varchar", {
        name: "game_id",
        length: 5,
        unique: true,
        comment: "游戏编号"
    })
    nid: string;

    @Column("varchar", {
        name: "name_en",
        length: 50,
        comment: "游戏英文名"
    })
    name: string;

    @Column("varchar", {
        name: "name_zh",
        length: 12,
        comment: "游戏中文名"
    })
    zname: string;

    @Column("boolean", {
        default: 1,
        comment: "游戏是否处于开放状态: 0 关; 1 开;默认 开"
    })
    opened: boolean;

    @Column("boolean", {
        default: 0,
        comment: "是否展示盘路列表: 0 关; 1 开;默认 关"
    })
    whetherToShowGamingInfo: boolean;

    @Column("boolean", {
        default: 0,
        comment: "是否展示场列表: 0 关; 1 开;默认 关"
    })
    whetherToShowScene: boolean;

    @Column("boolean", {
        default: 0,
        comment: "是否展示房间列表: 0 关; 1 开;默认 关"
    })
    whetherToShowRoom: boolean;

    @Column({
        name: "min_roomCount",
        type: "int",
        default: 1,
        comment: "房间数量: 默认1个"
    })
    roomCount: number;

    @Column({
        name: "max_playerCount_in_room",
        type: "int",
        default: 100,
        comment: "房间至多玩家数量: 默认100间"
    })
    roomUserLimit: number;

    @Column({
        type: "int",
        default: 0,
        comment: "人工介入排序: 默认0"
    })
    sort: number;
}
