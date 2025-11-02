"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vip_customer_info = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    gms_account_id: String,
    uid: String,
    name: String,
    qq_id: String,
    wechat_id: String,
    other_id: String,
    other_name: String,
    createTimeStamp: Number,
    sort: Number,
    isOpen: Boolean,
}, { versionKey: false });
exports.vip_customer_info = (0, mongoose_1.model)("vip_customer_info", schema, 'vip_customer_info');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlwX2N1c3RvbWVyX2luZm8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9tb25nb0RCL2xpYi9zY2hlbWFzL3ZpcF9jdXN0b21lcl9pbmZvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHVDQUFnRTtBQWNoRSxNQUFNLE1BQU0sR0FBRyxJQUFJLGlCQUFNLENBQUM7SUFDdEIsY0FBYyxFQUFFLE1BQU07SUFDdEIsR0FBRyxFQUFFLE1BQU07SUFDWCxJQUFJLEVBQUUsTUFBTTtJQUNaLEtBQUssRUFBRSxNQUFNO0lBQ2IsU0FBUyxFQUFFLE1BQU07SUFDakIsUUFBUSxFQUFFLE1BQU07SUFDaEIsVUFBVSxFQUFFLE1BQU07SUFDbEIsZUFBZSxFQUFFLE1BQU07SUFDdkIsSUFBSSxFQUFFLE1BQU07SUFDWixNQUFNLEVBQUUsT0FBTztDQUNsQixFQUFFLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7QUFFYixRQUFBLGlCQUFpQixHQUFHLElBQUEsZ0JBQUssRUFBcUIsbUJBQW1CLEVBQUUsTUFBTSxFQUFFLG1CQUFtQixDQUFDLENBQUMifQ==