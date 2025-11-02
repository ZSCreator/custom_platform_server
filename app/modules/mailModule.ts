'use strict';
import utils = require('../utils');
import MailService = require('../services/MailService');
import PlayerManagerDao from '../common/dao/daoManager/Player.manager';
import MailEnum = require('../common/constant/hall/MailEnum');
import langsrv = require('../services/common/langsrv');

import { BaiRenRoomImpl } from "../servers/bairen/lib/BaiRenRoomImpl";
import { BaiRenPlayerImpl } from "../servers/bairen/lib/BaiRenPlayerImpl";
import qznnPlayer from "../servers/qznn/lib/qznnPlayer";
import wrjhPlayer from "../servers/WanRenJH/lib/wrjhPlayer";

const gconf = { GOLD_NID: 1000 };

const CARDTYPE_STR = function (players, index) {
    let niuniu = {
        0: langsrv.getlanguage(players.language, langsrv.Net_Message.id_1072),
        1: langsrv.getlanguage(players.language, langsrv.Net_Message.id_1073),
        2: langsrv.getlanguage(players.language, langsrv.Net_Message.id_1074),
        3: langsrv.getlanguage(players.language, langsrv.Net_Message.id_1075),
        4: langsrv.getlanguage(players.language, langsrv.Net_Message.id_1076),
        5: langsrv.getlanguage(players.language, langsrv.Net_Message.id_1077),
        6: langsrv.getlanguage(players.language, langsrv.Net_Message.id_1078),
        7: langsrv.getlanguage(players.language, langsrv.Net_Message.id_1079),
        8: langsrv.getlanguage(players.language, langsrv.Net_Message.id_1080),
        9: langsrv.getlanguage(players.language, langsrv.Net_Message.id_1071),
        10: langsrv.getlanguage(players.language, langsrv.Net_Message.id_1082),
        11: langsrv.getlanguage(players.language, langsrv.Net_Message.id_1083),
        12: langsrv.getlanguage(players.language, langsrv.Net_Message.id_1083),
        13: langsrv.getlanguage(players.language, langsrv.Net_Message.id_1084)
    };
    return niuniu[index]
}
const CARDTYPE_STR_JH = function (players, index) {
    let jinhua = {
        0: langsrv.getlanguage(players.language, langsrv.Net_Message.id_2027),
        1: langsrv.getlanguage(players.language, langsrv.Net_Message.id_2028),
        2: langsrv.getlanguage(players.language, langsrv.Net_Message.id_2029),
        3: langsrv.getlanguage(players.language, langsrv.Net_Message.id_2030),
        4: langsrv.getlanguage(players.language, langsrv.Net_Message.id_2031),
        5: langsrv.getlanguage(players.language, langsrv.Net_Message.id_2032),
    };
    return jinhua[index]
}

/**
 * 游戏中断 - 百人牛牛
 */
