import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate, AfterLoad } from "typeorm";

@Entity("Sys_Room")
export class Room {

    @PrimaryGeneratedColumn()
    id: number;

    @Column("varchar", {
        name: "backend_server_id",
        comment: "后端服务器编号"
    })
    serverId: string;

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

    @Column("varchar", {
        name: "room_id",
        comment: "房间编号"
    })
    roomId: string;

    @Column({
        default: 0,
        comment: "基础奖池"
    })
    jackpot: number;

    @Column({
        name: "running_pool",
        default: 0,
        comment: "流水池"
    })
    runningPool: number;

    @Column({
        name: "profit_pool",
        default: 0,
        comment: "盈利池"
    })
    profitPool: number;

    @Column({
        default: true,
        comment: "是否开放"
    })
    open: boolean;

    @Column("json", {
        name: "jackpot_show",
        comment: "奖池显示配置",
        nullable: true
    })
    jackpotShow: any;

    @Column({
        name: "create_datetime",
        comment: "创建时间"
    })
    createTime: Date;

    @Column({
        name: "update_datetime",
        nullable: true,
        comment: "最近修改时间"
    })
    updateTime: Date;

    @Column('json',{
        name: "room_history",
        nullable: true,
        comment: "房间记录"
    })
    history: any;

    @Column('json',{
        nullable: true,
        comment: "扩展字段"
    })
    extension: any;

    @BeforeInsert()
    private beforeInsert() {
        this.createTime = new Date();
    }

    @BeforeUpdate()
    private beforeUpdate() {
        this.updateTime = new Date();
    }

    @Column("int",{
        name: "kind",
        comment: "租户隔离分组",
        default: 0,
    })
    kind: number;
}
