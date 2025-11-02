"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameHandler = void 0;
const langsrv = require("../../../services/common/langsrv");
const Player_manager_1 = require("../../../common/dao/daoManager/Player.manager");
const Game_manager_1 = require("../../../common/dao/daoManager/Game.manager");
const SystemGameType_manager_1 = require("../../../common/dao/daoManager/SystemGameType.manager");
const GameRecord_mysql_dao_1 = require("../../../common/dao/mysql/GameRecord.mysql.dao");
const pinus_logger_1 = require("pinus-logger");
const front_game_scenes = require('../../../../config/data/front_game_scenes.json');
const index_1 = require("../../../utils/index");
const Logger = (0, pinus_logger_1.getLogger)("server_out", __filename);
const moment = require("moment");
function default_1(app) {
    return new gameHandler(app);
}
exports.default = default_1;
class gameHandler {
    constructor(app) {
        this.app = app;
    }
    async gameRecord(msg, session) {
        let language = null;
        try {
            const uid = session.uid;
            const player = await Player_manager_1.default.findOne({ uid }, false);
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
            if (player.group_id) {
                table = `Sp_GameRecord_${player.group_id}_${tableName}`;
            }
            const result = await GameRecord_mysql_dao_1.default.findListForGameScene(table, nid, uid);
            if (!result) {
                return { code: 200, result: [] };
            }
            let languageGames = front_game_scenes[language];
            const redPacketRecordList = result.map((recordInfo) => {
                let sceneName = null;
                const games = languageGames.find(x => x.nid == recordInfo.nid);
                if (games) {
                    let scene = games.scenes.find(x => x.scene == recordInfo.sceneId);
                    if (scene) {
                        sceneName = scene.name;
                    }
                }
                recordInfo.roomId = sceneName;
                recordInfo.createTimeDate = moment(recordInfo.createTimeDate).format("YYYY-MM-DD HH:mm:ss");
                return recordInfo;
            });
            return { code: 200, result: redPacketRecordList };
        }
        catch (error) {
            Logger.error(`hall.gameHandler.gameRecord: ${error.stack || error.message || JSON.stringify(error)}`);
            return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_14) };
        }
    }
    async hotGames(msg, session) {
        let language = null;
        try {
            const uid = session.uid;
            const player = await Player_manager_1.default.findOne({ uid }, false);
            if (!player) {
                return { code: 500, error: langsrv.getlanguage(player.language, langsrv.Net_Message.id_14) };
            }
            const games = await SystemGameType_manager_1.default.findOne({ typeId: 1 });
            if (!games) {
                return { code: 200, result: [] };
            }
            let list = [];
            let nidList = games.nidList;
            let hotNidList = nidList.filter(x => x.ishot == true);
            let gamesList = await Game_manager_1.default.findList({});
            for (let hotGame of hotNidList) {
                const game = gamesList.find(x => x.nid == hotGame.nid);
                if (game) {
                    const playerLength = (0, index_1.random)(111, 357);
                    const info = {
                        nid: hotGame.nid,
                        sort: hotGame.hsort,
                        playerLength: Number(playerLength),
                    };
                    list.push(info);
                }
            }
            list.sort((a, b) => a.sort - b.sort);
            return { code: 200, hotNidList: list };
        }
        catch (error) {
            Logger.error(`hall.gameHandler.gameRecord: ${error.stack || error.message || JSON.stringify(error)}`);
            return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_14) };
        }
    }
}
exports.gameHandler = gameHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2FtZUhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9oYWxsL2hhbmRsZXIvZ2FtZUhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsNERBQTZEO0FBQzdELGtGQUE2RTtBQUM3RSw4RUFBeUU7QUFDekUsa0dBQTZGO0FBQzdGLHlGQUFnRjtBQUNoRiwrQ0FBeUM7QUFDekMsTUFBTSxpQkFBaUIsR0FBRyxPQUFPLENBQUMsZ0RBQWdELENBQUMsQ0FBQztBQUVwRixnREFBOEM7QUFDOUMsTUFBTSxNQUFNLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztBQUNuRCxpQ0FBaUM7QUFDakMsbUJBQXlCLEdBQWdCO0lBQ3JDLE9BQU8sSUFBSSxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDaEMsQ0FBQztBQUZELDRCQUVDO0FBRUQsTUFBYSxXQUFXO0lBQ3BCLFlBQW9CLEdBQWdCO1FBQWhCLFFBQUcsR0FBSCxHQUFHLENBQWE7SUFDcEMsQ0FBQztJQUlELEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBWSxFQUFFLE9BQXVCO1FBQ2xELElBQUksUUFBUSxHQUFHLElBQUksQ0FBQztRQUNwQixJQUFJO1lBQ0EsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQztZQUN4QixNQUFNLE1BQU0sR0FBRyxNQUFNLHdCQUFnQixDQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzlELElBQUksQ0FBQyxNQUFNLEVBQUU7Z0JBQ1QsT0FBTyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUM7YUFDaEc7WUFDRCxNQUFNLEdBQUcsR0FBRyxH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