export async function changeGoldsByMail(roomInfo: BaiRenRoomImpl, playerInfo: BaiRenPlayerImpl) {
    try {
        //判断是否是庄家
        const isZhuang = playerInfo.uid === roomInfo.zhuangInfo.uid;
        let language = playerInfo.language;
        const gainStr = playerInfo.profit;

        const iswin0 = roomInfo.lotterys[0].isWin;
        const iswin1 = roomInfo.lotterys[1].isWin;
        const iswin2 = roomInfo.lotterys[2].isWin;
        const iswin3 = roomInfo.lotterys[3].isWin;

        let num0 = isZhuang ? roomInfo.situations.find(c => c.area == 0).totalBet : playerInfo.betList[0].bet;
        let num1 = isZhuang ? roomInfo.situations.find(c => c.area == 1).totalBet : playerInfo.betList[1].bet;
        let num2 = isZhuang ? roomInfo.situations.find(c => c.area == 2).totalBet : playerInfo.betList[2].bet;
        let num3 = isZhuang ? roomInfo.situations.find(c => c.area == 3).totalBet : playerInfo.betList[3].bet;
        num0 && (num0 = utils.changeMoneyToGold(num0));
        num1 && (num1 = utils.changeMoneyToGold(num1));
        num2 && (num2 = utils.changeMoneyToGold(num2));
        num3 && (num3 = utils.changeMoneyToGold(num3));
        const s0 = num0 > 0 ? ((iswin0 ? '+' : '-') + (roomInfo.lotterys[0].multiple * num0)) : 0;
        const s1 = num1 > 0 ? ((iswin1 ? '+' : '-') + (roomInfo.lotterys[1].multiple * num1)) : 0;
        const s2 = num2 > 0 ? ((iswin2 ? '+' : '-') + (roomInfo.lotterys[2].multiple * num2)) : 0;
        const s3 = num3 > 0 ? ((iswin3 ? '+' : '-') + (roomInfo.lotterys[3].multiple * num3)) : 0;
        // 发一封详细信息邮件
        let content = '由于断线/退出游戏，您在[百人牛牛]游戏中' + (isZhuang ? '当庄' : ('押注' + utils.simplifyMoney(playerInfo.bet, playerInfo))) + '金币已自动结算';
        if (language == 'english') {
            if (isZhuang) {
                content = 'Due to disconnection or unusual quit game ,your bank play in Bull fight has aready auto counted as ' + utils.simplifyMoney(playerInfo.bet, playerInfo) + ' gold.'
            } else {
                content = 'Due to disconnection or unusual quit game ,your bet ' + utils.simplifyMoney(playerInfo.bet, playerInfo) + 'gold in Bull fight has aready auto counted .';
            }
        }

        content += '\n' + langsrv.getlanguage(language, langsrv.Net_Message.id_1056) + '：' + CARDTYPE_STR(playerInfo, roomInfo.zhuangResult.cardType);
        content += '\n' + langsrv.getlanguage(language, langsrv.Net_Message.id_1057) + '：' + CARDTYPE_STR(playerInfo, roomInfo.lotterys[0].cardType) + '(' + (iswin0 ? langsrv.getlanguage(language, langsrv.Net_Message.id_1062) : langsrv.getlanguage(language, langsrv.Net_Message.id_1063)) + ' ' + num0 + 'x' + roomInfo.lotterys[0].multiple + ')  ' + s0;
        content += '\n' + langsrv.getlanguage(language, langsrv.Net_Message.id_1058) + '：' + CARDTYPE_STR(playerInfo, roomInfo.lotterys[1].cardType) + '(' + (iswin1 ? langsrv.getlanguage(language, langsrv.Net_Message.id_1062) : langsrv.getlanguage(language, langsrv.Net_Message.id_1063)) + ' ' + num1 + 'x' + roomInfo.lotterys[1].multiple + ')  ' + s1;
        content += '\n' + langsrv.getlanguage(language, langsrv.Net_Message.id_1059) + '：' + CARDTYPE_STR(playerInfo, roomInfo.lotterys[2].cardType) + '(' + (iswin2 ? langsrv.getlanguage(language, langsrv.Net_Message.id_1062) : langsrv.getlanguage(language, langsrv.Net_Message.id_1063)) + ' ' + num2 + 'x' + roomInfo.lotterys[2].multiple + ')  ' + s2;
        content += '\n' + langsrv.getlanguage(language, langsrv.Net_Message.id_1060) + '：' + CARDTYPE_STR(playerInfo, roomInfo.lotterys[3].cardType) + '(' + (iswin3 ? langsrv.getlanguage(language, langsrv.Net_Message.id_1062) : langsrv.getlanguage(language, langsrv.Net_Message.id_1063)) + ' ' + num3 + 'x' + roomInfo.lotterys[3].multiple + ')  ' + s3;
        content += '\n' + langsrv.getlanguage(language, langsrv.Net_Message.id_1061) + '：' + utils.changeMoneyToGold(gainStr) + '。';
        sendMail(playerInfo.uid, langsrv.getlanguage(language, langsrv.Net_Message.id_1055), content, language);
        return null
    } catch (error) {
        console.error('百人牛牛发送离线邮件失败', error);
        return '百人牛牛发送离线邮件失败'
    }
};

/**
 * 游戏中断 - 欢乐百人
 */
export async function changeGoldsByMail2({ uid, content }) {
    try {
        const player = await PlayerManagerDao.findOne({ uid });
        let language = player.language;
        sendMail(uid, langsrv.getlanguage(language, langsrv.Net_Message.id_1055), content, language);
        return null
    } catch (error) {
        console.error('欢乐百人|发送离线邮件失败', error);
        return '欢乐百人|发送离线邮件失败'
    }
}


