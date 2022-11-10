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
    execSync("rm -rf prisma");
    execSync("mkdir prisma");
    execSync(`cp ${flags.new} ./prisma/new-schema.prisma`);
    execSync(`cp ${flags.current} ./prisma/current-schema.prisma`);

    // seeding fake data
    execSync(
      `./node_modules/.bin/prisma-seeder --schema ${flags.current} --database-url ${flags["database-url"]}`,
      {stdio: 'inherit'}
    );

    this.log('Finish checking.')
    this.log('Migration success.')
  }
}
