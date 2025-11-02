'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.daili_liushui_record = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    id: String,
    dailiUid: String,
    yazhuLiushui: Number,
    jianjieLiushui: Number,
    jianjieLiushuiProfits: Number,
    zhijieLiushui: Number,
    zhijieLiushuiProfits: Number,
    createTime: Number,
    allPeople: Number,
    zhiShuPeople: Number,
    alreadyTiqu: Number,
    jianjieLiushuiNoCellPhone: Number,
    zhijieLiushuiNoCellPhone: Number,
}, { versionKey: false });
exports.daili_liushui_record = (0, mongoose_1.model)("daili_liushui_record", schema, 'daili_liushui_record');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGFpbGlfbGl1c2h1aV9yZWNvcmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9tb25nb0RCL2xpYi9zY2hlbWFzL2RhaWxpX2xpdXNodWlfcmVjb3JkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBS2IsdUNBQW1EO0FBZ0JuRCxNQUFNLE1BQU0sR0FBRyxJQUFJLGlCQUFNLENBQUM7SUFDdEIsRUFBRSxFQUFFLE1BQU07SUFDVixRQUFRLEVBQUUsTUFBTTtJQUNoQixZQUFZLEVBQUUsTUFBTTtJQUNwQixjQUFjLEVBQUUsTUFBTTtJQUN0QixxQkFBcUIsRUFBRSxNQUFNO0lBQzdCLGFBQWEsRUFBRSxNQUFNO0lBQ3JCLG9CQUFvQixFQUFFLE1BQU07SUFDNUIsVUFBVSxFQUFFLE1BQU07SUFDbEIsU0FBUyxFQUFFLE1BQU07SUFDakIsWUFBWSxFQUFFLE1BQU07SUFDcEIsV0FBVyxFQUFFLE1BQU07SUFDbkIseUJBQXlCLEVBQUUsTUFBTTtJQUNqQyx3QkFBd0IsRUFBRSxNQUFNO0NBQ25DLEVBQUUsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztBQUViLFFBQUEsb0JBQW9CLEdBQUcsSUFBQSxnQkFBSyxFQUF3QixzQkFBc0IsRUFBRSxNQUFNLEVBQUUsc0JBQXNCLENBQUMsQ0FBQyJ9