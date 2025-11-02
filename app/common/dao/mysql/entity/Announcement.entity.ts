import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert,CreateDateColumn } from "typeorm";

/**
 * @name 公告
 */
@Entity("Sp_Announcement")
export class Announcement {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        comment: "公告内容"
    })
    content: string;

    @Column({
        default: 0,
        comment: "是否关闭0 弹出 1 就是打开 2 就是关闭"
    })
    openType: number;

    @Column({
        default: 0,
        comment: "公告排序"
    })
    sort: number;

    @Column({
        default: 0,
        comment: "公告标题"
    })
    title: string;

    @CreateDateColumn({
        comment:"创建时间"
    })
    createDate: Date;
}
