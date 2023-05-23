import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString, Length } from "class-validator";
import { Message } from "src/shared/utils/message.decorator";

export class InsertReasonsRevDto {

  @Type(() => Number)
  @IsNumber({}, { message: Message.NUMBER('$property') })
  goodInNumber: number;

  @Type(() => Number)
  @IsNumber({}, { message: Message.NUMBER('$property') })
  eventInId: number;

  @Type(() => String)
  @IsString({ message: Message.STRING('$property') })
  reasonsIn: string;

  @Type(() => Number)
  @IsNumber({}, { message: Message.NUMBER('$property') })
  reasonsInNumber: string;

  @Type(() => String)
  @IsString({ message: Message.STRING('$property') })
  actionIn: string;

}