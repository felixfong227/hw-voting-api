import { INestApplication, Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
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
