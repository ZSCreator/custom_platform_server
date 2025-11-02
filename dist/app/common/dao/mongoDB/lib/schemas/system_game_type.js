"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.system_game_type = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    typeId: String,
    sort: Number,
    name: String,
    open: Boolean,
    nidList: [],
}, { versionKey: false });
exports.system_game_type = (0, mongoose_1.model)("system_game_type", schema, 'system_game_type');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3lzdGVtX2dhbWVfdHlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL21vbmdvREIvbGliL3NjaGVtYXMvc3lzdGVtX2dhbWVfdHlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx1Q0FBbUQ7QUFXbkQsTUFBTSxNQUFNLEdBQUcsSUFBSSxpQkFBTSxDQUFDO0lBQ3RCLE1BQU0sRUFBRSxNQUFNO0lBQ2QsSUFBSSxFQUFFLE1BQU07SUFDWixJQUFJLEVBQUUsTUFBTTtJQUNaLElBQUksRUFBRSxPQUFPO0lBQ2IsT0FBTyxFQUFFLEVBQUU7Q0FDZCxFQUFFLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7QUFHYixRQUFBLGdCQUFnQixHQUFHLElBQUEsZ0JBQUssRUFBa0Isa0JBQWtCLEVBQUUsTUFBTSxFQUFFLGtCQUFrQixDQUFDLENBQUMifQ==