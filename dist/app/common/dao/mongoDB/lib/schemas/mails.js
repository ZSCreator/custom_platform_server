'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.mails = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    id: String,
    uid: { "type": String, "index": true },
    img: String,
    sender: String,
    name: String,
    content: String,
    reason: String,
    type: Number,
    time: Number,
    isRead: Boolean,
    isdelete: Boolean
}, { versionKey: false });
exports.mails = (0, mongoose_1.model)("mails", schema, 'mails');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9tb25nb0RCL2xpYi9zY2hlbWFzL21haWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBRWIsdUNBQWdFO0FBaUJoRSxNQUFNLE1BQU0sR0FBRyxJQUFJLGlCQUFNLENBQUM7SUFDdEIsRUFBRSxFQUFFLE1BQU07SUFDVixHQUFHLEVBQUUsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUU7SUFDdEMsR0FBRyxFQUFFLE1BQU07SUFDWCxNQUFNLEVBQUUsTUFBTTtJQUNkLElBQUksRUFBRSxNQUFNO0lBQ1osT0FBTyxFQUFFLE1BQU07SUFDZixNQUFNLEVBQUUsTUFBTTtJQUNkLElBQUksRUFBRSxNQUFNO0lBRVosSUFBSSxFQUFFLE1BQU07SUFDWixNQUFNLEVBQUUsT0FBTztJQUNmLFFBQVEsRUFBRSxPQUFPO0NBQ3BCLEVBQUUsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztBQUViLFFBQUEsS0FBSyxHQUFHLElBQUEsZ0JBQUssRUFBUyxPQUFPLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDIn0=