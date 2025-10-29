import { Module } from '@nestjs/common';
import { UserUseCasesModule } from './useCases/user-use-cases.module.js';
import { UserController } from './user.controller.js';


@Module({
  imports: [
    UserUseCasesModule,

  ],
  controllers: [ UserController],
})
export class UserModule {}
