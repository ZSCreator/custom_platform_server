'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.scratch_card_result = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    id: String,
    cardNum: String,
    result: [],
    rebate: Number,
    jackpotId: Number,
    status: Number,
}, { versionKey: false });
exports.scratch_card_result = (0, mongoose_1.model)("scratch_card_result", schema, 'scratch_card_result');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NyYXRjaF9jYXJkX3Jlc3VsdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL21vbmdvREIvbGliL3NjaGVtYXMvc2NyYXRjaF9jYXJkX3Jlc3VsdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUNiLHVDQUFnRTtBQVNoRSxNQUFNLE1BQU0sR0FBRyxJQUFJLGlCQUFNLENBQUM7SUFDbEIsRUFBRSxFQUFFLE1BQU07SUFDVixPQUFPLEVBQUUsTUFBTTtJQUNmLE1BQU0sRUFBRSxFQUFFO0lBQ1YsTUFBTSxFQUFFLE1BQU07SUFDZCxTQUFTLEVBQUUsTUFBTTtJQUNqQixNQUFNLEVBQUUsTUFBTTtDQUNyQixFQUFFLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7QUFFYixRQUFBLG1CQUFtQixHQUFHLElBQUEsZ0JBQUssRUFBdUIscUJBQXFCLEVBQUUsTUFBTSxFQUFFLHFCQUFxQixDQUFDLENBQUMifQ==