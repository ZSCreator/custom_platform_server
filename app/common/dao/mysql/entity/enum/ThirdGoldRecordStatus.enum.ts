export enum ThirdGoldRecordStatus {
    /** @property 等待审核 */
    WaitingForReview,

    /** @property 上分自动通过 */
    addMoney = 1,

    /** @property 拒绝 */
    Reject = 2,

    /** @property 下分自动通过 */
    AutoPass = 3,

    /** @property 手动通过 */
    ManualPass = 4,
}
