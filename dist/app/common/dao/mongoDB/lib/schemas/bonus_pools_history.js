'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.bonus_pools_history = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    nid: String,
    gameName: String,
    sceneId: Number,
    sceneName: String,
    bonus_amount: Number,
    control_amount: Number,
    profit_amount: Number,
    createDateTime: Number,
    updateDateTime: Number
}, { versionKey: false });
exports.bonus_pools_history = (0, mongoose_1.model)("bonus_pools_history", schema, 'bonus_pools_history');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9udXNfcG9vbHNfaGlzdG9yeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL21vbmdvREIvbGliL3NjaGVtYXMvYm9udXNfcG9vbHNfaGlzdG9yeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUViLHVDQUFtRDtBQWdCbkQsTUFBTSxNQUFNLEdBQUcsSUFBSSxpQkFBTSxDQUFDO0lBQ3RCLEdBQUcsRUFBRSxNQUFNO0lBQ1gsUUFBUSxFQUFFLE1BQU07SUFDaEIsT0FBTyxFQUFFLE1BQU07SUFDZixTQUFTLEVBQUUsTUFBTTtJQUNqQixZQUFZLEVBQUUsTUFBTTtJQUNwQixjQUFjLEVBQUUsTUFBTTtJQUN0QixhQUFhLEVBQUUsTUFBTTtJQUNyQixjQUFjLEVBQUUsTUFBTTtJQUN0QixjQUFjLEVBQUUsTUFBTTtDQUN6QixFQUFFLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7QUFHYixRQUFBLG1CQUFtQixHQUFHLElBQUEsZ0JBQUssRUFBdUIscUJBQXFCLEVBQUUsTUFBTSxFQUFFLHFCQUFxQixDQUFDLENBQUMifQ==