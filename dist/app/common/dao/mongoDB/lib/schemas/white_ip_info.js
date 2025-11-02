"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.white_ip_info = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    ip: { type: String, index: true },
    createTime: Number,
    account: String,
}, { versionKey: false });
exports.white_ip_info = (0, mongoose_1.model)("white_ip_info", schema, 'white_ip_info');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2hpdGVfaXBfaW5mby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL21vbmdvREIvbGliL3NjaGVtYXMvd2hpdGVfaXBfaW5mby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx1Q0FBZ0U7QUFPaEUsTUFBTSxNQUFNLEdBQUcsSUFBSSxpQkFBTSxDQUFDO0lBQ3RCLEVBQUUsRUFBRSxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBQztJQUMvQixVQUFVLEVBQUUsTUFBTTtJQUNsQixPQUFPLEVBQUUsTUFBTTtDQUNsQixFQUFFLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7QUFFYixRQUFBLGFBQWEsR0FBRyxJQUFBLGdCQUFLLEVBQWlCLGVBQWUsRUFBRSxNQUFNLEVBQUUsZUFBZSxDQUFDLENBQUMifQ==