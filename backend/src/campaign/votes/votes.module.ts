import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { VotesService } from "./votes.service";

@Module({
  imports: [PrismaModule],
  providers: [VotesService],
})
export class VotesModule {}
