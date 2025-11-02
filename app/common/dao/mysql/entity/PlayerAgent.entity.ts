import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

/**
 * 玩家、代理关系表
 */
@Entity("Sp_Player_Agent")
export class PlayerAgent {

    @PrimaryGeneratedColumn()
    id: number;

    @Column("varchar", {
        name: "fk_uid",
        length: 8,
        unique: true,
        comment: "自有平台玩家编号"
    })
    uid: string;

    // @Column("varchar", {
    //     name: "third_uid",
    //     length: 8,
    //     unique: true,
    //     comment: "第三方平台玩家编号"
    // })
    // thirdUid: string;

    // @Column("varchar", {
    //     name: "invite_code",
    //     comment: "邀请码"
    // })
    // inviteCode: string;

    @Column("varchar", {
        name: "platform_name",
        length: 50,
        default: "",
        unique: true,
        comment: "平台名称"
    })
    platformName: string;

    @Column({
        name: "platform_gold",
        default: 0,
        type: "double",
        comment: "平台金币"
    })
    platformGold: number;

    @Column("varchar", {
        name: "root_uid",
        length: 8,
        comment: "根玩家编号"
    })
    rootUid: string;

    @Column("varchar", {
        name: "parent_uid",
        length: 8,
        comment: "上级玩家编号"
    })
    parentUid: string;

    @Column({
        name: "deep_level",
        comment: "关系层级"
    })
    deepLevel: number;

    @Column({
        name: "role_type",
        default: 1,
        comment: "关系类型 1: 玩家；2: 平台; 3: 代理"
    })
    roleType: number;

    @Column({
        default: 1,
        comment: "关系状态 1: 启用; 2: 停用"
    })
    status: number;

    @Column({
        default: 'chinese_zh',
        comment: "语言类型"
    })
    language: string;


    @Column({
        nullable: true,
        comment: "关闭的游戏有哪些"
    })
    closeGameList: string;


    @CreateDateColumn()
    createDateTime: string;
}
