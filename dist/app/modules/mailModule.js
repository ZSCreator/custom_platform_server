'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMail = exports.customerPayToPlayer = exports.sendEmailFromSlot = exports.sendMailFromRedPacket = exports.changeGoldsByMail21 = exports.changeGoldsByMail20 = exports.changeGoldsByMail47 = exports.changeGoldsByMail18 = exports.changeGoldsByMail17 = exports.changeGoldsByMail15 = exports.changeGoldsByMail14 = exports.changeGoldsByMail12 = exports.changeGoldsByMail19 = exports.changeGoldsByMail6 = exports.changeGoldsByMail3 = exports.changeGoldsByMail5 = exports.changeGoldsByMail11 = exports.changeGoldsByMail2 = exports.changeGoldsByMail = void 0;
const utils = require("../utils");
const MailService = require("../services/MailService");
const Player_manager_1 = require("../common/dao/daoManager/Player.manager");
const MailEnum = require("../common/constant/hall/MailEnum");
const langsrv = require("../services/common/langsrv");
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
    return niuniu[index];
};
const CARDTYPE_STR_JH = function (players, index) {
    let jinhua = {
        0: langsrv.getlanguage(players.language, langsrv.Net_Message.id_2027),
        1: langsrv.getlanguage(players.language, langsrv.Net_Message.id_2028),
        2: langsrv.getlanguage(players.language, langsrv.Net_Message.id_2029),
        3: langsrv.getlanguage(players.language, langsrv.Net_Message.id_2030),
        4: langsrv.getlanguage(players.language, langsrv.Net_Message.id_2031),
        5: langsrv.getlanguage(players.language, langsrv.Net_Message.id_2032),
    };
    return jinhua[index];
};
async function changeGoldsByMail(roomInfo, playerInfo) {
    try {
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
        let content = '由于断线/退出游戏，您在[百人牛牛]游戏中' + (isZhuang ? '当庄' : ('押注' + utils.simplifyMoney(playerInfo.bet, playerInfo))) + '金币已自动结算';
        if (language == 'english') {
            if (isZhuang) {
                content = 'Due to disconnection or unusual quit game ,your bank play in Bull fight has aready auto counted as ' + utils.simplifyMoney(playerInfo.bet, playerInfo) + ' gold.';
            }
            else {
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
        return null;
    }
    catch (error) {
        console.error('百人牛牛发送离线邮件失败', error);
        return '百人牛牛发送离线邮件失败';
    }
}
exports.changeGoldsByMail = changeGoldsByMail;
;
async function changeGoldsByMail2({ uid, content }) {
    try {
        const player = await Player_manager_1.default.findOne({ uid });
        let language = player.language;
        sendMail(uid, langsrv.getlanguage(language, langsrv.Net_Message.id_1055), content, language);
        return null;
    }
    catch (error) {
        console.error('欢乐百人|发送离线邮件失败', error);
        return '欢乐百人|发送离线邮件失败';
    }
}
exports.changeGoldsByMail2 = changeGoldsByMail2;
async function changeGoldsByMail11(game, playerParam) {
    const player = await Player_manager_1.default.findOne({ uid: playerParam.uid });
    let language = player.language;
    let content = '由于断线/退出游戏，您在[皇家连环炮]游戏中押注' + (playerParam.sumBet / 100) + '筹码已自动结算,赢得' + (playerParam.gain / 100) + '筹码。';
    if (language === 'english') {
        content = 'Due to disconnection or unusual quit game ,your bet ' + (playerParam.sumBet / 100) + ' gold in Royal video poker has aready auto counted as ' + (playerParam.gain / 100) + ' gold.';
    }
    sendMail(playerParam.uid, langsrv.getlanguage(language, langsrv.Net_Message.id_1055), content, language);
    return null;
}
exports.changeGoldsByMail11 = changeGoldsByMail11;
;
async function changeGoldsByMail5(game, playerParam) {
    const player = await Player_manager_1.default.findOne({ uid: playerParam.uid });
    let content = `您在【骰宝】游戏中押注${playerParam.bet / 100}金币已经自动结算，您本局收益为：${utils.changeMoneyToGold(playerParam.profit)}金币`;
    let language = player.language;
    if (language === 'english') {
        content = 'Dear ' + playerParam.nickname + ' ,due to disconnection or unusual quit game ,your player result in Blackjack has been counted as ' + utils.changeMoneyToGold(playerParam.profit) + ' gold .';
    }
    sendMail(playerParam.uid, langsrv.getlanguage(language, langsrv.Net_Message.id_1055), content, language);
    return null;
}
exports.changeGoldsByMail5 = changeGoldsByMail5;
;
async function changeGoldsByMail3(game, playerParam) {
    const player = await Player_manager_1.default.findOne({ uid: playerParam.uid });
    let content = `您在【骰宝】游戏中押注${playerParam.bet / 100}金币已经自动结算，您本局收益为：${utils.changeMoneyToGold(playerParam.profit)}金币`;
    let language = player.language;
    if (language === 'english') {
        content = 'Dear ' + playerParam.nickname + ' ,due to disconnection or unusual quit game ,your player result in Blackjack has been counted as ' + utils.changeMoneyToGold(playerParam.profit) + ' gold .';
    }
    sendMail(playerParam.uid, langsrv.getlanguage(language, langsrv.Net_Message.id_1055), content, language);
    return null;
}
exports.changeGoldsByMail3 = changeGoldsByMail3;
;
async function changeGoldsByMail6(game, playerParam) {
    const player = await Player_manager_1.default.findOne({ uid: playerParam.uid });
    let content = '尊敬的玩家:' + playerParam.nickname + '，你好，你在' + utils.cDate() + '进行的五星宏辉游戏因为掉线已自动结算，你当局共获得' + utils.changeMoneyToGold(playerParam.profit) + '金币';
    let language = player.language;
    if (language === 'english') {
        content = 'Dear ' + playerParam.nickname + ' ,due to disconnection or unusual quit game ,your player result in Blackjack ' + utils.cDate() + ' has been counted as ' + utils.changeMoneyToGold(playerParam.gain) + ' gold .';
    }
    content += playerParam.gain ? ',' + langsrv.getlanguage(language, langsrv.Net_Message.id_1071) + '。' : '。';
    sendMail(playerParam.uid, langsrv.getlanguage(language, langsrv.Net_Message.id_1055), content, language);
    return null;
}
exports.changeGoldsByMail6 = changeGoldsByMail6;
;
async function changeGoldsByMail19(game, playerParam) {
    const player = await Player_manager_1.default.findOne({ uid: playerParam.uid });
    let language = player.language;
    let content = langsrv.getlanguage(language, langsrv.Net_Message.id_2026, langsrv.getlanguage(language, langsrv.Net_Message.id_game_name.nid_19), utils.changeMoneyToGold(playerParam.profit));
    content += playerParam.profit ? ',' + langsrv.getlanguage(language, langsrv.Net_Message.id_1071) + '。' : '。';
    sendMail(playerParam.uid, langsrv.getlanguage(language, langsrv.Net_Message.id_1055), content, language);
    return null;
}
exports.changeGoldsByMail19 = changeGoldsByMail19;
;
async function changeGoldsByMail12(game, playerParam) {
    const player = await Player_manager_1.default.findOne({ uid: playerParam.uid });
    let language = player.language;
    let content = '尊敬的玩家:' + playerParam.nickname + '，你好，你在' + utils.cDate() + '进行的德州扑克游戏因为掉线已自动结算，你当局共获得' + utils.changeMoneyToGold(playerParam.gold) + '金币';
    if (language === 'english') {
        content = 'Dear ' + playerParam.nickname + ' ,due to disconnection or unusual quit game ,your player result in Blackjack ' + utils.cDate() + ' has been counted as ' + utils.changeMoneyToGold(playerParam.gold) + ' gold .';
    }
    content += playerParam.gold ? ',' + langsrv.getlanguage(language, langsrv.Net_Message.id_1071) + '。' : '。';
    sendMail(playerParam.uid, langsrv.getlanguage(language, langsrv.Net_Message.id_1055), content, language);
    return null;
}
exports.changeGoldsByMail12 = changeGoldsByMail12;
;
async function changeGoldsByMail14(game, playerParam) {
    const player = await Player_manager_1.default.findOne({ uid: playerParam.uid });
    let language = player.language;
    let content = langsrv.getlanguage(language, langsrv.Net_Message.id_2026, langsrv.getlanguage(language, langsrv.Net_Message.id_game_name.nid_49), utils.changeMoneyToGold(playerParam.profit));
    content += playerParam.profit ? ',' + langsrv.getlanguage(language, langsrv.Net_Message.id_1071) + '。' : '。';
    sendMail(playerParam.uid, langsrv.getlanguage(language, langsrv.Net_Message.id_1055), content, language);
    return null;
}
exports.changeGoldsByMail14 = changeGoldsByMail14;
;
async function changeGoldsByMail15(game, playerParam, cb) {
    const player = await Player_manager_1.default.findOne({ uid: playerParam.uid });
    let language = player.language;
    let content = '尊敬的玩家:' + playerParam.nickname + '，你好，你在' + utils.cDate() +
        '参与的三公游戏因为掉线已自动结算，你当局输掉' + utils.changeMoneyToGold(playerParam.loss) + '，祝你下次好运。';
    if (language === 'english') {
        content = 'Dear ' + playerParam.nickname +
            'The SanGong game you played has been settled, the authorities failed to win, and wish you luck next time';
    }
    sendMail(playerParam.uid, langsrv.getlanguage(language, langsrv.Net_Message.id_1055), content, language);
    return null;
}
exports.changeGoldsByMail15 = changeGoldsByMail15;
;
async function changeGoldsByMail17(game, playerParam) {
    const player = await Player_manager_1.default.findOne({ uid: playerParam.uid });
    let language = player.language;
    let content = langsrv.getlanguage(language, langsrv.Net_Message.id_2026, langsrv.getlanguage(language, langsrv.Net_Message.id_2019), utils.changeMoneyToGold(playerParam.profit));
    content += playerParam.profit ? ',' + langsrv.getlanguage(language, langsrv.Net_Message.id_1071) + '。' : '。';
    sendMail(playerParam.uid, langsrv.getlanguage(language, langsrv.Net_Message.id_1055), content, language);
    return null;
}
exports.changeGoldsByMail17 = changeGoldsByMail17;
;
async function changeGoldsByMail18(game, playerParam) {
    const player = await Player_manager_1.default.findOne({ uid: playerParam.uid });
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
}
exports.changeGoldsByMail18 = changeGoldsByMail18;
;
async function changeGoldsByMail47(game, playerInfo) {
    const player = await Player_manager_1.default.findOne({ uid: playerInfo.uid });
    let language = player.language;
    let content = '尊敬的玩家:' + playerInfo.nickname + '，你好，你在' + utils.cDate() +
        '参与的抢庄牛牛游戏因为掉线已自动结算，你当局共收益为' + utils.changeMoneyToGold(playerInfo.profit) + '金币' + (playerInfo.profit > 0 ? '，' : '。');
    if (language === 'english') {
        content = 'Dear:' + playerInfo.nickname + ', your bet(s) in Fishery tycoon ' + utils.cDate() +
            ' have come out with result, you have won ' + utils.changeMoneyToGold(playerInfo.profit) + ' gold ';
    }
    playerInfo.profit > 0 && (content += (langsrv.getlanguage(language, langsrv.Net_Message.id_1071) + language === 'english' ? '.' : '。'));
    sendMail(playerInfo.uid, langsrv.getlanguage(language, langsrv.Net_Message.id_1055), content, language);
    return null;
}
exports.changeGoldsByMail47 = changeGoldsByMail47;
;
async function changeGoldsByMail20(game, playerParam, playerRealWin, cb) {
    const player = await Player_manager_1.default.findOne({ uid: playerParam.uid });
    let language = player.language;
    let content = langsrv.getlanguage(language, langsrv.Net_Message.id_2026, langsrv.getlanguage(language, langsrv.Net_Message.id_3000), utils.changeMoneyToGold(playerRealWin));
    content += playerRealWin ? ',' + langsrv.getlanguage(language, langsrv.Net_Message.id_1071) + '。' : '。';
    sendMail(playerParam.uid, langsrv.getlanguage(language, langsrv.Net_Message.id_1055), content, language);
    return null;
}
exports.changeGoldsByMail20 = changeGoldsByMail20;
;
async function changeGoldsByMail21(game, bairenPlayer) {
    try {
        let language = bairenPlayer.language;
        const isZhuang = bairenPlayer.uid === game.zhuangUid;
        const gainStr = (bairenPlayer.profit > 0 ? '+' : '') + bairenPlayer.profit / 100;
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
        let content = '由于断线/退出游戏，您在[万人金花]游戏中' + (isZhuang ? '当庄' : ('押注' + utils.simplifyMoney(bairenPlayer.bet, bairenPlayer))) + '已自动结算';
        if (language == 'english') {
            if (isZhuang) {
                content = 'Due to disconnection or unusual quit game ,your bank play in Bull fight has aready auto counted as ' + utils.simplifyMoney(bairenPlayer.bet, bairenPlayer) + ' gold.';
            }
            else {
                content = 'Due to disconnection or unusual quit game ,your bet ' + utils.simplifyMoney(bairenPlayer.bet, bairenPlayer) + 'gold in Bull fight has aready auto counted .';
            }
        }
        let content_tmp = langsrv.getlanguage(language, langsrv.Net_Message.id_2033, '：' + CARDTYPE_STR_JH(bairenPlayer, game.zhuangResult.cardType), '：' + CARDTYPE_STR_JH(bairenPlayer, game.regions[0].cardType) + '(' + (iswin0 ? langsrv.getlanguage(language, langsrv.Net_Message.id_1062) : langsrv.getlanguage(language, langsrv.Net_Message.id_1063)) + ' ' + num0 + 'x' + game.regions[0].multiple + ')  ' + s0, '：' + CARDTYPE_STR_JH(bairenPlayer, game.regions[1].cardType) + '(' + (iswin1 ? langsrv.getlanguage(language, langsrv.Net_Message.id_1062) : langsrv.getlanguage(language, langsrv.Net_Message.id_1063)) + ' ' + num1 + 'x' + game.regions[1].multiple + ')  ' + s1, '：' + CARDTYPE_STR_JH(bairenPlayer, game.regions[2].cardType) + '(' + (iswin2 ? langsrv.getlanguage(language, langsrv.Net_Message.id_1062) : langsrv.getlanguage(language, langsrv.Net_Message.id_1063)) + ' ' + num2 + 'x' + game.regions[2].multiple + ')  ' + s2, '：' + CARDTYPE_STR_JH(bairenPlayer, game.regions[3].cardType) + '(' + (iswin3 ? langsrv.getlanguage(language, langsrv.Net_Message.id_1062) : langsrv.getlanguage(language, langsrv.Net_Message.id_1063)) + ' ' + num3 + 'x' + game.regions[3].multiple + ')  ' + s3, langsrv.getlanguage(language, langsrv.Net_Message.id_1061) + '：' + gainStr + '。');
        content += '\n' + content_tmp;
        sendMail(bairenPlayer.uid, langsrv.getlanguage(language, langsrv.Net_Message.id_1055), content, language);
        return null;
    }
    catch (error) {
        console.error('万人金花发送离线邮件失败', error);
        return null;
    }
}
exports.changeGoldsByMail21 = changeGoldsByMail21;
;
async function sendMailFromRedPacket(uid, win, isDealer) {
    try {
        const player = await Player_manager_1.default.findOne({ uid: uid });
        let language = player.language;
        const content = `尊敬的玩家:${player.nickname},您好,您在${utils.cDate()}红包扫雷游戏里${isDealer ? "发红包" : "抢红包"}已自动结算,您当局共获得 ${utils.changeMoneyToGold(win)} 金币`;
        sendMail(uid, "游戏中断", content, language);
    }
    catch (e) {
        console.error(`红包扫雷 | 离线 发送邮件报错: ${e.stack}`);
    }
}
exports.sendMailFromRedPacket = sendMailFromRedPacket;
async function sendEmailFromSlot(game, { uid, bet, profit }) {
    const player = await Player_manager_1.default.findOne({ uid: uid });
    let language = player.language;
    const content = `由于断线/退出游戏。您在[${game.name}]游戏中押注:${bet / 100}金币已经自动结算，开奖结果如下：\n您的本局收益为:${profit / 100}`;
    sendMail(uid, langsrv.getlanguage(language, langsrv.Net_Message.id_1055), content, language);
    return null;
}
exports.sendEmailFromSlot = sendEmailFromSlot;
async function customerPayToPlayer(uid, gold) {
}
exports.customerPayToPlayer = customerPayToPlayer;
function sendMail(uid, title, content, language) {
    let opts = {
        name: title,
        content: content,
        sender: langsrv.getlanguage(language, langsrv.Net_Message.id_1019),
        type: MailEnum.MailTypeEnum.GAME_CLOSE,
    };
    MailService.generatorMail(opts, uid);
}
exports.sendMail = sendMail;
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbE1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2FwcC9tb2R1bGVzL21haWxNb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7QUFDYixrQ0FBbUM7QUFDbkMsdURBQXdEO0FBQ3hELDRFQUF1RTtBQUN2RSw2REFBOEQ7QUFDOUQsc0RBQXVEO0FBT3ZELE1BQU0sS0FBSyxHQUFHLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDO0FBRWpDLE1BQU0sWUFBWSxHQUFHLFVBQVUsT0FBTyxFQUFFLEtBQUs7SUFDekMsSUFBSSxNQUFNLEdBQUc7UUFDVCxDQUFDLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDO1FBQ3JFLENBQUMsRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUM7UUFDckUsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQztRQUNyRSxDQUFDLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDO1FBQ3JFLENBQUMsRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUM7UUFDckUsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQztRQUNyRSxDQUFDLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDO1FBQ3JFLENBQUMsRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUM7UUFDckUsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQztRQUNyRSxDQUFDLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDO1FBQ3JFLEVBQUUsRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUM7UUFDdEUsRUFBRSxFQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQztRQUN0RSxFQUFFLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDO1FBQ3RFLEVBQUUsRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUM7S0FDekUsQ0FBQztJQUNGLE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFBO0FBQ3hCLENBQUMsQ0FBQTtBQUNELE1BQU0sZUFBZSxHQUFHLFVBQVUsT0FBTyxFQUFFLEtBQUs7SUFDNUMsSUFBSSxNQUFNLEdBQUc7UUFDVCxDQUFDLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDO1FBQ3JFLENBQUMsRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUM7UUFDckUsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQztRQUNyRSxDQUFDLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDO1FBQ3JFLENBQUMsRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUM7UUFDckUsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQztLQUN4RSxDQUFDO0lBQ0YsT0FBTyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDeEIsQ0FBQyxDQUFBO0FBS00sS0FBSyxVQUFVLGlCQUFpQixDQUFDLFFBQXdCLEVBQUUsVUFBNEI7SUFDMUYsSUFBSTtRQUVBLE1BQU0sUUFBUSxHQUFHLFVBQVUsQ0FBQyxHQUFHLEtBQUssUUFBUSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUM7UUFDNUQsSUFBSSxRQUFRLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQztRQUNuQyxNQUFNLE9BQU8sR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDO1FBRWxDLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQzFDLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQzFDLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQzFDLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBRTFDLElBQUksSUFBSSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFDdEcsSUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztRQUN0RyxJQUFJLElBQUksR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO1FBQ3RHLElBQUksSUFBSSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFDdEcsSUFBSSxJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQy9DLElBQUksSUFBSSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUMvQyxJQUFJLElBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDL0MsSUFBSSxJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQy9DLE1BQU0sRUFBRSxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUYsTUFBTSxFQUFFLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMxRixNQUFNLEVBQUUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzFGLE1BQU0sRUFBRSxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFMUYsSUFBSSxPQUFPLEdBQUcsdUJBQXVCLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUM7UUFDakksSUFBSSxRQUFRLElBQUksU0FBUyxFQUFFO1lBQ3ZCLElBQUksUUFBUSxFQUFFO2dCQUNWLE9BQU8sR0FBRyxxR0FBcUcsR0FBRyxLQUFLLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsVUFBVSxDQUFDLEdBQUcsUUFBUSxDQUFBO2FBQy9LO2lCQUFNO2dCQUNILE9BQU8sR0FBRyxzREFBc0QsR0FBRyxLQUFLLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsVUFBVSxDQUFDLEdBQUcsOENBQThDLENBQUM7YUFDdks7U0FDSjtRQUVELE9BQU8sSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsR0FBRyxHQUFHLEdBQUcsWUFBWSxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzlJLE9BQU8sSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsR0FBRyxHQUFHLEdBQUcsWUFBWSxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxHQUFHLEtBQUssR0FBRyxFQUFFLENBQUM7UUFDeFYsT0FBTyxJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEdBQUcsR0FBRyxZQUFZLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxHQUFHLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEdBQUcsS0FBSyxHQUFHLEVBQUUsQ0FBQztRQUN4VixPQUFPLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLEdBQUcsR0FBRyxHQUFHLFlBQVksQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxXQUFX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LEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDckMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFFckMsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUN0RixNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQ3RGLE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDdEYsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUV0RixNQUFNLEVBQUUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FB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QUFDLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxHQUFHLEtBQUssR0FBRyxFQUFFLEVBQ25RLEdBQUcsR0FBRyxlQUFlLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEdBQUcsS0FBSyxHQUFHLEVBQUUsRUFDblEsR0FBRyxHQUFHLGVBQWUsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsR0FBRyxLQUFLLEdBQUcsRUFBRSxFQUNuUSxPQUFPLENBQUMsV0FB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