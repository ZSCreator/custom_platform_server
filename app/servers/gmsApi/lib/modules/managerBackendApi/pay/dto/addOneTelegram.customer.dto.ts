import { ApiProperty } from "@nestjs/swagger";
import { Min, Max } from "class-validator";

export class addOneTelegramCustomerDTO {

    @ApiProperty({
        required: true,
        description: "链接地址",
        example: "https://t.me/andy127"
    })
    // @Min(0)
    url: string;

    @ApiProperty({
        required: true,
        description: "昵称",
        example: "andy"
    })
    // @Min(0)
    nickname: string;

    @ApiProperty({
        required: true,
        description: "下发比例,总和不能超过100",
        example: 20
    })
    @Min(0)
    @Max(100)
    per: number;

    @ApiProperty({
        description: " 状态: 0停用,1启用",
        example: 1
    })
    status: number;


}