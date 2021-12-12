import { Module } from "@nestjs/common";
import { UserModule } from "./users/users.module";
import { CampaignModule } from "./campaign/campaign.module";
import { OptionsModule } from "./campaign/options/options.module";
import { PrismaService } from "./prisma.serivce";
import { PrismaModule } from "./prisma/prisma.module";
import { VotesModule } from "./campaign/votes/votes.module";

@Module({
  imports: [UserModule, CampaignModule, PrismaModule, VotesModule],
})
export class AppModule {}
