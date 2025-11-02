import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate } from "typeorm";
/**
 *  游戏的预警事件
 */
@Entity("Sp_AlarmEventThing")
export class AlarmEventThing {

    @PrimaryGeneratedColumn()
    id: number;

    @Column("varchar", {
        name: "fk_uid",
        comment: "玩家编号"
    })
    uid: string;

    @Column({
        comment: "第三方uid",
        length: 50,
        nullable: true
    })
    thirdUid: string;

    @Column({
        comment: "游戏名称"
    })
    gameName: string;

    @Column({
        comment: "游戏编号"
    })
    nid: string;

    @Column({
        default: 1,
        comment: "报警事件: 1 为玩家事件 2 为游戏启动事件"
    })
    thingType: number;

    @Column({
        comment: "玩家事件类型: 1为单次下注大于; 2 为赢取大于; 3 为赢取/带入大于"
    })
    type: number;

    @Column({
        default: 0,
        comment: "报警事件是否已经处理: 0 为未处理; 1 为已处理;"
    })
    status: number;

    @Column({
        default: 0,
        comment: "下注金额,单位为分"
    })
    input: number;

    @Column({
        default: 0,
        comment: "赢取金额,单位为分"
    })
    win: number;

    @Column({
        default: 0,
        comment: "带入一次的累计赢取金额,单位为分"
    })
    oneWin: number;

    @Column({
        default: 0,
        comment: "最近一次带入金额,单位为分"
    })
    oneAddRmb: number;

    @Column({
        default: 0,
        comment: "当日累计赢取金额"
    })
    dayWin: number;

    @Column({
        comment: "场编号"
    })
    sceneId: number;

    @Column({
        comment: "处理人"
    })
    managerId: string;

    /** 创建时间 */
    @Column()
    createDate: Date;

    /** 更新时间 */
    @Column({ nullable: true })
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
