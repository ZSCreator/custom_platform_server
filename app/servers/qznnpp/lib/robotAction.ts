import robotreg from "./robotConfig";
import * as bipai from "../../../utils/GameUtil";

function romdomTime(max, min) {
  return parseInt(Math.random() * (max - min + 1) + min, 10);
}

function getRandom(probability: number) {
  probability = probability * 100 || 1;
  let odds = Math.floor(Math.random() * 100);

  if (probability === 1) {
    return 0;
  }
  if (odds < probability) {
    return 1;
  } else {
    return 0;
  }
};


//概率
export function getProb(probability: number) {
  probability = probability * 100 || 1;
  let odds = Math.floor(Math.random() * 100);

  if (probability === 1) {
    return 0;
  }
  if (odds < probability) {
    return 1;
  } else {
    return 0;
  }
}

/**是否添加机器人 */
export function addRobot(robnumb: number) {
  let prob;
  let arr = robotreg[0].addRoom;

  for (let key of arr) {
    if (key.player == robnumb + 1) {
      prob = key.probability;
    }
  }

  let isAdd = this.getProb(prob);

  if (isAdd == 1) {
    return true;
  } else {
    return false;
  }
}

/**结束离开 */
export function overLevRoom(initGold: number, nowMoney: number, limitMoney: number) {
  //>10倍房间最小进入限制
  if (initGold >= limitMoney * 10) {

    //赢进入时金币50%
    if (nowMoney > initGold * 1.5) {
      return true;
    }
    else if (nowMoney < initGold * 0.5) {
      let isLev = getRandom(0.1);
      if (isLev == 1) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
  else if (initGold >= limitMoney * 2 && initGold < limitMoney * 10) {
    if (nowMoney < initGold * 0.5) {
      return true;
    } else {
      return false;
    }
  }
  else {
    if (nowMoney < initGold * 0.5) {
      return true;
    } else {
      return false;
    }
  }

}

//w玩家加入robot是否离开房间
export function addLevRoom(playerNum: number, robotNum: number) {
  let prob;
  let arr = robotreg[0].paddLevRoom;
  for (let key of arr) {
    if (key.p_numb == playerNum && key.robot == robotNum) {
      prob = key.probability;
    }
  }

  let isLve = this.getProb(prob);
  if (isLve == 1) {
    return true;
  } else {
    return false;
  }
}

//看牌前操作
export function robotAction(turn, gold: number, otherfill) {
  let prob;
  if (turn <= 1) {
    return 'bet'
  }
  if (otherfill) {
    return 'see'
  }
  if (gold <= 20000) {
    prob = this.getProb(0.99999)
  }
  if (gold > 20000 && gold <= 200000) {
    prob = this.getProb(0.8)
  }
  if (gold > 50000 && gold <= 100000) {
    prob = this.getProb(0.8)
  }
  if (gold > 100000 && gold <= 200000) {
    prob = this.getProb(0.7)
  }
  if (gold > 200000 && gold <= 500000) {
    prob = this.getProb(0.6)
  }
  if (gold > 500000 && gold <= 1000000) {
    prob = this.getProb(0.5)
  }
  if (gold > 1000000) {
    prob = this.getProb(0.5)
  }

  if (turn >= 4) {
    return 'see'
  }
  if (prob == 1) {
    return "bet";
  } else {
    return "see";
  }
}

//看牌后操作
export function seeAction(turn, playerNum, cowNum, turnKP, capBet, betNum, mygold, allCards, otherfill) {

  //判断输赢
  let newsAllCards = [];

  for (const item of allCards) {
    newsAllCards.push({
      cards: item.cards,
      cardType: item.type
    })
  }
  let winer;


  let isWin = false
  try {
    winer = bipai.bipai(newsAllCards);
    if (winer.cards.toString() == cowNum.cards.toString()) {
      isWin = true
    }
  } catch (e) {
    return "fold";
  }


  let bull = cowNum.cardType;
  //处理allin情况

  if (turn == 0) {

    return 'bet'
  }

  if (turn >= 19) {
    return 'allin'
  }
  let onum = playerNum - 1
  if (betNum >= capBet) {
    return 'bipai'
  }

  //没钱了比牌,钱小于两倍房间金额，则比牌
  if (mygold < capBet * onum) {
    return 'bipai'
  }


  if (isWin) {
    if (bull > 10) {
      let mpro = this.getProb(0.3)
      if (mpro == 1) {
        return 'fill'
      } else {
        return "bet";
      }
    }

    if (bull == 10) {

      let ranNum = romdomTime(4, 8)
      let oturn = turnKP + ranNum
      if (turn < oturn) {
        return "bet";
      } else {
        let pro = this.getProb(0.3);

        if (pro == 1) {
          return "bipai";
        } else {
          let mpro = this.getProb(0.3)
          if (mpro == 1) {
            return 'fill'
          } else {
            return "bet";
          }

        }
      }
    }
    if (bull >= 8) {
      //有人加注提前比牌

      if (otherfill) {
        let isk = this.getProb(0.4)
        if (isk == 1) {
          return 'bipai'
        } else {
          let isk = this.getProb(0.3)
          if (isk == 1) {
            return 'fill'
          } else {
            return "bet";
          }
        }
      }
      let ranNum = romdomTime(3, 8)
      let oturn = turnKP + ranNum
      if (turn < oturn) {

        let isk = this.getProb(0.3)
        if (isk == 1) {
          return 'fill'
        } else {
          return "bet";
        }
      } else {
        let pro = this.getProb(0.3);
        if (pro == 1) {
          return "bipai";
        } else {
          let isk = this.getProb(0.3)
          if (isk == 1) {
            return 'fill'
          } else {
            return "bet";
          }
        }
      }
    }

    if (bull >= 5 && bull <= 8) {
      //有人加注提前比牌
      if (otherfill) {
        let isk = this.getProb(0.4)
        if (isk == 1) {
          return 'bipai'
        } else {
          return "bet";
        }
      }
      let ranNum = romdomTime(2, 5)
      let oturn = turnKP + ranNum


      if (turn < oturn) {


        let isk = this.getProb(0.3)
        if (isk == 1) {
          return 'fill'
        } else {
          return "bet";
        }

      } else {

        let pro = this.getProb(0.5);
        if (pro == 1) {
          let isk = this.getProb(0.2)
          if (isk == 1) {
            return 'fill'
          } else {
            return "bet";
          }
        } else {

          return 'bipai'
        }
      }

    }

    if (bull >= 3 && bull < 5) {

      let ranNum = romdomTime(1, 3)
      let oturn = turnKP + ranNum


      if (turn < oturn) {


        let isk = this.getProb(0.3)
        if (isk == 1) {
          let isk = this.getProb(0.2)
          if (isk == 1) {
            return 'fill'
          } else {
            return "bet";
          }
        } else {
          return "bet";
        }

      } else {

        let pro = this.getProb(0.4);
        if (pro == 1) {
          return 'bipai'

        } else {
          let isk = this.getProb(0.2)
          if (isk == 1) {
            return 'fill'
          } else {
            return "bet";
          }

        }
      }

    }
    if (bull < 3 && bull > 0) {


      let pro = this.getProb(0.4);
      if (pro == 1) {
        return "bipai";
      } else {
        let isk = this.getProb(0.2)
        if (isk == 1) {
          return 'fill'
        } else {
          return "bet";
        }

      }


    }
    if (bull == 0) {

      let isk = this.getProb(0.5)
      if (isk == 1) {
        return 'bipai'
      } else {
        let isk = this.getProb(0.1)
        if (isk == 1) {
          return 'fill'
        } else {
          return "bet";
        }
      }



    };
  }
  if (!isWin) {


    if (bull >= 9) {
      if (otherfill) {
        let isk = this.getProb(0.4)
        if (isk == 1) {
          return 'bipai'
        } else {
          let isk = this.getProb(0.3)
          if (isk == 1) {
            return 'fill'
          } else {
            return "bet";
          }
        }
      }
      let pro = this.getProb(0.5);
      if (pro == 1) {
        return 'fold'
      }

      let ranNum = romdomTime(9, 15)
      let oturn = turnKP + ranNum
      if (turn < oturn) {
        let isk = this.getProb(0.2)
        if (isk == 1) {
          return 'fill'
        } else {
          return "bet";
        }
      } else {
        let pro = this.getProb(0.35);

        if (pro == 1) {
          return "bipai";
        } else {
          let mpro = this.getProb(0.2)
          if (mpro == 1) {
            return 'fill'
          } else {
            return "bet";
          }

        }
      }
    }


    if (bull >= 5 && bull <= 8) {
      if (otherfill) {
        let isk = this.getProb(0.4)
        if (isk == 1) {
          return 'bipai'
        } else {
          let isk = this.getProb(0.3)
          if (isk == 1) {
            return 'fill'
          } else {
            return "bet";
          }
        }
      }
      let ranNum = romdomTime(2, 5)
      let oturn = turnKP + ranNum
      //大于十轮比牌
      if (turn >= 10) {
        return 'bet'
      }
      if (turn < oturn) {


        let mpro = this.getProb(0.1)
        if (mpro == 1) {
          return 'fill'
        } else {
          return "bet";
        }

      } else {


        let pro = this.getProb(0.4);

        if (pro == 1) {

          let mpro = this.getProb(0.2)
          if (mpro == 1) {
            return 'fill'
          } else {
            return "bet";
          }
        } else {
          return 'bipai'
        }

      }

    }

    if (bull >= 3 && bull < 5) {

      if (playerNum == 2) {
        let pro = this.getProb(0.4);
        if (pro == 1) {
          return "bipai";
        } else {
          if (capBet >= betNum * 2) {
            return 'bipai'
          }
          if (turn >= turnKP + 5) {
            return 'bipai'
          } else {
            return 'bet'
          }

        }

      } else {
        return 'fold'
      }

    }
    if (bull < 3 && bull > 0) {

      let pro = this.getProb(0.4);
      if (pro == 1) {
        return "bipai";
      } else {
        if (capBet >= betNum * 2) {
          return 'bipai'
        }
        let pro = this.getProb(0.2);
        if (pro == 1) {
          return "fill";
        } else {
          return 'bet'
        }

      }
    }
    if (bull == 0) {



      let pro = this.getProb(0.2);
      if (pro == 1) {
        return "bipai";
      } else {
        return 'fold'
      }



    };
  }
}

