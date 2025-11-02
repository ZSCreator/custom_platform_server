import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { GameCommissionTargetObjectEnum } from "../../../constant/hall/GameCommissionTargetObjectEnum";
import { GameCommissionWayEnum } from "../../../constant/hall/GameCommissionWayEnum";
/**
 *  @name 人工扣款表结构
 */
@Entity("Sp_GameCommission")
export class GameCommission {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        comment: "游戏编号"
    })
    nid: string;

    @Column({
        default: GameCommissionWayEnum.None,
        comment: "佣金方式"
    })
    way: number;

    @Column({
        default: GameCommissionTargetObjectEnum.Player,
        comment: "佣金对象"
    })
    targetCharacter: number;

    @Column("double", {
        default: 0,
        comment: "下注佣金比例比例 0-1"
    })
    bet: number;

    @Column("double", {
        default: 0,
        comment: "赢取比例 0-1"
    })
    win: number;

    @Column("double", {
        default: 0,
        comment: "结算比例 0-1"
    })
    settle: number;
    
    @Column({ 
        default: 0 ,
        comment:"是否开启: 0 关; 1 开; 默认关"
    })
    open: boolean;

}
