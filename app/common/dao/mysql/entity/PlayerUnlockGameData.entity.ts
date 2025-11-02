import { Entity, PrimaryGeneratedColumn, Column,CreateDateColumn } from "typeorm";

/**
 * @name 玩家解锁游戏
 */
@Entity("Sp_PlayerUnlockGameData")
export class PlayerUnlockGameData {

    @PrimaryGeneratedColumn()
    id: number;

    @Column("varchar", { length: 50, nullable: true , unique: true })
    uid: string;

    @Column("varchar", { length: 255, nullable: true })
    unlockGames: string;

    @CreateDateColumn({
        comment:"创建时间"
    })
    createTime: Date;
}
