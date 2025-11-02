"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const format = require("string-format");
function getlanguage(conntext, useLanguage = "zh-cn", ...optionalParams) {
    let msg = "";
    switch (useLanguage) {
        case "zh-cn":
            msg = conntext["zh-cn"];
            break;
        case "zh-cn":
            msg = conntext["en"];
            break;
        default:
            msg = conntext["zh-cn"];
            break;
    }
    msg = format(msg, optionalParams);
    return msg;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZ3VhZ2VNZ3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90b29scy90b20vbGFuZ3VhZ2VNZ3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx3Q0FBeUM7QUFHekMsU0FBUyxXQUFXLENBQUMsUUFBeUMsRUFBRSxXQUFXLEdBQUcsT0FBTyxFQUFFLEdBQUcsY0FBbUI7SUFDekcsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDO0lBQ2IsUUFBUSxXQUFXLEVBQUU7UUFDakIsS0FBSyxPQUFPO1lBQ1IsR0FBRyxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN4QixNQUFNO1FBQ1YsS0FBSyxPQUFPO1lBQ1IsR0FBRyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNyQixNQUFNO1FBQ1Y7WUFDSSxHQUFHLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3hCLE1BQU07S0FDYjtJQUNELEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBQ2xDLE9BQU8sR0FBRyxDQUFDO0FBQ2YsQ0FBQyJ9