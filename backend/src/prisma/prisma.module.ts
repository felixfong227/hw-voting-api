import { Global, Module } from "@nestjs/common";
import { PrismaServiceV2 } from "./prisma.service";

@Global()
@Module({
  providers: [PrismaServiceV2],
  exports: [PrismaServiceV2],
})
export class PrismaModule {}
