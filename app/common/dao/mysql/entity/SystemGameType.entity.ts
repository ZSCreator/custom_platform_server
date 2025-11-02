import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate } from "typeorm";

@Entity("Sys_SystemGameType")
export class SystemGameType {

    @PrimaryGeneratedColumn()
    id: number;
    /** 游戏类型Id  1 ,2,3,4,5 */
    @Column()
    typeId: number;
    /** 序号 1 ,2,3,4,5 */
    @Column()
    sort: number;
    /** 是否显示 */
    @Column()
    open: boolean;
    /** 游戏分类名称 */
    @Column()
    name: string;
    /** nid 的集合 [1,2,3,4,4,5]  */
    @Column("varchar", { length: 255, default: "" })
    nidList: string;
    /** 热门游戏nid 的集合 [1,2,3,4,4,5]  */
    @Column("varchar", { length: 255, default: "" })
    hotNidList: string;
}
