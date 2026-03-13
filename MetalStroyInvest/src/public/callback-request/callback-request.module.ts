import { Module } from '@nestjs/common';
import { CallbackRequestController } from './callback-request.controller';
import { CallbackRequestService } from './callback-request.service';

@Module({
  controllers: [CallbackRequestController],
  providers: [CallbackRequestService],
  exports: [CallbackRequestService],
})
export class CallbackRequestModule {}
