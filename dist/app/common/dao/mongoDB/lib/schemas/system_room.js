'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.system_room = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    serverId: String,
    nid: String,
    roomId: String,
    jackpot: Number,
    createTime: Number,
    runningPool: Number,
    profitPool: Number,
    currJackpot: {
        jackpot: Number,
        runningPool: Number,
        profitPool: Number
    },
    outRate: Number,
    socialDot: Number,
    matchDot: Number,
    winTotal: Number,
    consumeTotal: Number,
    boomNum: Number,
    open: Boolean,
    sceneId: Number,
    users: [],
    jackpotShow: {},
    wangJackpot: Number,
    betUpperLimit: {},
    entryCond: Number,
    enterVIPScore: Number,
}, { versionKey: false });
exports.system_room = (0, mongoose_1.model)("system_room", schema, 'system_room');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3lzdGVtX3Jvb20uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9tb25nb0RCL2xpYi9zY2hlbWFzL3N5c3RlbV9yb29tLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBRWIsdUNBQWdFO0FBaUNoRSxNQUFNLE1BQU0sR0FBRyxJQUFJLGlCQUFNLENBQUM7SUFDdEIsUUFBUSxFQUFFLE1BQU07SUFDaEIsR0FBRyxFQUFFLE1BQU07SUFDWCxNQUFNLEVBQUUsTUFBTTtJQUNkLE9BQU8sRUFBRSxNQUFNO0lBQ2YsVUFBVSxFQUFFLE1BQU07SUFDbEIsV0FBVyxFQUFFLE1BQU07SUFDbkIsVUFBVSxFQUFFLE1BQU07SUFDbEIsV0FBVyxFQUFFO1FBQ1QsT0FBTyxFQUFFLE1BQU07UUFDZixXQUFXLEVBQUUsTUFBTTtRQUNuQixVQUFVLEVBQUUsTUFBTTtLQUNyQjtJQUNELE9BQU8sRUFBRSxNQUFNO0lBQ2YsU0FBUyxFQUFFLE1BQU07SUFDakIsUUFBUSxFQUFFLE1BQU07SUFDaEIsUUFBUSxFQUFFLE1BQU07SUFDaEIsWUFBWSxFQUFFLE1BQU07SUFDcEIsT0FBTyxFQUFFLE1BQU07SUFDZixJQUFJLEVBQUUsT0FBTztJQUViLE9BQU8sRUFBRSxNQUFNO0lBQ2YsS0FBSyxFQUFFLEVBQUU7SUFDVCxXQUFXLEVBQUUsRUFBRTtJQUNmLFdBQVcsRUFBRSxNQUFNO0lBQ25CLGFBQWEsRUFBRSxFQUFFO0lBQ2pCLFNBQVMsRUFBRSxNQUFNO0lBQ2pCLGFBQWEsRUFBRSxNQUFNO0NBQ3hCLEVBQUUsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztBQUViLFFBQUEsV0FBVyxHQUFHLElBQUEsZ0JBQUssRUFBZSxhQUFhLEVBQUUsTUFBTSxFQUFFLGFBQWEsQ0FBQyxDQUFDIn0=