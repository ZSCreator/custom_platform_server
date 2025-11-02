'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.receive_mail_record = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    mailId: String,
    uid: String,
    name: String,
    sender: String,
    content: String,
    sendTime: Number,
    createTime: Number,
    attachment: mongoose_1.SchemaTypes.Mixed,
}, { versionKey: false });
exports.receive_mail_record = (0, mongoose_1.model)("receive_mail_record", schema, 'receive_mail_record');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVjZWl2ZV9tYWlsX3JlY29yZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL21vbmdvREIvbGliL3NjaGVtYXMvcmVjZWl2ZV9tYWlsX3JlY29yZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUtiLHVDQUFnRTtBQVdoRSxNQUFNLE1BQU0sR0FBRyxJQUFJLGlCQUFNLENBQUM7SUFDbEIsTUFBTSxFQUFFLE1BQU07SUFDZCxHQUFHLEVBQUUsTUFBTTtJQUNYLElBQUksRUFBRSxNQUFNO0lBQ1osTUFBTSxFQUFFLE1BQU07SUFDZCxPQUFPLEVBQUUsTUFBTTtJQUNmLFFBQVEsRUFBRSxNQUFNO0lBQ2hCLFVBQVUsRUFBRSxNQUFNO0lBQ2xCLFVBQVUsRUFBRSxzQkFBVyxDQUFDLEtBQUs7Q0FDcEMsRUFBRSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0FBR2IsUUFBQSxtQkFBbUIsR0FBRyxJQUFBLGdCQUFLLEVBQXVCLHFCQUFxQixFQUFFLE1BQU0sRUFBRSxxQkFBcUIsQ0FBQyxDQUFDIn0=