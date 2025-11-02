'use strict';
const Utils = require('../../../utils');
const ManagerConst = require('../../../consts/managerConst');
/**
 * 客服
 */
export default class Customer {
	id: string;
	uid: string;
	content: any;
	replyContent: any;
	nickname: any;
	vip: any;
	inviteCode: any;
	isSolve: any;
	createTime: any;
	type: any;
	name: any;
	phone: any;
	qq: any;
	weixin: any;
	passStatus: any;

	constructor(opts) {
		this.id = opts.id || Utils.id();
		this.uid = opts.uid;
		this.content = opts.content;
		this.replyContent = opts.replyContent|| '--';  //客服回复信息
		this.nickname = opts.nickname;
		this.vip = opts.vip;
		this.inviteCode = opts.inviteCode;
		this.isSolve = opts.isSolve || ManagerConst.CUSTOMER_TYPE.NO_REPLY;     //1为没处理, 2为处理中 3为已处理 4为已回复
		this.createTime = opts.createTime || Date.now(); // 创建时间
		this.type = opts.type;            // 1: 意见反馈   2: 代理申请
		this.name = opts.name || '';      //代理申请人 姓名
		this.phone = opts.phone || null;  //代理申请人 电话号码
		this.qq = opts.qq || null;        // 代理申请人 qq号
		this.weixin = opts.weixin || null;
		this.passStatus = opts.passStatus || 0;  // 0:未处理 1:通过 2:拒绝
	}

}
