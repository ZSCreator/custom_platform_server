import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, AfterUpdate } from "typeorm";

@Entity("Sp_BonusPoolHistory")
export class BonusPoolHistory {

    @PrimaryGeneratedColumn()
    id: number;

    @Column("varchar", {
        name: "game_id",
        length: 5,
        comment: "游戏编号"
    })
    nid: string;

    @Column('varchar', {
        name: 'game_name',
        length: 50,
        comment: '游戏名字'
    })
    gameName: string;

    @Column({
        name: "scene_id",
        comment: "场编号"
    })
    sceneId: number;

    @Column("varchar", {
        name: "scene_name",
        length: 50,
        comment: "场名称"
    })
    sceneName: string;

    @Column({
        comment: "公共奖池 当前金额",
        default: 0,
    })
    bonus_amount: number;

    @Column({
        comment: "调控池 当前金额",
        default: 0,
    })
    control_amount: number;

    @Column({
        comment: "盈利池 当前金额",
        default: 0,
    })
    profit_amount: number;

    @Column({
        comment: "创建时间"
    })
    createDateTime: Date;

    @Column({
        nullable: true,
        comment: "最近更新时间"
    })
    updateDateTime: Date;

    @BeforeInsert()
    private firstInsert() {
        this.createDateTime = new Date();
    }

    @AfterUpdate()
    private everyUpdate() {
        this.updateDateTime = new Date();
    }
}
