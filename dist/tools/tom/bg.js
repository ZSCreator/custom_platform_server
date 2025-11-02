"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BG_logic = require("../../app/servers/BlackGame/lib/BG_logic");
const Erba_logic = require("../../app/servers/Erba/lib/Erba_logic");
const ttzlogic = require("../../app/servers/bairenTTZ/lib/ttzlogic");
let res = BG_logic.get_Points([1, 2, 3]);
console.warn(res);
{
    let ret = Erba_logic.get_cards_type([1, 1]);
    console.warn(ret);
    let ret2 = Erba_logic.get_cards_type([5, 2]);
    console.warn(ret2);
    let ret3 = Erba_logic.bipai([1, 1], [5, 2]);
    console.warn(ret3);
}
{
    ttzlogic.controlLottery;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90b29scy90b20vYmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxRUFBc0U7QUFDdEUsb0VBQXFFO0FBQ3JFLHFFQUFzRTtBQUN0RSxJQUFJLEdBQUcsR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBRXpDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFJbEI7SUFDSSxJQUFJLEdBQUcsR0FBRyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDNUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNsQixJQUFJLElBQUksR0FBRyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDN0MsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUVuQixJQUFJLElBQUksR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDNUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUN0QjtBQUNEO0lBQ0ksUUFBUSxDQUFDLGNBQWMsQ0FBQTtDQUMxQiJ9