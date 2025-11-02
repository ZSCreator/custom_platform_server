import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate } from "typeorm";
import {IsDate} from "class-validator";
/**
 *  后台管理系统菜单栏
 */
@Entity("Sys_SystemMenu")
export class SystemMenu {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        default: 0,
        comment: "菜单名字"
    })
    menuName: string;
    @Column({
        default: 0,
        comment: "菜单排序"
    })
    sort: number;
    @Column({
        default: 0,
        comment: "菜单等级  1为主菜单  2 为测菜单"
    })
    menuLevel: number;
    /**  菜单编码， */
    @Column({
        unique: true,
        comment: "菜单编码 : 11,12"
    })
    menuNum: string;

    /**  对应前端网页编码 */
    @Column({
        nullable: true,
        comment: "对应前端网页编码"
    })
    webIndex: string;

    /**  编码图标 */
    @Column({
        nullable: true,
        comment: "编码图标"
    })
    menuCoin: string;

    /**  上一层菜单编码， */
    @Column({
        nullable: true,
        comment: "上一层菜单编码"
    })
    parentMenuNum: string;


}
