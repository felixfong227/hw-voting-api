import { Module } from "@nestjs/common";
import { CampaignController } from "./campaign.controller";
import { CampaignService } from "./campaign.service";
import { OptionsModule } from "./options/options.module";
import { PrismaModule } from "src/prisma/prisma.module";
import { OptionsService } from "./options/options.service";
import { VotesService } from "./votes/votes.service";

@Module({
  imports: [OptionsModule, PrismaModule],
  controllers: [CampaignController],
  providers: [CampaignService, OptionsService, VotesService],
})
export class CampaignModule {}