/**
 * 游戏中断 - ATT
 */
export async function changeGoldsByMail11(game, playerParam) {
    const player = await PlayerManagerDao.findOne({ uid: playerParam.uid });
    let language = player.language;
    let content = '由于断线/退出游戏，您在[皇家连环炮]游戏中押注' + (playerParam.sumBet / 100) + '筹码已自动结算,赢得' + (playerParam.gain / 100) + '筹码。';
    if (language === 'english') {
        content = 'Due to disconnection or unusual quit game ,your bet ' + (playerParam.sumBet / 100) + ' gold in Royal video poker has aready auto counted as ' + (playerParam.gain / 100) + ' gold.'
    }
    sendMail(playerParam.uid, langsrv.getlanguage(language, langsrv.Net_Message.id_1055), content, language);
    return null
};


/**
 * 游戏中断 - 骰宝
 */

export async function changeGoldsByMail5(game, playerParam) {
    const player = await PlayerManagerDao.findOne({ uid: playerParam.uid });
    let content = `您在【骰宝】游戏中押注${playerParam.bet / 100}金币已经自动结算，您本局收益为：${utils.changeMoneyToGold(playerParam.profit)}金币`;
    let language = player.language;
    if (language === 'english') {
        content = 'Dear ' + playerParam.nickname + ' ,due to disconnection or unusual quit game ,your player result in Blackjack has been counted as ' + utils.changeMoneyToGold(playerParam.profit) + ' gold .';
    }
    // content += playerParam.profit ? ',' + langsrv.getlanguage(language,1071) + '。' : '。';

    sendMail(playerParam.uid, langsrv.getlanguage(language, langsrv.Net_Message.id_1055), content, language);
    return null
};
/**双骰 */
export async function changeGoldsByMail3(game, playerParam) {
    const player = await PlayerManagerDao.findOne({ uid: playerParam.uid });
    let content = `您在【骰宝】游戏中押注${playerParam.bet / 100}金币已经自动结算，您本局收益为：${utils.changeMoneyToGold(playerParam.profit)}金币`;
    let language = player.language;
    if (language === 'english') {
        content = 'Dear ' + playerParam.nickname + ' ,due to disconnection or unusual quit game ,your player result in Blackjack has been counted as ' + utils.changeMoneyToGold(playerParam.profit) + ' gold .';
    }
    // content += playerParam.profit ? ',' + langsrv.getlanguage(language,1071) + '。' : '。';

    sendMail(playerParam.uid, langsrv.getlanguage(language, langsrv.Net_Message.id_1055), content, language);
    return null
};

/**
 * 游戏中断 - 草花机
 */

export async function changeGoldsByMail6(game, playerParam) {
    const player = await PlayerManagerDao.findOne({ uid: playerParam.uid });
    let content = '尊敬的玩家:' + playerParam.nickname + '，你好，你在' + utils.cDate() + '进行的五星宏辉游戏因为掉线已自动结算，你当局共获得' + utils.changeMoneyToGold(playerParam.profit) + '金币';
    let language = player.language;
    if (language === 'english') {
        content = 'Dear ' + playerParam.nickname + ' ,due to disconnection or unusual quit game ,your player result in Blackjack ' + utils.cDate() + ' has been counted as ' + utils.changeMoneyToGold(playerParam.gain) + ' gold .';
    }
    content += playerParam.gain ? ',' + langsrv.getlanguage(language, langsrv.Net_Message.id_1071) + '。' : '。';

    sendMail(playerParam.uid, langsrv.getlanguage(language, langsrv.Net_Message.id_1055), content, language);
    return null
};



// 龙虎斗
// export async function changeGoldsByMail8(uid: string, language, content: string) {
//     // const player = await PlayerManagerDao.findOne({ uid: playerParam.uid });
//     // let language = player.language;
//     sendMail(uid, langsrv.getlanguage(language, langsrv.Net_Message.id_1055), content, language);
//     return null
// };




// 红黑大战
export async function changeGoldsByMail19(game, playerParam) {
    const player = await PlayerManagerDao.findOne({ uid: playerParam.uid });
    let language = player.language;
    let content = langsrv.getlanguage(language, langsrv.Net_Message.id_2026,
        langsrv.getlanguage(language, langsrv.Net_Message.id_game_name.nid_19), utils.changeMoneyToGold(playerParam.profit));

    content += playerParam.profit ? ',' + langsrv.getlanguage(language, langsrv.Net_Message.id_1071) + '。' : '。';

    sendMail(playerParam.uid, langsrv.getlanguage(language, langsrv.Net_Message.id_1055), content, language);
    return null
};

