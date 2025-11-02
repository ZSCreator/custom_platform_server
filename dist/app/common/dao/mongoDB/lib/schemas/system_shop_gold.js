'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.system_shop_gold = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    id: String,
    name: String,
    dese: String,
    luckyGrass: Number,
    price: Number,
    coinType: Number,
    language: String,
    shopNum: Number,
    isOpen: Boolean,
    icon: String,
    url: String,
    gold: Number,
    btnTxt: String,
    noShowPayType: [],
    noShowPayMethod: [],
    sort: Number
}, { versionKey: false });
exports.system_shop_gold = (0, mongoose_1.model)("system_shop_gold", schema, 'system_shop_gold');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3lzdGVtX3Nob3BfZ29sZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL21vbmdvREIvbGliL3NjaGVtYXMvc3lzdGVtX3Nob3BfZ29sZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUViLHVDQUFnRTtBQXVCaEUsTUFBTSxNQUFNLEdBQUcsSUFBSSxpQkFBTSxDQUFDO0lBQ3RCLEVBQUUsRUFBRSxNQUFNO0lBQ1YsSUFBSSxFQUFFLE1BQU07SUFDWixJQUFJLEVBQUUsTUFBTTtJQUNaLFVBQVUsRUFBRSxNQUFNO0lBQ2xCLEtBQUssRUFBRSxNQUFNO0lBQ2IsUUFBUSxFQUFFLE1BQU07SUFDaEIsUUFBUSxFQUFFLE1BQU07SUFDaEIsT0FBTyxFQUFFLE1BQU07SUFDZixNQUFNLEVBQUUsT0FBTztJQUNmLElBQUksRUFBRSxNQUFNO0lBQ1osR0FBRyxFQUFFLE1BQU07SUFDWCxJQUFJLEVBQUUsTUFBTTtJQUNaLE1BQU0sRUFBRSxNQUFNO0lBQ2QsYUFBYSxFQUFFLEVBQUU7SUFDakIsZUFBZSxFQUFFLEVBQUU7SUFDbkIsSUFBSSxFQUFFLE1BQU07Q0FDZixFQUFFLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7QUFFYixRQUFBLGdCQUFnQixHQUFHLElBQUEsZ0JBQUssRUFBb0Isa0JBQWtCLEVBQUUsTUFBTSxFQUFFLGtCQUFrQixDQUFDLENBQUMifQ==