'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.game_record_backup = exports.game_record = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    uid: { type: String, index: true },
    superior: String,
    groupRemark: { type: String, index: true },
    group_id: { type: String, index: true },
    nickname: String,
    nid: { type: String, index: true },
    thirdUid: String,
    sceneId: Number,
    gname: String,
    createTime: Number,
    input: Number,
    validBet: Number,
    win: Number,
    bet_commission: Number,
    win_commission: Number,
    settle_commission: Number,
    multiple: Number,
    profit: Number,
    gold: Number,
    playStatus: Number,
    isDealer: Boolean,
    addRmb: Number,
    addTixian: Number,
    gameOrder: String,
    game_record_live_id: String,
    roomId: String,
    roundId: String,
    seat: Number,
    playersNumber: Number,
    result: String,
    startTime: String,
    endTime: String,
}, { versionKey: false });
exports.game_record = (0, mongoose_1.model)("game_record", schema, 'game_record');
exports.game_record_backup = (0, mongoose_1.model)("game_record_backup", schema, 'game_record_backup');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2FtZV9yZWNvcmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9tb25nb0RCL2xpYi9zY2hlbWFzL2dhbWVfcmVjb3JkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBRWIsdUNBQW1EO0FBeUNuRCxNQUFNLE1BQU0sR0FBRyxJQUFJLGlCQUFNLENBQUM7SUFDekIsR0FBRyxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFO0lBQy9CLFFBQVEsRUFBRyxNQUFNO0lBQ2pCLFdBQVcsRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRTtJQUMxQyxRQUFRLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUU7SUFDMUMsUUFBUSxFQUFFLE1BQU07SUFDaEIsR0FBRyxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFO0lBQ2xDLFFBQVEsRUFBRyxNQUFNO0lBQ2pCLE9BQU8sRUFBRSxNQUFNO0lBRWYsS0FBSyxFQUFFLE1BQU07SUFDYixVQUFVLEVBQUUsTUFBTTtJQUNsQixLQUFLLEVBQUUsTUFBTTtJQUNWLFFBQVEsRUFBRSxNQUFNO0lBQ25CLEdBQUcsRUFBRSxNQUFNO0lBQ1gsY0FBYyxFQUFFLE1BQU07SUFDdEIsY0FBYyxFQUFFLE1BQU07SUFDdEIsaUJBQWlCLEVBQUUsTUFBTTtJQUN6QixRQUFRLEVBQUUsTUFBTTtJQUNoQixNQUFNLEVBQUUsTUFBTTtJQUNkLElBQUksRUFBRSxNQUFNO0lBQ1osVUFBVSxFQUFFLE1BQU07SUFDbEIsUUFBUSxFQUFFLE9BQU87SUFDakIsTUFBTSxFQUFFLE1BQU07SUFDZCxTQUFTLEVBQUUsTUFBTTtJQUNqQixTQUFTLEVBQUUsTUFBTTtJQUNqQixtQkFBbUIsRUFBRSxNQUFNO0lBTTNCLE1BQU0sRUFBRSxNQUFNO0lBQ2QsT0FBTyxFQUFFLE1BQU07SUFDZixJQUFJLEVBQUUsTUFBTTtJQUNaLGFBQWEsRUFBRSxNQUFNO0lBQ3JCLE1BQU0sRUFBRSxNQUFNO0lBQ2QsU0FBUyxFQUFFLE1BQU07SUFDakIsT0FBTyxFQUFFLE1BQU07Q0FDZixFQUFFLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7QUFHYixRQUFBLFdBQVcsR0FBRyxJQUFBLGdCQUFLLEVBQWUsYUFBYSxFQUFFLE1BQU0sRUFBRSxhQUFhLENBQUMsQ0FBQztBQUN4RSxRQUFBLGtCQUFrQixHQUFHLElBQUEsZ0JBQUssRUFBZSxvQkFBb0IsRUFBRSxNQUFNLEVBQUUsb0JBQW9CLENBQUMsQ0FBQyJ9