/**
 * 游戏中断 - 德州扑克
 */

export async function changeGoldsByMail12(game, playerParam) {
    const player = await PlayerManagerDao.findOne({ uid: playerParam.uid });
    let language = player.language;
    let content = '尊敬的玩家:' + playerParam.nickname + '，你好，你在' + utils.cDate() + '进行的德州扑克游戏因为掉线已自动结算，你当局共获得' + utils.changeMoneyToGold(playerParam.gold) + '金币';

    if (language === 'english') {
        content = 'Dear ' + playerParam.nickname + ' ,due to disconnection or unusual quit game ,your player result in Blackjack ' + utils.cDate() + ' has been counted as ' + utils.changeMoneyToGold(playerParam.gold) + ' gold .';
    }
    content += playerParam.gold ? ',' + langsrv.getlanguage(language, langsrv.Net_Message.id_1071) + '。' : '。';

    sendMail(playerParam.uid, langsrv.getlanguage(language, langsrv.Net_Message.id_1055), content, language);
    return null
};



/**
 * 游戏中断 - 推筒子(有庄)
 */
export async function changeGoldsByMail14(game, playerParam) {
    const player = await PlayerManagerDao.findOne({ uid: playerParam.uid });
    let language = player.language;
    let content = langsrv.getlanguage(language, langsrv.Net_Message.id_2026,
        langsrv.getlanguage(language, langsrv.Net_Message.id_game_name.nid_49), utils.changeMoneyToGold(playerParam.profit));

    content += playerParam.profit ? ',' + langsrv.getlanguage(language, langsrv.Net_Message.id_1071) + '。' : '。';

    sendMail(playerParam.uid, langsrv.getlanguage(language, langsrv.Net_Message.id_1055), content, language);
    return null
};

// 三公玩家掉线 发通知（未调用）
export async function changeGoldsByMail15(game, playerParam, cb) {
    const player = await PlayerManagerDao.findOne({ uid: playerParam.uid });
    let language = player.language;
    let content = '尊敬的玩家:' + playerParam.nickname + '，你好，你在' + utils.cDate() +
        '参与的三公游戏因为掉线已自动结算，你当局输掉' + utils.changeMoneyToGold(playerParam.loss) + '，祝你下次好运。';

    if (language === 'english') {
        content = 'Dear ' + playerParam.nickname +
            'The SanGong game you played has been settled, the authorities failed to win, and wish you luck next time';
    }

    sendMail(playerParam.uid, langsrv.getlanguage(language, langsrv.Net_Message.id_1055), content, language);
    return null
};


// 三公赢家掉线 发通知
export async function changeGoldsByMail17(game, playerParam) {
    const player = await PlayerManagerDao.findOne({ uid: playerParam.uid });
    let language = player.language;
    let content = langsrv.getlanguage(language, langsrv.Net_Message.id_2026,
        langsrv.getlanguage(language, langsrv.Net_Message.id_2019), utils.changeMoneyToGold(playerParam.profit));

    content += playerParam.profit ? ',' + langsrv.getlanguage(language, langsrv.Net_Message.id_1071) + '。' : '。';

    sendMail(playerParam.uid, langsrv.getlanguage(language, langsrv.Net_Message.id_1055), content, language);
    return null
};

// 渔场大亨赢家掉线 发邮件
export async function changeGoldsByMail18(game, playerParam) {
    const player = await PlayerManagerDao.findOne({ uid: playerParam.uid });
    let language = player.language;
    let content = '尊敬的玩家:' + playerParam.nickname + '，你好，你在' + utils.cDate() +
        '参与的渔场大亨游戏已自动结算，你当局共获得' + utils.changeMoneyToGold(playerParam.winBet) + '金币，';
    if (language === 'english') {
        content = 'Dear:' + playerParam.nickname + ', your bet(s) in Fishery tycoon ' + utils.cDate() +
            ' have come out with result, you have won ' + utils.changeMoneyToGold(playerParam.winBet) + ' gold, ';
    }
    content += langsrv.getlanguage(language, langsrv.Net_Message.id_1071);
    content += language === 'english' ? '.' : '。';
    sendMail(playerParam.uid, langsrv.getlanguage(language, langsrv.Net_Message.id_1055), content, language);
    return null;
};

