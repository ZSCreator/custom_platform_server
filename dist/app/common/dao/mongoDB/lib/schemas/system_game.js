"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.system_game = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    nid: String,
    sort: Number,
    name: String,
    zname: String,
    heatDegree: Number,
    onlineAwards: Number,
    opened: Boolean,
    closeTime: Number,
    whetherToShowScene: Boolean,
    whetherToShowRoom: Boolean,
    whetherToShowGamingInfo: Boolean,
    roomCount: Number,
    roomUserLimit: Number,
}, { versionKey: false });
exports.system_game = (0, mongoose_1.model)("system_game", schema, 'system_game');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3lzdGVtX2dhbWUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9tb25nb0RCL2xpYi9zY2hlbWFzL3N5c3RlbV9nYW1lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHVDQUFtRDtBQW1CbkQsTUFBTSxNQUFNLEdBQUcsSUFBSSxpQkFBTSxDQUFDO0lBQ3RCLEdBQUcsRUFBRSxNQUFNO0lBQ1gsSUFBSSxFQUFFLE1BQU07SUFDWixJQUFJLEVBQUUsTUFBTTtJQUNaLEtBQUssRUFBRSxNQUFNO0lBQ2IsVUFBVSxFQUFFLE1BQU07SUFDbEIsWUFBWSxFQUFFLE1BQU07SUFDcEIsTUFBTSxFQUFFLE9BQU87SUFDZixTQUFTLEVBQUUsTUFBTTtJQUNqQixrQkFBa0IsRUFBRSxPQUFPO0lBQzNCLGlCQUFpQixFQUFFLE9BQU87SUFDMUIsdUJBQXVCLEVBQUUsT0FBTztJQUNoQyxTQUFTLEVBQUUsTUFBTTtJQUNqQixhQUFhLEVBQUUsTUFBTTtDQUN4QixFQUFFLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7QUFHYixRQUFBLFdBQVcsR0FBRyxJQUFBLGdCQUFLLEVBQWMsYUFBYSxFQUFFLE1BQU0sRUFBRSxhQUFhLENBQUMsQ0FBQyJ9