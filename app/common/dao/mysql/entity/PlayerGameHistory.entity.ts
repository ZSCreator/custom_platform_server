import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column } from "typeorm";
import { GameNidEnum } from "../../../constant/game/GameNidEnum";
import { PlayerGameHistoryStatus } from "./enum/PlayerGameHistoryStatus.enum";

@Entity("Sp_PlayerGameHistory")
export class PlayerGameHistory {

    @PrimaryGeneratedColumn()
    id: number;

    /**
     * @property 所属玩家
     */
    @Column({ comment: "玩家编号" })
    uid: string;

    /**
     * @property 游戏编号
     * @description -1 表示在大厅
     */
    @Column('varchar', {
        comment: "游戏编号",
        length: 3,
        default: GameNidEnum.None
    })
    nid: GameNidEnum;

    /**
     * @property 游戏编号
     * @description -1 表示未进入选场
     */
    @Column({
        comment: "场编号",
        default: -1
    })
    sceneId: number;

    /**
     * @property 游戏编号
     * @description 000 表示没进入房间
     */
    @Column({
        comment: "房间编号",
        default: "000"
    })
    roomId: string;

    @Column({ comment: "携带金币" })
    gold: number;

    @Column({
        comment: "记录类别",
        type: "enum",
        enum: PlayerGameHistoryStatus,
        default: PlayerGameHistoryStatus.None
    })
    status: PlayerGameHistoryStatus;

    @CreateDateColumn({ comment: '创建时间' })
    createDateTime: string;

    @UpdateDateColumn({ comment: '更新时间' })
    updateDateTime: string;

}
