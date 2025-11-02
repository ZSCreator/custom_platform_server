
/**
 * @property code 状态码
 * @property msg 信息
 */
export default class ApiResultDTO {
  code: number;
  msg: string;
  data?: Array<any>;
  constructor(opt = {}) {
    this.code = opt['code'] ? opt['code'] : 500;
    this.msg = opt['msg'] ? opt['msg'] : '';
    this.data = [];
  }
}