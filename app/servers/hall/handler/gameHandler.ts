import { Application, BackendSession } from "pinus";
import langsrv = require("../../../services/common/langsrv");
import PlayerManagerDao from "../../../common/dao/daoManager/Player.manager";
import GameManagerDao from "../../../common/dao/daoManager/Game.manager";
import SystemGameTypeManagerDao from "../../../common/dao/daoManager/SystemGameType.manager";
import GameRecordMysqlDao from "../../../common/dao/mysql/GameRecord.mysql.dao";
import { getLogger } from "pinus-logger";
const front_game_scenes = require('../../../../config/data/front_game_scenes.json');
import * as ServerCurrentNumbersPlayersDao from "../../../common/dao/redis/ServerCurrentNumbersPlayersDao";
import { random } from "../../../utils/index";
const Logger = getLogger("server_out", __filename);
import * as moment from "moment";
export default function (app: Application) {
    return new gameHandler(app);
}

export class gameHandler {
    constructor(private app: Application) {
    }
    /** 获取玩家的最近20条游戏记录
     * @route hall.gameHandler.gameRecord
     */
    async gameRecord(msg: { nid }, session: BackendSession) {
        let language = null;
        try {
            const uid = session.uid;
            const player = await PlayerManagerDao.findOne({ uid }, false);
            if (!player) {
                return { code: 500, error: langsrv.getlanguage(player.language, langsrv.Net_Message.id_14) };
            }
            const nid = msg.nid;
            if (!uid || !nid) {
                return { code: 500, error: langsrv.getlanguage(player.language, langsrv.Net_Message.id_14) };
            }
            language = player.language ? player.language : 'chinese_zh';
            
            let tableName = moment().format("YYYYMM");
            let table = `Sp_GameRecord_${tableName}`;
            if(player.group_id){
                table = `Sp_GameRecord_${player.group_id}_${tableName}`
            }
            const result = await GameRecordMysqlDao.findListForGameScene(table, nid, uid );
            if (!result) {
                return { code: 200, result: [] };
            }

            let languageGames = front_game_scenes[language];
            const redPacketRecordList = result.map((recordInfo) => {
                let sceneName = null;
                const games =  languageGames.find(x=>x.nid == recordInfo.nid);
                if(games){
                    let scene = games.scenes.find(x=>x.scene == recordInfo.sceneId);
                    if(scene){
                        sceneName = scene.name;
                    }
                }
                recordInfo.roomId = sceneName;
                recordInfo.createTimeDate = moment(recordInfo.createTimeDate).format("YYYY-MM-DD HH:mm:ss");
                return recordInfo;
            });
            return { code: 200, result: redPacketRecordList };
        } catch (error) {
            Logger.error(`hall.gameHandler.gameRecord: ${error.stack || error.message || JSON.stringify(error)}`);
            return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_14) };
        }
    }


    /** 获取玩家的最近20条游戏记录
     * @route hall.gameHandler.hotGames
     */
    async hotGames(msg: { nid }, session: BackendSession) {
        let language = null;
        try {
            const uid = session.uid;
            const player = await PlayerManagerDao.findOne({ uid }, false);
            if (!player) {
                return { code: 500, error: langsrv.getlanguage(player.language, langsrv.Net_Message.id_14) };
            }
            const games = await SystemGameTypeManagerDao.findOne({ typeId: 1 });
            if (!games) {
                return { code: 200, result: [] };
            }
            let list = [];
            let nidList = games.nidList;
            let hotNidList = nidList.filter(x => x.ishot == true);
            let gamesList = await GameManagerDao.findList({});
            for (let hotGame of hotNidList) {
                const game = gamesList.find(x => x.nid == hotGame.nid);
                if (game) {
                    // let serverName = game.name;
                    // const playerLength = await ServerCurrentNumbersPlayersDao.findByServerId(`${serverName}-server-1`);
                    const playerLength = random(111,357);
                    const info = {
                        nid: hotGame.nid,
                        sort: hotGame.hsort,
                        playerLength: Number(playerLength),
                    }
                    list.push(info);
                }
            }
            list.sort((a, b) => a.sort - b.sort);
            return { code: 200, hotNidList: list };
        } catch (error) {
            Logger.error(`hall.gameHandler.gameRecord: ${error.stack || error.message || JSON.stringify(error)}`);
            return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_14) };
        }
    }
}
