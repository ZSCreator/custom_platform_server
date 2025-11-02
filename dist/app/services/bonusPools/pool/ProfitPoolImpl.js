"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfitPoolImpl = void 0;
const ProfitPoolAbstract_1 = require("../bean/ProfitPoolAbstract");
const commonUtil_1 = require("../../../utils/lottery/commonUtil");
class ProfitPoolImpl extends ProfitPoolAbstract_1.ProfitPoolAbstract {
    constructor(instance) {
        super();
        this.amount = 0;
        this.pool = instance;
        this.amount = 0;
    }
    addProfitPoolAmount(_amount) {
        this.amount += _amount;
        this.amount = (0, commonUtil_1.fixNoRound)(this.amount, 2);
    }
}
exports.ProfitPoolImpl = ProfitPoolImpl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvZml0UG9vbEltcGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmljZXMvYm9udXNQb29scy9wb29sL1Byb2ZpdFBvb2xJbXBsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLG1FQUE4RDtBQUU5RCxrRUFBNkQ7QUFFN0QsTUFBYSxjQUFlLFNBQVEsdUNBQWtCO0lBTXBELFlBQVksUUFBa0I7UUFDNUIsS0FBSyxFQUFFLENBQUM7UUFIVixXQUFNLEdBQVcsQ0FBQyxDQUFDO1FBSWpCLElBQUksQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0lBQ2xCLENBQUM7SUFFRCxtQkFBbUIsQ0FBQyxPQUFlO1FBQ2pDLElBQUksQ0FBQyxNQUFNLElBQUksT0FBTyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBQSx1QkFBVSxFQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDM0MsQ0FBQztDQUVGO0FBakJELHdDQWlCQyJ9