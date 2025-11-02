

import robotreg = require("./robotConfig");

function romdomTime(max, min) {
  return parseInt(Math.random() * (max - min + 1) + min, 10);
}


//概率
export function getRandom(probability) {
  let tem_probability = probability * 100 || 1;
  let odds = Math.floor(Math.random() * 100);

  if (tem_probability === 1) {
    return 0;
  }
  if (odds < tem_probability) {
    return 1;
  } else {
    return 0;
  }
};

//是否添加机器人
export function addRobot(robnumb) {
  let prob;
  let arr = robotreg[0].addRoom;

  for (let key of arr) {
    if (key.player == robnumb + 1) {
      prob = key.probability;
    }
  }
  //console.log(robnumb, prob, "jiarumaa");
  let isAdd = getRandom(prob);
  if (isAdd == 1) {
    return true;
  } else {
    return false;
  }
};
//结束离开
export function overLevRoom(isWin, nowMoney, limitMoney) {
  let arr = robotreg[0].moneyLevRoom;

  if (isWin) {
    console.log("机器人赢了");
    if (nowMoney > limitMoney * 10) {
      let prob = arr.ten_win[0].lev_prob;

      let isLev = getRandom(prob);
      console.log(prob, "离开概率", isLev);
      if (isLev == 1) {
        return true;
      } else {
        return false;
      }
    } else if (nowMoney > limitMoney * 1) {
      let prob = arr.one_win[0].lev_prob;

      let isLev = getRandom(prob);
      if (isLev == 1) {
        return true;
      } else {
        return false;
      }
    } else if (nowMoney < limitMoney * 1) {
      let prob = arr.less_win[0].lev_prob;

      let isLev = getRandom(prob);
      if (isLev == 1) {
        return true;
      } else {
        return false;
      }
    }
  } else {
    console.log("机器人输了");
    if (nowMoney > limitMoney * 10) {
      let prob = arr.ten_lose[0].lev_prob;

      let isLev = getRandom(prob);

      if (isLev == 1) {
        return true;
      } else {
        return false;
      }
    } else if (nowMoney > limitMoney * 1) {
      let prob = arr.one_lose[0].lev_prob;

      let isLev = getRandom(prob);
      if (isLev == 1) {
        return true;
      } else {
        return false;
      }
    } else if (nowMoney < limitMoney * 1) {
      let prob = arr.less_lose[0].lev_prob;

      let isLev = getRandom(prob);
      if (isLev == 1) {
        return true;
      } else {
        return false;
      }
    }
  }
};
//w玩家加入robot是否离开房间
export function addLevRoom(playerNum, robotNum) {
  let prob;
  let arr = robotreg[0].paddLevRoom;
  for (let key of arr) {
    if (key.p_numb == playerNum && key.robot == robotNum) {
      prob = key.probability;
    }
  }
  console.log(prob, "加入离开");
  let isLve = getRandom(prob);
  if (isLve == 1) {
    return true;
  } else {
    return false;
  }
};
//看牌前操作
export function robotAction(turn) {
  const gnub = romdomTime(2, 4);
  console.log(gnub, turn, "hhhhhhhhhh");
  if (turn < gnub) {
    return "bet";
  } else {
    return "see";
  }
};
//卡牌后操作
export function seeAction(turn, playerNum, cowNum, turnKP) {
  let bull = cowNum;
  let pro = getRandom(0.5);
  if (turn >= 20) {
    return 'bipai'
  }
  if (bull == 12) {
    return "bet";
  }
  if (bull == 11) {
    if (turn < turnKP + 5) {
      return "bet";
    } else {
      if (pro == 1) {
        return "bipai";
      } else {
        return "bet";
      }
    }
  }

  if (bull >= 10) {
    if (turn < turnKP + 2) {
      return "bet";
    } else {
      if (pro == 1) {
        return "bipai";
      } else {
        return "bet";
      }
    }
  }
  if (bull >= 9) {
    if (turn > turnKP + 2) {
      return "bipai";
    } else {
      if (pro == 1) {
        return "bipai";
      } else {
        return "bet";
      }
    }
  }

  if (bull >= 8) {
    if (playerNum == 1) {
      return "bipai";
    } else {
      return "bet";
    }
  } else {
    return "bipai";
  }
};

