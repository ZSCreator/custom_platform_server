import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert,CreateDateColumn } from "typeorm";

/**
 * @name 推广页面下载记录，记录点击量以及玩家登陆数
 */
@Entity("Sp_PromoteDown")
export class PromoteDown {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        nullable: true,
        comment: "邀请码"
    })
    inviteCode: string;

    @Column({
        nullable: true,
        comment: "渠道备注"
    })
    platformName: string;

    @Column({
        nullable: true,
        comment: "设备名称 ios android"
    })
    rom_type: string;

    @Column({
        default: 0,
        comment: "创建状态，如果玩家登陆了就为 1，否则默认为0"
    })
    status: number;

    @Column({
        nullable: true,
        comment: "手机id"
    })
    phoneId: string;

    @CreateDateColumn({
        comment:"创建时间"
    })
    createDate: Date;
}
