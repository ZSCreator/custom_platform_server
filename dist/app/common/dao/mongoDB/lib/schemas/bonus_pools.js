'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.bonus_pools = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    nid: String,
    gameName: String,
    sceneId: Number,
    sceneName: String,
    roomId: String,
    bonus_amount: Number,
    bonus_initAmount: Number,
    bonus_minAmount: Number,
    bonus_minParameter: Number,
    bonus_maxAmount: Number,
    bonus_maxParameter: Number,
    bonus_poolCorrectedValue: Number,
    bonus_maxAmountInStore: Number,
    bonus_maxAmountInStoreSwitch: Boolean,
    bonus_minBonusPoolCorrectedValue: Number,
    bonus_maxBonusPoolCorrectedValue: Number,
    bonus_personalReferenceValue: Number,
    control_amount: Number,
    profit_amount: Number,
    createDateTime: Number,
    autoUpdate: Boolean,
    lockJackpot: Boolean,
    lastUpdateUUID: String,
    updateDateTime: Number
}, { versionKey: false });
exports.bonus_pools = (0, mongoose_1.model)("bonus_pools", schema, 'bonus_pools');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9udXNfcG9vbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9tb25nb0RCL2xpYi9zY2hlbWFzL2JvbnVzX3Bvb2xzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBRWIsdUNBQW1EO0FBNkJuRCxNQUFNLE1BQU0sR0FBRyxJQUFJLGlCQUFNLENBQUM7SUFDeEIsR0FBRyxFQUFFLE1BQU07SUFDWCxRQUFRLEVBQUUsTUFBTTtJQUNoQixPQUFPLEVBQUUsTUFBTTtJQUNmLFNBQVMsRUFBRSxNQUFNO0lBQ2pCLE1BQU0sRUFBRSxNQUFNO0lBQ2QsWUFBWSxFQUFFLE1BQU07SUFDcEIsZ0JBQWdCLEVBQUUsTUFBTTtJQUN4QixlQUFlLEVBQUUsTUFBTTtJQUN2QixrQkFBa0IsRUFBRSxNQUFNO0lBQzFCLGVBQWUsRUFBRSxNQUFNO0lBQ3ZCLGtCQUFrQixFQUFFLE1BQU07SUFDMUIsd0JBQXdCLEVBQUUsTUFBTTtJQUNoQyxzQkFBc0IsRUFBRSxNQUFNO0lBQzlCLDRCQUE0QixFQUFFLE9BQU87SUFDckMsZ0NBQWdDLEVBQUUsTUFBTTtJQUN4QyxnQ0FBZ0MsRUFBRSxNQUFNO0lBQ3hDLDRCQUE0QixFQUFFLE1BQU07SUFDcEMsY0FBYyxFQUFFLE1BQU07SUFDdEIsYUFBYSxFQUFFLE1BQU07SUFDckIsY0FBYyxFQUFFLE1BQU07SUFDdEIsVUFBVSxFQUFFLE9BQU87SUFDbkIsV0FBVyxFQUFFLE9BQU87SUFDcEIsY0FBYyxFQUFFLE1BQU07SUFDdEIsY0FBYyxFQUFFLE1BQU07Q0FDdkIsRUFBRSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0FBRWIsUUFBQSxXQUFXLEdBQUcsSUFBQSxnQkFBSyxFQUFlLGFBQWEsRUFBRSxNQUFNLEVBQUUsYUFBYSxDQUFDLENBQUMifQ==