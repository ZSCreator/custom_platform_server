import * as xlsx from 'xlsx';
import fs = require('fs');



let WorkBook = xlsx.readFile("F:\\work_space\\seetook\\Backend\\golden_sands\\游戏翻译合集9语言.xlsx");
let sheetNames = WorkBook.SheetNames; //获取表明
let sheet = WorkBook.Sheets[sheetNames[0]]; //通过表明得到表对象

let data = xlsx.utils.sheet_to_json(sheet); //通过工具将表对象的数据读出来并转成json




let Net_Message = {}
let id_game_name = {}
for (const It of data) {
    let k: string = It["id"];
    delete It["id"];
    if (k.substring(0, 12) == "id_game_name") {
        let arr = k.split("-");
        id_game_name[arr[1]] = It
    } else {
        Net_Message[k] = It;
    }
}
Net_Message["id_game_name"] = id_game_name;
fs.writeFileSync('tom.json', JSON.stringify(Net_Message));
