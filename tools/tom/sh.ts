import FCS_logic = require("../../app/servers/FiveCardStud/lib/FCS_logic");
import utils = require("../../app/utils");



{

}
{
    let holds1 = [8, 9, 10, 11, 14];
    let typeSize1 = FCS_logic.sortPokerToType(holds1);

    let holds2 = [8 + 13, 9, 10, 11, 12];
    let typeSize2 = FCS_logic.sortPokerToType(holds2);
    console.warn(typeSize1, typeSize2, typeSize1 > typeSize2);
}