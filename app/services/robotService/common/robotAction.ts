

function romdomTime(max, min) {
    return parseInt(Math.random() * (max - min + 1) + min, 10);
}


//概率
export function getRandom(probability: number) {
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
};
//拆分押注
export function copList(betGold) {
    let betArr = [];

    if (betGold > 1000000) {
        let qk = betGold.substring(0, 1)
        betArr.push({
            qk: qk
        })
        if (betGold.substring(1, 2) > 0) {
            let bk = betGold.substring(1, 2)
            betArr.push({
                bk: bk
            })
        }
        if (betGold.substring(2, 3) > 0) {
            let sk = betGold.substring(2, 3)
            betArr.push({
                sk: sk
            })

        }
        if (betGold.substring(3, 4) > 0) {
            let jk = betGold.substring(3, 4)
            betArr.push({
                jk: jk
            })

        }
        if (betGold.substring(4, 5) > 0) {
            let nok = betGold.substring(4, 5)
            betArr.push({
                nok: nok
            })

        }

    }
    if (betGold > 100000) {

        if (betGold.substring(0, 1) > 0) {
            let bk = betGold.substring(0, 1)
            betArr.push({
                bk: bk
            })
        }
        if (betGold.substring(1, 2) > 0) {
            let sk = betGold.substring(1, 2)
            betArr.push({
                sk: sk
            })

        }
        if (betGold.substring(2, 3) > 0) {
            let jk = betGold.substring(2, 3)
            betArr.push({
                jk: jk
            })

        }
        if (betGold.substring(3, 4) > 0) {
            let nok = betGold.substring(3, 4)
            betArr.push({
                nok: nok
            })

        }

    }
    if (betGold > 10000 && betGold < 100000) {


        if (betGold.substring(0, 1) > 0) {
            let sk = betGold.substring(0, 1)
            betArr.push({
                sk: sk
            })

        }
        if (betGold.substring(1, 2) > 0) {
            let jk = betGold.substring(1, 2)
            betArr.push({
                jk: jk
            })

        }
        if (betGold.substring(2, 3) > 0) {
            let nok = betGold.substring(2, 3)
            betArr.push({
                nok: nok
            })

        }

    }
    if (betGold > 1000 && betGold < 10000) {


        if (betGold.substring(0, 1) > 0) {
            let jk = betGold.substring(0, 1)
            betArr.push({
                jk: jk
            })

        }
        if (betGold.substring(1, 2) > 0) {
            let nok = betGold.substring(1, 2)
            betArr.push({
                nok: nok
            })

        }

    }
    if (betGold > 100 && betGold < 1000) {

        let nok = betGold.substring(0, 1)
        betArr.push({
            nok: nok
        })

    }
    if (betGold <= 100) {
        betArr.push({
            nok: 1
        })
    }
    return betArr
};

// 概率计算下注金额
export function sortProbability(_arr) {
    let allweight = 0;
    let section = 0; //区间临时变量
    let arr = _arr.map(m => {
        const obj = {};
        for (let key in m) {
            obj[key] = m[key];
        }
        return obj;
    });
    //console.log("obj=", arr);
    //排序
    arr.sort((a, b) => {
        return a.probability - b.probability;
    });
    //计算总权重
    for (let i = 0; i < arr.length; i++) {
        allweight += Number(arr[i].probability);
    }

    //获取概率区间
    for (let i = 0; i < arr.length; i++) {
        if (i === 0) {
            let right = (arr[i].probability / allweight);
            arr[i]['section'] = [0, right];
            section = right;
        } else {
            let right = (arr[i].probability / allweight) + section;
            arr[i]['section'] = [section, right];
            section = right;
        }
    }
    const random = Math.random();
    for (let i = 0; i < arr.length; i++) {
        if (random >= arr[i].section[0] && random < arr[i].section[1]) {
            return arr[i].name;
        }
    }
}


