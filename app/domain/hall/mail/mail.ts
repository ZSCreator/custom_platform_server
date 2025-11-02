'use strict';
/**
 *  邮件
 */

export default class Mail {
    img: string;            // 邮件的图片地址
    uid: string;            //uid
    sender: string;         //邮件发送者
    type: number;           // 邮件类型
    name: string;           //邮件昵称
    reason: string;         // 发送邮件的原因
    content: string;        //邮件的内容
    attachment: any;        //邮件的附件
    time: number;           // 邮件的发送时间
    isdelete: boolean;      //邮件是否删除
    isRead: boolean;        //邮件是否读取
    constructor(opts, uid?) {
        this.img= opts.img;
        this.uid = uid;
        this.sender= opts.sender;
        this.type= opts.type;
        this.name= opts.name;
        this.reason= opts.reason;
        this.content= opts.content;
        this.attachment= opts.attachment || { gold:0};
        this.time= Date.now();
        this.isRead= false;
        this.isdelete= false;
    }
}


