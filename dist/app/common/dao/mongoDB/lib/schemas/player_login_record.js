'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.player_login_record = void 0;
const mongoose_1 = require("mongoose");
const index_1 = require("../plugins/index");
const schema = new mongoose_1.Schema({
    uid: String,
    nickname: String,
    loginTime: Number,
    leaveTime: Number,
    ip: String,
    gold: {},
    addRmb: Number,
}, { versionKey: false });
schema.plugin(index_1.plugins, { index: true });
exports.player_login_record = (0, mongoose_1.model)("player_login_record", schema, 'player_login_record');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxheWVyX2xvZ2luX3JlY29yZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL21vbmdvREIvbGliL3NjaGVtYXMvcGxheWVyX2xvZ2luX3JlY29yZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUViLHVDQUFnRTtBQUNoRSw0Q0FBMkM7QUFZM0MsTUFBTSxNQUFNLEdBQUcsSUFBSSxpQkFBTSxDQUFDO0lBQ3RCLEdBQUcsRUFBRSxNQUFNO0lBQ1gsUUFBUSxFQUFFLE1BQU07SUFDaEIsU0FBUyxFQUFFLE1BQU07SUFDakIsU0FBUyxFQUFFLE1BQU07SUFDakIsRUFBRSxFQUFFLE1BQU07SUFDVixJQUFJLEVBQUUsRUFBRTtJQUNSLE1BQU0sRUFBRSxNQUFNO0NBQ2pCLEVBQUUsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztBQUUxQixNQUFNLENBQUMsTUFBTSxDQUFDLGVBQU8sRUFBRSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBRTNCLFFBQUEsbUJBQW1CLEdBQUcsSUFBQSxnQkFBSyxFQUF1QixxQkFBcUIsRUFBRSxNQUFNLEVBQUUscUJBQXFCLENBQUMsQ0FBQyJ9