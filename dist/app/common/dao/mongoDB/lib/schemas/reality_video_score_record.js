'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.reality_video_score_record = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    uid: String,
    username: String,
    changeIntegral: Number,
    createDateTime: Number,
}, { versionKey: false });
exports.reality_video_score_record = (0, mongoose_1.model)("reality_video_score_record", schema, 'reality_video_score_record');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVhbGl0eV92aWRlb19zY29yZV9yZWNvcmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9tb25nb0RCL2xpYi9zY2hlbWFzL3JlYWxpdHlfdmlkZW9fc2NvcmVfcmVjb3JkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBQ2IsdUNBQWdFO0FBV2hFLE1BQU0sTUFBTSxHQUFHLElBQUksaUJBQU0sQ0FBQztJQUN0QixHQUFHLEVBQUUsTUFBTTtJQUNYLFFBQVEsRUFBRSxNQUFNO0lBQ2hCLGNBQWMsRUFBRSxNQUFNO0lBQ3RCLGNBQWMsRUFBRSxNQUFNO0NBQ3pCLEVBQUUsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztBQUdiLFFBQUEsMEJBQTBCLEdBQUcsSUFBQSxnQkFBSyxFQUE4Qiw0QkFBNEIsRUFBRSxNQUFNLEVBQUUsNEJBQTRCLENBQUMsQ0FBQyJ9