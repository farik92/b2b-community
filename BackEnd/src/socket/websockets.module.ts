import { Module } from '@nestjs/common';
import { WebSocketsGateway } from '../socket/websockets.gateway';

@Module({
  imports: [],
  providers: [WebSocketsGateway],
  exports: [WebSocketsGateway],
})
export class WebSocketModule {}
