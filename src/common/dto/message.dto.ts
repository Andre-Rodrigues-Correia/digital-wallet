import { ApiProperty } from '@nestjs/swagger';

export class MessageDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;
}
