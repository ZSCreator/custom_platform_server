import { Entity, PrimaryGeneratedColumn, Column,CreateDateColumn } from "typeorm";

/**
 * @name 热门游戏的统计
 */
@Entity("Sp_HotGameData")
export class HotGameData {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        comment: "游戏nid"
    })
    nid: string;

    @Column({
        comment: "游戏场"
    })
    sceneId: number;

    @Column({
        comment: "登陆人数"
    })
    playerNum: number;

    @Column({
        comment:"创建时间"
    })
    createTime: Date;
}
