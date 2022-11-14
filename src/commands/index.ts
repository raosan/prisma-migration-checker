import { Command, Flags } from "@oclif/core";
import { execSync } from "node:child_process";
import { updateEnv } from "../scripts/env-edit";

export default class PrismaMigrationChecker extends Command {
  static description =
    "Check if migration success by providing current and new path_to_schema_prisma_file and url_of_the_database";

  static examples = [
    `$ oex --new <path_to_new_schema_prisma_file> --current <path_to_current_schema_prisma_file> --database-url <url_of_the_database>
Start checking...
Finish checking.
`,
  ];

  static flags = {
    new: Flags.string({
      char: "n",
      description: "path to new schema prisma file",
      required: true,
    }),
    current: Flags.string({
      char: "c",
      description: "path to current schema prisma file",
      required: true,
    }),
    "database-url": Flags.string({
      char: "d",
      description: "url of the database",
      required: true,
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(PrismaMigrationChecker);

    this.log("Start checking...");
    this.log(
      `New schema path: ${flags.new} \nCurrent schema path: ${flags.current}\nDB url: ${flags["database-url"]}`
    );

    // update env DB
    this.log("Updating env...");
    execSync("cp ./.env.example ./.env");
    updateEnv("./.env", "DATABASE_URL", flags["database-url"]);

    // copy prisma schema file
    this.log("Copying schema files...");
    execSync("rm -rf prisma-mc-temp");
    execSync("mkdir prisma-mc-temp");
    execSync(`cp ${flags.new} ./prisma-mc-temp/new-schema.prisma`);
    execSync(`cp ${flags.current} ./prisma-mc-temp/current-schema.prisma`);

    // // reset DB
    this.log("Resetting DB...");
    execSync(`npx prisma migrate reset --force --skip-generate --schema=${flags.current}`);

    const curPrismaTempLocation = "./prisma-mc-temp/current-schema.prisma";
    const newPrismaTempLocation = "./prisma-mc-temp/new-schema.prisma";

    // migrating current schema
    this.log("Migrating current schema...");
    execSync(
      `npx prisma migrate dev --name current --schema=${curPrismaTempLocation}`
    );

    // seeding fake data
    execSync(
      `npx prisma-seeder --schema ${curPrismaTempLocation} --database-url ${flags["database-url"]}`,
      { stdio: "inherit" }
    );

    // migrating new schema
    this.log("Migrating new schema...");
    execSync(
      `npx prisma migrate dev --name new --schema=${newPrismaTempLocation}`
    );

    this.log("Finish checking.");
    this.log("Migration success.");
  }
}
