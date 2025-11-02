'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.big_post_notice = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    nickname: String,
    content: String,
    uid: String,
    time: Number,
}, { versionKey: false });
exports.big_post_notice = (0, mongoose_1.model)("big_post_notice", schema, 'big_post_notice');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmlnX3Bvc3Rfbm90aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vbW9uZ29EQi9saWIvc2NoZW1hcy9iaWdfcG9zdF9ub3RpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7QUFLYix1Q0FBbUQ7QUFRbkQsTUFBTSxNQUFNLEdBQUcsSUFBSSxpQkFBTSxDQUFDO0lBQ3pCLFFBQVEsRUFBRSxNQUFNO0lBQ2hCLE9BQU8sRUFBRSxNQUFNO0lBQ2YsR0FBRyxFQUFFLE1BQU07SUFDWCxJQUFJLEVBQUUsTUFBTTtDQUNaLEVBQUUsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztBQUViLFFBQUEsZUFBZSxHQUFHLElBQUEsZ0JBQUssRUFBbUIsaUJBQWlCLEVBQUUsTUFBTSxFQUFFLGlCQUFpQixDQUFDLENBQUMifQ==