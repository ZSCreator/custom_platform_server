import {BonusPoolAbstract} from "./BonusPoolAbstract";
import {ProfitPoolAbstract} from "./ProfitPoolAbstract";
import {ControlPoolAbstract} from "./ControlPoolAbstract";


interface BaseProps {
  nid: string;
  zname: string;
  serverName: string;
}

export abstract class BasePool {

  nid: string;

  gameName: string;

  serverName: string;

  bonusPool: BonusPoolAbstract;
  controlPool: ControlPoolAbstract;
  profitPool: ProfitPoolAbstract;


  protected constructor(opt: BaseProps) {
    this.nid = opt['nid'];
    this.gameName = opt['zname'];
    this.serverName = opt['serverName'];
  }

  changeAmountFromControlPoolToBonusPool(changeAmountValue: number) {
    if (typeof changeAmountValue !== 'number') throw new Error('改变调控池金额进公共奖池，传入参数应为 number 类型');
    if (this.controlPool.amount < changeAmountValue) {

    }
    this.controlPool.amount -= changeAmountValue;
    this.bonusPool.amount += changeAmountValue;
    this.bonusPool.changeCorrectedValueAfterAdd();
  }
}
