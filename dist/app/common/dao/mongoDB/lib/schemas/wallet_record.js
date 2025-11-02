'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.wallet_record = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    uid: String,
    op_type: Number,
    changed_gold: Number,
    curr_gold: Number,
    curr_wallet_gold: Number,
    time: Number,
}, { versionKey: false });
exports.wallet_record = (0, mongoose_1.model)("wallet_record", schema, 'wallet_record');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2FsbGV0X3JlY29yZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9jb21tb24vZGFvL21vbmdvREIvbGliL3NjaGVtYXMvd2FsbGV0X3JlY29yZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUViLHVDQUFnRTtBQVVoRSxNQUFNLE1BQU0sR0FBRyxJQUFJLGlCQUFNLENBQUM7SUFDekIsR0FBRyxFQUFFLE1BQU07SUFDWCxPQUFPLEVBQUUsTUFBTTtJQUNmLFlBQVksRUFBRSxNQUFNO0lBQ3BCLFNBQVMsRUFBRSxNQUFNO0lBQ2pCLGdCQUFnQixFQUFFLE1BQU07SUFDeEIsSUFBSSxFQUFFLE1BQU07Q0FDWixFQUFFLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7QUFFYixRQUFBLGFBQWEsR0FBRyxJQUFBLGdCQUFLLEVBQWlCLGVBQWUsRUFBRSxNQUFNLEVBQUUsZUFBZSxDQUFDLENBQUMifQ==