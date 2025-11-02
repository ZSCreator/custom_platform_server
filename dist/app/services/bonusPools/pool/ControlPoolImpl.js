"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControlPoolImpl = void 0;
const ControlPoolAbstract_1 = require("../bean/ControlPoolAbstract");
const commonUtil_1 = require("../../../utils/lottery/commonUtil");
class ControlPoolImpl extends ControlPoolAbstract_1.ControlPoolAbstract {
    constructor(instance) {
        super();
        this.amount = 0;
        this.pool = instance;
        this.amount = 0;
    }
    addControlPoolAmount(_amount) {
        this.amount += _amount;
        this.amount = (0, commonUtil_1.fixNoRound)(this.amount, 2);
    }
}
exports.ControlPoolImpl = ControlPoolImpl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udHJvbFBvb2xJbXBsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZpY2VzL2JvbnVzUG9vbHMvcG9vbC9Db250cm9sUG9vbEltcGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEscUVBQWdFO0FBRWhFLGtFQUE2RDtBQUs3RCxNQUFhLGVBQWdCLFNBQVEseUNBQW1CO0lBTXRELFlBQVksUUFBa0I7UUFDNUIsS0FBSyxFQUFFLENBQUM7UUFIVixXQUFNLEdBQVcsQ0FBQyxDQUFDO1FBSWpCLElBQUksQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0lBQ2xCLENBQUM7SUFFRCxvQkFBb0IsQ0FBQyxPQUFlO1FBQ2xDLElBQUksQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBQSx1QkFBVSxFQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDM0MsQ0FBQztDQUVGO0FBakJELDBDQWlCQyJ9