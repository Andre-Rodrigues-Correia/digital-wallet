import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth, ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/security/guards/jwt-auth.guard';

import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

import { MeResponseDto } from './dto/me-response';
import { MeUseCase } from './use-cases/me.use-case';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly meUseCase: MeUseCase) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current authenticated user',
    description:
      'Returns the authenticated user information and wallet balance.',
  })
  @ApiOkResponse({
    description: 'Current authenticated user.',
    type: MeResponseDto,
  })
  async me(@CurrentUser() user: JwtPayload): Promise<MeResponseDto> {
    return this.meUseCase.execute(user.sub);
  }
}
