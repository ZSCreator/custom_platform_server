'use strict';
import utils = require('../../utils');
import hallConst = require('../../consts/hallConst');
import MongoManager = require('../../common/dao/mongoDB/lib/mongoManager');


const payOrder = MongoManager.pay_order;
const payType = MongoManager.pay_type;

let pay_channel;//支付广播通道
let currShop;//商品配置
let payNoteConfig;//通知配置
let noteNum = [];
//设置支付消息通道
export const setChannelPay = async function (app) {
    pay_channel = app.channelService.createChannel(hallConst.PAY_CHANNEL);
    await getShopConfig();
    startPayNotice();
    //开启定时设置通知
    startTimerGetConfig();
}
//获取支付消息通道
export const getChannelPay = function () {
    return pay_channel;
}

//定时更新商品配置和播放配置
async function getShopAndNoteConfig() {
    const allPrice = MongoManager.system_shop_gold;//获取商品列表
    //获取商品配置
    const result = await allPrice.find({ isOpen: true, language: 'chinese' });

    //获取播放配置
    // const currConfig = MongoManager.pay_note_config;
    // let noteConfig: any = await currConfig.findOne({});
    // //如果没有使用默认配置播放
    // if (!noteConfig) {
    //     noteConfig = { chongzhi: 5, time: [1, 5], tixianBasic: 100, ratio: 100 };
    //     await currConfig.create(noteConfig);
    // }
    return Promise.resolve({ shopConfig: result, noteConfig: null });
}

//定时获取一次商品配置表
const getShopConfig = async function () {
    const { shopConfig, noteConfig } = await getShopAndNoteConfig();
    currShop = shopConfig;
    payNoteConfig = noteConfig;
    return Promise.resolve();
}

//开启定时更新配置
const startTimerGetConfig = function () {
    setInterval(() => {
        getShopConfig();
    }, 2 * 60 * 1000);
}
export const sendNotePay = function ({ uid, isChongzhi, gold, tixianGold }) {
    const data = {
        name: '玩家',
        uid: uid,
        content: isChongzhi ? utils.changeMoneyToGold(gold) : utils.changeMoneyToGold(tixianGold),
        type: isChongzhi ? 'chongzhi' : 'tixian'
    }
    if (noteNum.length >= 10) {
        noteNum.shift();
    }
    noteNum.push(data);
    const playerNum = pay_channel && pay_channel.getMembers();
    playerNum && playerNum.length && pay_channel.pushMessage('payNote', data);
}

//定时播放消息
const startPayNotice = function () {
    const time = 1000;

    function timer() {
        (payNoteConfig.time[0] > payNoteConfig.time[1]) && (payNoteConfig.time[0] = payNoteConfig.time[1]);
        let times = utils.random(payNoteConfig.time[0] * time, payNoteConfig.time[1] * time);
        setTimeout(() => {
            let isChongzhi = utils.random(1, 10) <= payNoteConfig.chongzhi ? true : false;
            const gold = currShop.length ? currShop[utils.random(0, currShop.length - 1)].gold : 100;
            const tixianGold = payNoteConfig.tixianBasic * payNoteConfig.ratio * utils.random(1, 10);

            //播放消息
            sendNotePay({ uid: utils.randomId(6), isChongzhi, gold, tixianGold });
            timer();
        }, times);
    }

    timer();
}


//获取历史数据
export const getNoteNum = function () {
    return noteNum;
}

//定时检查支付订单回调时间(自动排序并且更新，回调显示)
export const timerExamineOrder = async function () {
    setInterval(async () => {
        let order = await payOrder.find({ aisleId: { $exists: true }, callBackTime: { $exists: true } });
        const openPay = await payType.find({ isOpen: true });
        const beAisle = [], noAisle = [];
        openPay.forEach(m => {
            let opts = { aisleId: null, callBackSucceed: null, callBackAll: null, meanTime: null };
            let allOrder = order.filter(o => o.aisleId == m.id);//所有订单
            let currOrder: any = allOrder.filter(o => o.status == 1);//充值成功的订单
            let allTime = 0;
            opts.aisleId = m.id;
            opts.callBackSucceed = currOrder.length;
            opts.callBackAll = allOrder.length;
            if (currOrder.length) {
                //算平均时间
                currOrder.forEach(o => allTime += (o.callBackTime - o.time));
                opts.meanTime = allTime / currOrder.length;
                beAisle.push(opts);
            }
            !allOrder.length && noAisle.push({ aisleId: m.id });
        });
        //按平均时间升序排序
        beAisle.sort((a, b) => {
            return a.meanTime - b.meanTime
        });

        //把没有充值的通道排在最前面，让用户充值获取平均时间
        const isNoSort = noAisle.map(async (m, i) => {
            await payType.updateOne({ id: m.aisleId }, { $set: { sort: i + 1 } });
        });
        await Promise.all(isNoSort);
        //修改打开支付方式的排序规则
        const isBeSort = beAisle.map(async (m, i) => {
            await payType.updateOne({ id: m.aisleId }, {
                $set: {
                    sort: noAisle.length + 1 + i,
                    callBackDelay: m.meanTime.toFixed(2),
                    callBackSucceed: m.callBackSucceed,
                    callBackAll: m.callBackAll
                }
            });
        });
        await Promise.all(isBeSort);
    }, 2 * 60 * 1000)
}

