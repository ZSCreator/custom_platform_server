import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
/**
 *  后台管理系统创建角色
 */
@Entity("Sys_SystemRole")
export class SystemRole {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        default: 0,
        comment: "系统角色名称"
    })
    roleName: string;
    @Column({
        default: 0,
        comment: "角色排序"
    })
    sort: number;
    @Column({
        default: 0,
        comment: "角色编码"
    })
    role: string;
    @Column({
        default: 0,
        comment: "角色等级"
    })
    roleLevel: number;
    @Column("json",{
        nullable: true,
        comment: "角色拥有哪些菜单"
    })
    roleMenu: any;

    @Column("json",{
        nullable: true,
        comment: "角色拥有哪些请求路由"
    })
    roleRoute: any;





}
