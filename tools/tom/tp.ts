import TeenPatti_logic = require("../../app/servers/TeenPatti/lib/TeenPatti_logic");


let pls = [
    {
        cardType: 1,
        cards: [1, 2, 3]
    },
    {
        cardType: 1,
        cards: [1, 2, 3]
    }
]
let ret = TeenPatti_logic.bipaiSole(pls[0],pls[1]);
console.warn(ret);
