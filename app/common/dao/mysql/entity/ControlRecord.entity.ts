import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert } from "typeorm";
import { ControlRecordType } from "../../../../services/newControl/DAO/controlRecordDAO";

@Entity("Sp_ControlRecord")
export class ControlRecord {

    @PrimaryGeneratedColumn()
    id: number;

    @Column("varchar", {
        name: "game_id",
        length: 5,
        nullable: true,
        comment: "游戏编号"
    })
    nid: string;

    @Column("varchar", {
        length: 50,
        comment: "操作人名字"
    })
    name: string;

    @Column('varchar', {
        length: 2,
        comment: "操作类型 1 类型为场控个人调控 | 2 个人调控总控 | 3 场控",
    })
    type: ControlRecordType;

    @Column('json', {
        comment: "调控数据详情",
        nullable: true,
    })
    data: object;


    @Column("varchar", {
        length: 50,
        comment: "备注",
        nullable: true
    })
    remark: string;

    @Column('varchar', {
        length: 20,
        comment: "被调控玩家的uid",
        nullable: true
    })
    uid: string;

    @Column({
        comment: "创建时间"
    })
    createTime: Date;

    @BeforeInsert()
    private init() {
        this.createTime = new Date();
    }

}
