'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.addNotPlayerProfitsRecord = void 0;
const MongoManager = require("../../common/dao/mongoDB/lib/mongoManager");
const Utils = require("../../utils");
const HttpErrorLog = require('pinus-logger').getLogger('server_out', __filename);
const DayNotPlayerProfits = MongoManager.day_not_player_profits;
const addNotPlayerProfitsRecord = async (uid, nickname, input, nid, gameOrder, gameType, gameName, numLevel, nextUid, superior, error) => {
    HttpErrorLog.info('addNotPlayerProfitsRecord', uid, nickname, input, nid, gameOrder, gameType, gameName, numLevel, nextUid, superior);
    try {
        const info = {
            id: Utils.id(),
            createTime: Date.now(),
            uid: uid,
            nickname: nickname,
            numLevel,
            input: input,
            nid: nid,
            nextUid,
            superior,
            gameName,
            gameOrder,
            gameType,
            error,
            status: 0,
        };
        await DayNotPlayerProfits.create(info);
        return Promise.resolve();
    }
    catch (error) {
        HttpErrorLog.error("addNotPlayerProfitsRecord ==>:", error);
        return Promise.resolve(error);
    }
};
exports.addNotPlayerProfitsRecord = addNotPlayerProfitsRecord;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWdlbnRCYWNrUHJvZml0c0RvbnRQZXJmb3JtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL3NlcnZpY2VzL2FnZW50TW9uZGVsUHJvZml0cy9BZ2VudEJhY2tQcm9maXRzRG9udFBlcmZvcm0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7QUFJYiwwRUFBMkU7QUFDM0UscUNBQXNDO0FBQ3RDLE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQ2pGLE1BQU0sbUJBQW1CLEdBQUcsWUFBWSxDQUFDLHNCQUFzQixDQUFDO0FBWXpELE1BQU0seUJBQXlCLEdBQUcsS0FBSyxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsRUFBRTtJQUM1SSxZQUFZLENBQUMsSUFBSSxDQUFDLDJCQUEyQixFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3RJLElBQUk7UUFDQSxNQUFNLElBQUksR0FBRztZQUNULEVBQUUsRUFBRSxLQUFLLENBQUMsRUFBRSxFQUFFO1lBQ2QsVUFBVSxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDdEIsR0FBRyxFQUFFLEdBQUc7WUFDUixRQUFRLEVBQUUsUUFBUTtZQUNsQixRQUFRO1lBQ1IsS0FBSyxFQUFFLEtBQUs7WUFDWixHQUFHLEVBQUUsR0FBRztZQUNSLE9BQU87WUFDUCxRQUFRO1lBQ1IsUUFBUTtZQUNSLFNBQVM7WUFDVCxRQUFRO1lBQ1IsS0FBSztZQUNMLE1BQU0sRUFBRSxDQUFDO1NBQ1osQ0FBQTtRQUNELE1BQU0sbUJBQW1CLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZDLE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzVCO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDWixZQUFZLENBQUMsS0FBSyxDQUFDLGdDQUFnQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzVELE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUNqQztBQUNMLENBQUMsQ0FBQTtBQXpCWSxRQUFBLHlCQUF5Qiw2QkF5QnJDIn0=