import { Command, Flags } from "@oclif/core";

export default class PrismaSeeder extends Command {
  static description =
    "Check if migration success by providing current and new path_to_schema_prisma_file";

  static examples = [
    `$ oex --new <path_to_new_schema_prisma_file> --current <path_to_current_schema_prisma_file>
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
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(PrismaSeeder);

    this.log(
      `The new schema path: ${flags.new} \nand the current schema path: ${flags.current}`
    );
  }
}
