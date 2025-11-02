'use strict';

import { pinus } from 'pinus';
import * as util from '../utils';
import * as hallConst from '../consts/hallConst';
import * as DatabaseConst from '../consts/databaseConst';
import * as redisManager from '../common/dao/redis/lib/redisManager';
import PlayerManager from '../common/dao/daoManager/Player.manager';
import { getLogger } from 'pinus-logger';
const Logger = getLogger('server_out', __filename);
import langsrv = require('./common/langsrv');
import { RoleEnum } from '../common/constant/player/RoleEnum';
import { globalEvent } from "../common/event/redisEvent";

let NOTICEdb = {
    async push(data: any) {
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


/**
 * 消息推送类
 */
export function pushMessageByUids(route: string, msg: any, uids: { uid: string, sid: string }[] | { uid: string, sid: string }) {
    let RobotUids: string[] = [];
    let uidsArr: { uid: string, sid: string }[] = [];
    if (!Array.isArray(uids)) {
        if (uids.sid == "robot") {
            RobotUids.push(uids.uid);
        } else {
            uidsArr = [uids];
        }
    } else {
        for (const It of uids) {
            if (It.sid == "robot") {
                RobotUids.push(It.uid)
            } else {
                uidsArr.push({ uid: It.uid, sid: It.sid });
            }
        }
    }

    if (util.isVoid(uidsArr) && RobotUids.length == 0) {
        return;
    }
    uidsArr = uidsArr.filter(m => !!m);
    if (uidsArr.length !== 0) {
        pinus.app.channelService.pushMessageByUids(route, msg, uidsArr, errHandler);
    }
    for (const uid of RobotUids) {
        globalEvent.emit("doForward", uid, route, msg);
    }
};



function errHandler(err, fails) {
    if (!!err) {
        console.error('Push Message error! %j', err.stack);
    }
}

/**
 * 获取bigWin消息
 * @param language 语言
 * @param nickname 玩家名字
 * @param gameName 游戏名字
 * @param num 赢的金币
 */
function getBigWinMessage(language: string, nickname: string, gameName: string, num: number) {
    return langsrv.getlanguage(language, langsrv.Net_Message.id_10000, nickname, gameName, num);
}


export interface notice_Interface {
    route?: any,
    nickname?: any,
    game?: any,
    VIP_ENV?: number
    uid?: string,
    session?: any,
    content?: string,
    des?: string,
    language?: string,
}

export async function notice(data: notice_Interface, callback?) {
    // 获取所有在线的玩家
    try {
        const players = await PlayerManager.findListRedisInUidsForSid();
        // 没有玩家就返回
        if (!players.length) {
            return !!callback && callback();
        }
        // 所有玩家的 uid和sid
        const uidSidArr = players.map(player => {
            return { uid: player.uid, sid: player.sid };
        });
        // 存储需要发送消息的种类
        const messageTask = [];
        let message; // 通知的 内容
        switch (data.route) {
            // 给所有在线玩家发系统公告
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
                // 普通版 jackpotWin 的时候有 jackpotType
                if (data.route === 'onJackpotWin') {
                    message.jackpotType = data.game.jackpotType;
                }
                // 普通版本
                const gameName = langsrv.getlanguage(data.language, langsrv.Net_Message.id_game_name[`nid_${data.game.nid}`]);
                //玩家利润需要除100
                let profit = Math.floor(data.game.num / 100 );
                message.msg = getBigWinMessage(data.language, data.game.nickname, gameName,  profit);
                messageTask.push({
                    message,
                    receivers: uidSidArr
                });
                break;
            default:
                Logger.error('MailService.notice ==> route 错误：', data.route);
                return !!callback && callback();
        }
        // 开始发送消息
        messageTask.forEach(task => {
            pinus.app.channelService.pushMessageByUids('notice', task.message, task.receivers, errHandler);
        });
        return !!callback && callback();
    } catch (error) {
        Logger.error('MessageService.notice ==> 发送消息出错：', error);
        return !!callback && callback();
    }
};

/**发送系统消息 */
export async function systemNotice({ route, content, language }) {
    const players = await PlayerManager.findListRedisInUidsForSid();
    // 没有玩家，返回
    if (util.isVoid(players)) {
        return false;
    }
    // // 所有玩家的 uid和sid
    const uidSidArr = players.map(player => {
        return { uid: player.uid, sid: player.sid };
    });
    // 存储需要发送消息的种类
    const message = {
        sponsor: 'system',
        msg: content,
        type: 'system'
    };
    pinus.app.channelService.pushMessageByUids('notice', message, uidSidArr, errHandler);
    return true;
};



/**开启定时播放跑马灯 */
export function startBigWinNotice() {
    let timeoutObj = setTimeout(async () => {
        let data = await NOTICEdb.pop();
        let message = JSON.parse(data);
        if (message) {
            try {
                sendNotice("notice", "bigWin", message.messageID, message.params);
            } catch (error) {
            }
        }

        clearTimeout(timeoutObj);
        startBigWinNotice();
    }, util.random(20 * 1000, 50 * 1000));
};

/**跑马灯数据存到缓存 */
export async function sendBigWinNotice(nid: string, nickname: string, profit: number, isRobot: number , headurl:string = 'head1') {
    //前端直接使用，所以服务器要进行除100
    profit  = Math.floor(profit / 100);

    let params = [nickname,  nid, profit ,isRobot, headurl];
    let noticeData = await NOTICEdb.getLen();
    //如果机器人得走马灯金币大于2W就不走跑马灯了
    if (isRobot === RoleEnum.ROBOT && profit > 20000) {
        return;
    }
    // 如果是机器人满了就不添加了
    if (isRobot === RoleEnum.ROBOT && noticeData.length >= hallConst.NOTEMAXNUM) {
        return;
    }
    // 如果不是机器人，在现有缓存中删除一条机器人的，如果没有机器人的就废弃当前的通知
    if (isRobot !== RoleEnum.ROBOT && noticeData.length >= hallConst.NOTEMAXNUM) {
        await NOTICEdb.pop()
        return;
    }
    let data = { messageID: 'id_10000', isRobot, params };
    NOTICEdb.push(JSON.stringify(data));

};

/**新的发送公告接口 */
async function sendNotice(route: string, type, messageID: string, params) {
    const players = await PlayerManager.findListRedisInUidsForSid();
    // 没有玩家就返回
    if (!players.length) {
        return;
    }
    // 把玩家按照语言分成不同类型
    let playersLanguageInfo = {};
    // 把不同语言的玩家存到不同的数组中

    players.forEach(player => {
        if (!playersLanguageInfo[player.language]) {
            playersLanguageInfo[player.language] = [];
        }
        playersLanguageInfo[player.language].push({ uid: player.uid, sid: player.sid });
    });
    // 按照不同语言的玩家，设置不同的发送内容
    const messageTask = [];
    // 按照不同语言的玩家，设置不同的发送内容,发送给大厅
    for (let playerLanguage in playersLanguageInfo) {
        let message = { msg: null, type: null, sponsor: null , name: null , gameName : null , winNum: null , headUrl :null };
        // let hallMessage = {name: null ,type : "bigWin" , gameName : null , winNum: null , headUrl :null };
        let params_temp = util.clone(params);
        let nid = params_temp[1];
        try {
            if (messageID == 'id_10000') {
                params_temp[1] = langsrv.getlanguage(playerLanguage, langsrv.Net_Message.id_game_name[`nid_${params_temp[1]}`]);
            }
        } catch (error) {
            console.error("sendNotice 翻译请放到指定字段 特定格式", nid);
        }
        //大厅的走马灯
        message.name  = params_temp[0];
        message.gameName  = params_temp[1];
        message.winNum  = params_temp[2];
        message.headUrl  = params_temp[4];

        // messageForHallTask.push({
        //     hallMessage:hallMessage,
        //     receivers: playersLanguageInfo[playerLanguage],
        // })

        //走马灯
        message.msg = langsrv.getlanguage(playerLanguage, langsrv.Net_Message[messageID], ...params_temp);
        message.type = type;
        message.sponsor = '';
        messageTask.push({
            // message: getMessage(playerLanguage, nickname, game),
            message: message,
            receivers: playersLanguageInfo[playerLanguage]
        });
    }


    // 开始发送消息
    messageTask.forEach(task => {
        pinus.app.channelService.pushMessageByUids(route, task.message, task.receivers, errHandler);
    });


    // //开始给大厅发送消息
    // messageForHallTask.forEach(task =>{
    //     console.warn("task......messageForHallTask",task)
    //     pinus.app.channelService.pushMessageByUids("bingWin", task.hallMessage, task.receivers, errHandler);
    // })
};


// export async function sendRollWinNotice(nid: string, winuid, winnickname, winmoney) {

//     await sendRollWinNotice11(nid, winuid, winnickname, winmoney);


// };

// async function sendRollWinNotice11(nid, winuid, winnickname, winmoney) {
//     let route = 'RollNotice';
//     let type = 'RollWin';
//     const game = await gameManager.getOneGame(nid);
//     const players = game ? game.users : [];
//     // 没有玩家就返回
//     if (!players.length) {
//         return;
//     }
//     // 把玩家按照语言分成不同类型
//     const playersLanguageInfo = {};
//     // 把不同语言的玩家存到不同的数组中
//     playersLanguageInfo['chinese'] = [];
//     players.forEach(player => {
//         playersLanguageInfo['chinese'].push({ uid: player.uid, sid: player.frontendServerId });
//     });
//     // 按照不同语言的玩家，设置不同的发送内容
//     const messageTask = [];
//     for (let playerLanguage in playersLanguageInfo) {
//         let message = { winuid: null, winnickname: null, winmoney: null, type: null, sponsor: null };
//         //message.msg = langsrv.getMessage.apply(this, [playerLanguage, messageID].concat(params));
//         message.winuid = winuid;
//         message.winnickname = winnickname;
//         message.winmoney = winmoney;
//         message.type = type;
//         message.sponsor = '';
//         messageTask.push({
//             // message: getMessage(playerLanguage, nickname, game),
//             message: message,
//             receivers: playersLanguageInfo[playerLanguage]
//         });
//     }
//     // 开始发送消息
//     messageTask.forEach(task => {
//         pinus.app.channelService.pushMessageByUids(route, task.message, task.receivers, errHandler);
//     });
// };


