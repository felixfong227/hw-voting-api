import { PrismaClient } from "@prisma/client";
import { INestApplication, Injectable } from "@nestjs/common";

@Injectable()
export class PrismaServiceV2 extends PrismaClient {
  constructor() {
    super({
      datasources: {
        db: {
          url: "postgresql://root:SuperSecretPassword@db:5432/myvotingapp",
        },
      },
      log: [
        {
          emit: "stdout",
          level: "info",
        },
        {
          emit: "stdout",
          level: "query",
        },
      ],
    });
  }
  async onModuleInit() {
    await this.$connect();
  }
  async enableShutdownHooks(app: INestApplication) {
    this.$on("beforeExit", async () => {
      await app.close();
    });
  }
}
