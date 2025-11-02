import BG_logic = require('../../app/servers/BlackGame/lib/BG_logic');
import Erba_logic = require('../../app/servers/Erba/lib/Erba_logic');
import ttzlogic = require('../../app/servers/bairenTTZ/lib/ttzlogic');
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
    ttzlogic.controlLottery
}