// 抢庄牛牛玩家掉线 发邮件
export async function changeGoldsByMail47(game, playerInfo: qznnPlayer) {
    const player = await PlayerManagerDao.findOne({ uid: playerInfo.uid });
    let language = player.language;
    let content = '尊敬的玩家:' + playerInfo.nickname + '，你好，你在' + utils.cDate() +
        '参与的抢庄牛牛游戏因为掉线已自动结算，你当局共收益为' + utils.changeMoneyToGold(playerInfo.profit) + '金币' + (playerInfo.profit > 0 ? '，' : '。');
    if (language === 'english') {
        content = 'Dear:' + playerInfo.nickname + ', your bet(s) in Fishery tycoon ' + utils.cDate() +
            ' have come out with result, you have won ' + utils.changeMoneyToGold(playerInfo.profit) + ' gold ';
    }
    playerInfo.profit > 0 && (content += (langsrv.getlanguage(language, langsrv.Net_Message.id_1071) + language === 'english' ? '.' : '。'));
    sendMail(playerInfo.uid, langsrv.getlanguage(language, langsrv.Net_Message.id_1055), content, language);
    return null
};

// 斗地主玩家掉线 发邮件
export async function changeGoldsByMail20(game, playerParam, playerRealWin, cb) {
    const player = await PlayerManagerDao.findOne({ uid: playerParam.uid });
    let language = player.language;
    let content = langsrv.getlanguage(language, langsrv.Net_Message.id_2026,
        langsrv.getlanguage(language, langsrv.Net_Message.id_3000), utils.changeMoneyToGold(playerRealWin));

    content += playerRealWin ? ',' + langsrv.getlanguage(language, langsrv.Net_Message.id_1071) + '。' : '。';

    sendMail(playerParam.uid, langsrv.getlanguage(language, langsrv.Net_Message.id_1055), content, language);
    return null
};
/**
 * 游戏中断 - 万人金花
 */
