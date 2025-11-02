"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.alarm_event_thing = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    uid: String,
    thirdUid: String,
    gameName: String,
    nid: String,
    thingType: Number,
    type: Number,
    status: { type: Number, index: true },
    createTime: Number,
    input: Number,
    win: Number,
    intoRmb: Number,
    oneWin: Number,
    oneAddRmb: Number,
    dayWin: Number,
    sceneId: Number,
    managerId: String
}, { versionKey: false });
exports.alarm_event_thing = (0, mongoose_1.model)("alarm_event_thing", schema, 'alarm_event_thing');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWxhcm1fZXZlbnRfdGhpbmcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9tb25nb0RCL2xpYi9zY2hlbWFzL2FsYXJtX2V2ZW50X3RoaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUlBLHVDQUFnRTtBQW9CaEUsTUFBTSxNQUFNLEdBQUcsSUFBSSxpQkFBTSxDQUFDO0lBQ3RCLEdBQUcsRUFBRSxNQUFNO0lBQ1gsUUFBUSxFQUFFLE1BQU07SUFDaEIsUUFBUSxFQUFFLE1BQU07SUFDaEIsR0FBRyxFQUFFLE1BQU07SUFDWCxTQUFTLEVBQUUsTUFBTTtJQUNqQixJQUFJLEVBQUUsTUFBTTtJQUNaLE1BQU0sRUFBRSxFQUFDLElBQUksRUFBQyxNQUFNLEVBQUcsS0FBSyxFQUFDLElBQUksRUFBRTtJQUNuQyxVQUFVLEVBQUUsTUFBTTtJQUNsQixLQUFLLEVBQUUsTUFBTTtJQUNiLEdBQUcsRUFBRyxNQUFNO0lBQ1osT0FBTyxFQUFHLE1BQU07SUFDaEIsTUFBTSxFQUFHLE1BQU07SUFDZixTQUFTLEVBQUcsTUFBTTtJQUNsQixNQUFNLEVBQUcsTUFBTTtJQUNmLE9BQU8sRUFBRyxNQUFNO0lBQ2hCLFNBQVMsRUFBRyxNQUFNO0NBQ3JCLEVBQUUsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztBQUViLFFBQUEsaUJBQWlCLEdBQUcsSUFBQSxnQkFBSyxFQUFxQixtQkFBbUIsRUFBRSxNQUFNLEVBQUUsbUJBQW1CLENBQUMsQ0FBQyJ9