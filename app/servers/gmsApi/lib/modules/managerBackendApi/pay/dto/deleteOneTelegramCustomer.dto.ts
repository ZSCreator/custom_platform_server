import { ApiProperty } from "@nestjs/swagger";

export class DeleteOneTelegramCustomerDTO {
    @ApiProperty({
        required: true,
        description: "客服编号",
        example: 1
    })
    id: number;

}
