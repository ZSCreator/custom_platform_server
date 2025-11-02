import FCS_logic = require('../../app/servers/FiveCardStud/lib/FCS_logic');

let cards = [
    36,
    26,
    27,
    34,
    37
];
console.warn(cards.map(c => FCS_logic.pukes[c]));
let ret = FCS_logic.GetCardType(cards);

console.warn(cards.map(c => FCS_logic.GetColour(c)));




console.warn(ret);
