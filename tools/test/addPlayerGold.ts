
import { RDSClient } from "../../app/common/dao/mysql/lib/RDSClient";
import * as Utils from "../../app/utils";
import PlayerManagerDao from "../../app/common/dao/daoManager/Player.manager";
import PayInfoMysqlDao from "../../app/common/dao/mysql/PayInfo.mysql.dao";
import OnlinePlayerRedisDao from "../../app/common/dao/redis/OnlinePlayer.redis.dao";
import * as msgService from "../../app/services/MessageService";
import GameRecordDateTableMysqlDao from "../../app/common/dao/mysql/GameRecordDateTable.mysql.dao";



async function ss() {
    await RDSClient.demoInit();
    console.warn(`脚本充值给玩家充值开始`)

    try {
        //给玩家充值的uid
        let uid = "xxxxxxx";
        //给玩家充值的金额，这里输入的金额还没有乘以100，比如100金币，这里输入100金币就可以了
        let orderPrice = 0;

        if(orderPrice > 100000){
            return ;
            process.exit();
        }

        const player = await PlayerManagerDao.findOne({ uid });
        if (!player) {
            return ;
            process.exit();
        }
        let gold = orderPrice * 100;

        let withdrawalChips = 0;
        if (player.withdrawalChips >= 0) {
            withdrawalChips = Math.floor(player.withdrawalChips + gold);
        } else if (player.withdrawalChips < 0) {
            withdrawalChips = Math.floor(gold);
        }


        // const payInfoParameter = {
        //     orderNumber: Utils.id(),
        //     attach: 'gold',
        //     groupRemark : null,
        //     customerId: "脚本充值",
        //     total_fee: Math.ceil(orderPrice * 100),
        //     remark: "脚本充值",
        //     uid,
        //     addgold: Math.ceil(orderPrice * 100) ,         // 获得金豆uid
        //     isUpdateGold: true,                    // 前端收到通知是否更新
        //     gold: player.gold,
        //     lastGold: Math.ceil(player.gold + gold),                            // 最后玩家身上的金币
        //     bonus: 0
        // };
        //
        // await PayInfoMysqlDao.insertOne(payInfoParameter);
        // 5.3 生成游戏记录
        const gameInfo = {
            uid: player.uid,				// 玩家 uid
            nid: "t1",				// 游戏ID
            gameName: "脚本补发",    			// 游戏名称
            groupRemark: player.groupRemark,
            thirdUid: player.thirdUid,
            group_id: player.group_id ? player.group_id : null,
            sceneId: -1,
            roomId: '-1',
            input: 0,    			// 押注金额
            bet_commission: 0,		// 押注抽水
            win_commission: 0,		// 赢取抽水
            settle_commission: 0,	// 结算抽水
            profit: gold,     		// 利润
            gold: Math.ceil(player.gold + gold),				// 当前金币
            status: 1,			// 记录状态
            gameOrder: Utils.id(),			// 订单编号
        };

        await GameRecordDateTableMysqlDao.insertOne(gameInfo);


        await PlayerManagerDao.updateOneForaddPlayerMoney(player.uid, {
            gold: gold,
            withdrawalChips: withdrawalChips,
            oneAddRmb: Math.floor(player.oneAddRmb + gold),
            addRmb: Math.floor(player.addRmb + gold),
            addDayRmb: Math.floor(player.addDayRmb + gold)

        });

        console.warn(`脚本充值给玩家uid:${uid}, 充值金额${orderPrice},充值完成`);
        process.exit();
    }catch (e) {
        process.exit();
        return;
    }



}

setTimeout(ss, 0);