export async function changeGoldsByMail21(game, bairenPlayer: wrjhPlayer) {
    try {
        // const { uid, profit, sumBet, bets } = bairenPlayer;
        // const player = await PlayerManagerDao.findOne({ uid: uid });
        let language = bairenPlayer.language;
        //判断是否是庄家
        const isZhuang = bairenPlayer.uid === game.zhuangUid;
        const gainStr = (bairenPlayer.profit > 0 ? '+' : '') + bairenPlayer.profit / 100;
        // if (profit > 0) {
        //     props = [{ nid: gconf.GOLD_NID, value: profit }];
        // }
        const iswin0 = game.regions[0].isWin;
        const iswin1 = game.regions[1].isWin;
        const iswin2 = game.regions[2].isWin;
        const iswin3 = game.regions[3].isWin;

        const num0 = isZhuang ? game.regions[0].sumBet / 100 : bairenPlayer.bets[0].bet / 100;
        const num1 = isZhuang ? game.regions[1].sumBet / 100 : bairenPlayer.bets[1].bet / 100;
        const num2 = isZhuang ? game.regions[2].sumBet / 100 : bairenPlayer.bets[2].bet / 100;
        const num3 = isZhuang ? game.regions[3].sumBet / 100 : bairenPlayer.bets[3].bet / 100;

        const s0 = num0 > 0 ? ((iswin0 ? '+' : '-') + (game.regions[0].multiple * num0)) : 0;
        const s1 = num1 > 0 ? ((iswin1 ? '+' : '-') + (game.regions[1].multiple * num1)) : 0;
        const s2 = num2 > 0 ? ((iswin2 ? '+' : '-') + (game.regions[2].multiple * num2)) : 0;
        const s3 = num3 > 0 ? ((iswin3 ? '+' : '-') + (game.regions[3].multiple * num3)) : 0;
        // 发一封详细信息邮件
        let content = '由于断线/退出游戏，您在[万人金花]游戏中' + (isZhuang ? '当庄' : ('押注' + utils.simplifyMoney(bairenPlayer.bet, bairenPlayer))) + '已自动结算';
        if (language == 'english') {
            if (isZhuang) {
                content = 'Due to disconnection or unusual quit game ,your bank play in Bull fight has aready auto counted as ' + utils.simplifyMoney(bairenPlayer.bet, bairenPlayer) + ' gold.'
            } else {
                content = 'Due to disconnection or unusual quit game ,your bet ' + utils.simplifyMoney(bairenPlayer.bet, bairenPlayer) + 'gold in Bull fight has aready auto counted .';
            }
        }

        let content_tmp = langsrv.getlanguage(language, langsrv.Net_Message.id_2033,
            '：' + CARDTYPE_STR_JH(bairenPlayer, game.zhuangResult.cardType),
            '：' + CARDTYPE_STR_JH(bairenPlayer, game.regions[0].cardType) + '(' + (iswin0 ? langsrv.getlanguage(language, langsrv.Net_Message.id_1062) : langsrv.getlanguage(language, langsrv.Net_Message.id_1063)) + ' ' + num0 + 'x' + game.regions[0].multiple + ')  ' + s0,
            '：' + CARDTYPE_STR_JH(bairenPlayer, game.regions[1].cardType) + '(' + (iswin1 ? langsrv.getlanguage(language, langsrv.Net_Message.id_1062) : langsrv.getlanguage(language, langsrv.Net_Message.id_1063)) + ' ' + num1 + 'x' + game.regions[1].multiple + ')  ' + s1,
            '：' + CARDTYPE_STR_JH(bairenPlayer, game.regions[2].cardType) + '(' + (iswin2 ? langsrv.getlanguage(language, langsrv.Net_Message.id_1062) : langsrv.getlanguage(language, langsrv.Net_Message.id_1063)) + ' ' + num2 + 'x' + game.regions[2].multiple + ')  ' + s2,
            '：' + CARDTYPE_STR_JH(bairenPlayer, game.regions[3].cardType) + '(' + (iswin3 ? langsrv.getlanguage(language, langsrv.Net_Message.id_1062) : langsrv.getlanguage(language, langsrv.Net_Message.id_1063)) + ' ' + num3 + 'x' + game.regions[3].multiple + ')  ' + s3,
            langsrv.getlanguage(language, langsrv.Net_Message.id_1061) + '：' + gainStr + '。');
        content += '\n' + content_tmp;
        sendMail(bairenPlayer.uid, langsrv.getlanguage(language, langsrv.Net_Message.id_1055), content, language);
        return null;
    } catch (error) {
        console.error('万人金花发送离线邮件失败', error);
        return null;
    }
};

/**
 * 游戏中断 - 红包扫雷
 */
export async function sendMailFromRedPacket(uid: string, win: number, isDealer: boolean) {
    try {
        const player = await PlayerManagerDao.findOne({ uid: uid });
        let language = player.language;
        const content = `尊敬的玩家:${player.nickname},您好,您在${utils.cDate()}红包扫雷游戏里${isDealer ? "发红包" : "抢红包"}已自动结算,您当局共获得 ${utils.changeMoneyToGold(win)} 金币`;

        sendMail(uid, "游戏中断", content, language);
    } catch (e) {
        console.error(`红包扫雷 | 离线 发送邮件报错: ${e.stack}`);
    }
}


/**
* 游戏中断 - slot
* @param uid 
* @param period 
* @param winGold 
* @param isLottery 
* @param gameName 
*/
export async function sendEmailFromSlot(game: { name: string }, { uid, bet, profit }) {
    const player = await PlayerManagerDao.findOne({ uid: uid });
    let language = player.language;
    const content = `由于断线/退出游戏。您在[${game.name}]游戏中押注:${bet / 100}金币已经自动结算，开奖结果如下：\n您的本局收益为:${profit / 100}`;

    sendMail(uid, langsrv.getlanguage(language, langsrv.Net_Message.id_1055), content, language);

    return null
}





/**
 * 客服充值
 */
export async function customerPayToPlayer(uid, gold) {

}

// }

/**
 * 批量发送邮件
 */
export function sendMail(uid: string , title: string, content: string, language: string) {
    let opts = {
        name: title,
        content: content,
        sender: langsrv.getlanguage(language, langsrv.Net_Message.id_1019),
        type: MailEnum.MailTypeEnum.GAME_CLOSE,
    }

    MailService.generatorMail(opts, uid);//给玩家发邮件
};