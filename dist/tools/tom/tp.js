"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TeenPatti_logic = require("../../app/servers/TeenPatti/lib/TeenPatti_logic");
let pls = [
    {
        cardType: 1,
        cards: [1, 2, 3]
    },
    {
        cardType: 1,
        cards: [1, 2, 3]
    }
];
let ret = TeenPatti_logic.bipaiSole(pls[0], pls[1]);
console.warn(ret);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90b29scy90b20vdHAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxtRkFBb0Y7QUFHcEYsSUFBSSxHQUFHLEdBQUc7SUFDTjtRQUNJLFFBQVEsRUFBRSxDQUFDO1FBQ1gsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDbkI7SUFDRDtRQUNJLFFBQVEsRUFBRSxDQUFDO1FBQ1gsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDbkI7Q0FDSixDQUFBO0FBQ0QsSUFBSSxHQUFHLEdBQUcsZUFBZSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkQsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyJ9