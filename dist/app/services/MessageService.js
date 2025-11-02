'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendBigWinNotice = exports.startBigWinNotice = exports.systemNotice = exports.notice = exports.pushMessageByUids = void 0;
const pinus_1 = require("pinus");
const util = require("../utils");
const hallConst = require("../consts/hallConst");
const DatabaseConst = require("../consts/databaseConst");
const redisManager = require("../common/dao/redis/lib/redisManager");
const Player_manager_1 = require("../common/dao/daoManager/Player.manager");
const pinus_logger_1 = require("pinus-logger");
const Logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
const langsrv = require("./common/langsrv");
const RoleEnum_1 = require("../common/constant/player/RoleEnum");
const redisEvent_1 = require("../common/event/redisEvent");
let NOTICEdb = {
    async push(data) {
        return await redisManager.storeInSet(DatabaseConst.BIG_WIN_NOTICE_ARR_SET, data).catch(error => {
        });
    },
    async pop() {
        return await redisManager.spop(DatabaseConst.BIG_WIN_NOTICE_ARR_SET);
    },
    async getLen() {
        return await redisManager.getAllFromSet(DatabaseConst.BIG_WIN_NOTICE_ARR_SET);
    }
};
function pushMessageByUids(route, msg, uids) {
    let RobotUids = [];
    let uidsArr = [];
    if (!Array.isArray(uids)) {
        if (uids.sid == "robot") {
            RobotUids.push(uids.uid);
        }
        else {
            uidsArr = [uids];
        }
    }
    else {
        for (const It of uids) {
            if (It.sid == "robot") {
                RobotUids.push(It.uid);
            }
            else {
                uidsArr.push({ uid: It.uid, sid: It.sid });
            }
        }
    }
    if (util.isVoid(uidsArr) && RobotUids.length == 0) {
        return;
    }
    uidsArr = uidsArr.filter(m => !!m);
    if (uidsArr.length !== 0) {
        pinus_1.pinus.app.channelService.pushMessageByUids(route, msg, uidsArr, errHandler);
    }
    for (const uid of RobotUids) {
        redisEvent_1.globalEvent.emit("doForward", uid, route, msg);
    }
}
exports.pushMessageByUids = pushMessageByUids;
;
function errHandler(err, fails) {
    if (!!err) {
        console.error('Push Message error! %j', err.stack);
    }
}
function getBigWinMessage(language, nickname, gameName, num) {
    return langsrv.getlanguage(language, langsrv.Net_Message.id_10000, nickname, gameName, num);
}
async function notice(data, callback) {
    try {
        const players = await Player_manager_1.default.findListRedisInUidsForSid();
        if (!players.length) {
            return !!callback && callback();
        }
        const uidSidArr = players.map(player => {
            return { uid: player.uid, sid: player.sid };
        });
        const messageTask = [];
        let message;
        switch (data.route) {
            case 'system':
                messageTask.push({
                    message: { sponsor: 'system', msg: data.content, type: 'system' },
                    receivers: uidSidArr
                });
                break;
            case 'bigNotice':
                messageTask.push({
                    message: { sponsor: data.nickname, msg: data.content, type: 'bigNotice' },
                    receivers: uidSidArr
                });
                break;
            case 'contentWin':
                messageTask.push({
                    message: {
                        sponsor: 'system',
                        msg: data.content,
                        type: 'bigWin',
                        uid: data.uid,
                        gameNid: data.game.nid,
                        des: data.des,
                    },
                    receivers: uidSidArr
                });
                break;
            case 'onBigWin':
            case 'onJackpotWin':
                message = {
                    sponsor: 'system',
                    type: data.route === 'onBigWin' ? 'bigWin' : 'jackpotWin',
                    uid: data.uid,
                    gameNid: data.game.nid,
                    des: data.des
                };
                if (data.route === 'onJackpotWin') {
                    message.jackpotType = data.game.jackpotType;
                }
                const gameName = langsrv.getlanguage(data.language, langsrv.Net_Message.id_game_name[`nid_${data.game.nid}`]);
                let profit = Math.floor(data.game.num / 100);
                message.msg = getBigWinMessage(data.language, data.game.nickname, gameName, profit);
                messageTask.push({
                    message,
                    receivers: uidSidArr
                });
                break;
            default:
                Logger.error('MailService.notice ==> route 错误：', data.route);
                return !!callback && callback();
        }
        messageTask.forEach(task => {
            pinus_1.pinus.app.channelService.pushMessageByUids('notice', task.message, task.receivers, errHandler);
        });
        return !!callback && callback();
    }
    catch (error) {
        Logger.error('MessageService.notice ==> 发送消息出错：', error);
        return !!callback && callback();
    }
}
exports.notice = notice;
;
async function systemNotice({ route, content, language }) {
    const players = await Player_manager_1.default.findListRedisInUidsForSid();
    if (util.isVoid(players)) {
        return false;
    }
    const uidSidArr = players.map(player => {
        return { uid: player.uid, sid: player.sid };
    });
    const message = {
        sponsor: 'system',
        msg: content,
        type: 'system'
    };
    pinus_1.pinus.app.channelService.pushMessageByUids('notice', message, uidSidArr, errHandler);
    return true;
}
exports.systemNotice = systemNotice;
;
function startBigWinNotice() {
    let timeoutObj = setTimeout(async () => {
        let data = await NOTICEdb.pop();
        let message = JSON.parse(data);
        if (message) {
            try {
                sendNotice("notice", "bigWin", message.messageID, message.params);
            }
            catch (error) {
            }
        }
        clearTimeout(timeoutObj);
        startBigWinNotice();
    }, util.random(20 * 1000, 50 * 1000));
}
exports.startBigWinNotice = startBigWinNotice;
;
async function sendBigWinNotice(nid, nickname, profit, isRobot, headurl = 'head1') {
    profit = Math.floor(profit / 100);
    let params = [nickname, nid, profit, isRobot, headurl];
    let noticeData = await NOTICEdb.getLen();
    if (isRobot === RoleEnum_1.RoleEnum.ROBOT && profit > 20000) {
        return;
    }
    if (isRobot === RoleEnum_1.RoleEnum.ROBOT && noticeData.length >= hallConst.NOTEMAXNUM) {
        return;
    }
    if (isRobot !== RoleEnum_1.RoleEnum.ROBOT && noticeData.length >= hallConst.NOTEMAXNUM) {
        await NOTICEdb.pop();
        return;
    }
    let data = { messageID: 'id_10000', isRobot, params };
    NOTICEdb.push(JSON.stringify(data));
}
exports.sendBigWinNotice = sendBigWinNotice;
;
async function sendNotice(route, type, messageID, params) {
    const players = await Player_manager_1.default.findListRedisInUidsForSid();
    if (!players.length) {
        return;
    }
    let playersLanguageInfo = {};
    players.forEach(player => {
        if (!playersLanguageInfo[player.language]) {
            playersLanguageInfo[player.language] = [];
        }
        playersLanguageInfo[player.language].push({ uid: player.uid, sid: player.sid });
    });
    const messageTask = [];
    for (let playerLanguage in playersLanguageInfo) {
        let message = { msg: null, type: null, sponsor: null, name: null, gameName: null, winNum: null, headUrl: null };
        let params_temp = util.clone(params);
        let nid = params_temp[1];
        try {
            if (messageID == 'id_10000') {
                params_temp[1] = langsrv.getlanguage(playerLanguage, langsrv.Net_Message.id_game_name[`nid_${params_temp[1]}`]);
            }
        }
        catch (error) {
            console.error("sendNotice 翻译请放到指定字段 特定格式", nid);
        }
        message.name = params_temp[0];
        message.gameName = params_temp[1];
        message.winNum = params_temp[2];
        message.headUrl = params_temp[4];
        message.msg = langsrv.getlanguage(playerLanguage, langsrv.Net_Message[messageID], ...params_temp);
        message.type = type;
        message.sponsor = '';
        messageTask.push({
            message: message,
            receivers: playersLanguageInfo[playerLanguage]
        });
    }
    messageTask.forEach(task => {
        pinus_1.pinus.app.channelService.pushMessageByUids(route, task.message, task.receivers, errHandler);
    });
}
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWVzc2FnZVNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9hcHAvc2VydmljZXMvTWVzc2FnZVNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7QUFFYixpQ0FBOEI7QUFDOUIsaUNBQWlDO0FBQ2pDLGlEQUFpRDtBQUNqRCx5REFBeUQ7QUFDekQscUVBQXFFO0FBQ3JFLDRFQUFvRTtBQUNwRSwrQ0FBeUM7QUFDekMsTUFBTSxNQUFNLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztBQUNuRCw0Q0FBNkM7QUFDN0MsaUVBQThEO0FBQzlELDJEQUF5RDtBQUV6RCxJQUFJLFFBQVEsR0FBRztJQUNYLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBUztRQUNoQixPQUFPLE1BQU0sWUFBWSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsc0JBQXNCLEVBQUUsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFO1FBQy9GLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUNELEtBQUssQ0FBQyxHQUFHO1FBQ0wsT0FBTyxNQUFNLFlBQVksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLHNCQUFzQixDQUFDLENBQUM7SUFDekUsQ0FBQztJQUNELEtBQUssQ0FBQyxNQUFNO1FBQ1IsT0FBTyxNQUFNLFlBQVksQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLHNCQUFzQixDQUFDLENBQUM7SUFDbEYsQ0FBQztDQUNKLENBQUM7QUFNRixTQUFnQixpQkFBaUIsQ0FBQyxLQUFhLEVBQUUsR0FBUSxFQUFFLElBQW1FO0lBQzFILElBQUksU0FBUyxHQUFhLEVBQUUsQ0FBQztJQUM3QixJQUFJLE9BQU8sR0FBbUMsRUFBRSxDQUFDO0lBQ2pELElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQ3RCLElBQUksSUFBSSxDQUFD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