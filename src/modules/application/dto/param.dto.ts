import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString, Length } from "class-validator";
import { Message } from "src/shared/utils/message.decorator";

export class InsertReasonsRevDto {

  @Type(() => Number)
  @IsNumber({}, { message: Message.NUMBER('$property') })
  @ApiProperty({
    title: 'no_bien_in',
    example: 'Dato de tipo numérico',
    required: true,
  })
  goodInNumber: number;

  @Type(() => Number)
  @IsNumber({}, { message: Message.NUMBER('$property') })
  @ApiProperty({
    title: 'id_event_in',
    example: 'Dato de tipo numérico',
    required: true,
  })
  eventInId: number;

  @Type(() => String)
  @IsString({ message: Message.STRING('$property') })
  @ApiProperty({
    title: 'id_event_in',
    example: 'Dato de tipo texto',
    required: true,
  })
  reasonsIn: string;

  @Type(() => Number)
  @IsNumber({}, { message: Message.NUMBER('$property') })
  @ApiProperty({
    title: 'no_motivo_in',
    example: 'Dato de tipo numérico',
    required: true,
  })
  reasonsInNumber: Number;

  @Type(() => String)
  @IsString({ message: Message.STRING('$property') })
  @ApiProperty({
    title: 'accion_in',
    example: 'Dato de tipo texto',
    required: true,
  })
  actionIn: string;

}

export class ReasonsSeparateDto {

    @Type(() => Number)
    @IsNumber({}, { message: "debe ser numerico" })
    @ApiProperty({
      title: 'no_bien',
      example: 'Dato de tipo numérico',
      required: true,
    })
    goodNumber: number;

    @Type(() => Number)
    @IsNumber({}, { message: "debe ser numerico" })
    @ApiProperty({
      title: 'id_event',
      example: 'Dato de tipo numérico',
      required: true,
    })
    eventId: number;

}