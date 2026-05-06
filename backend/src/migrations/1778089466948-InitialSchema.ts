import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1778089466948 implements MigrationInterface {
    name = 'InitialSchema1778089466948'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`tasks\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`description\` text NULL, \`priority\` enum ('low', 'medium', 'high') NOT NULL DEFAULT 'medium', \`dueDate\` date NULL, \`completed\` tinyint NOT NULL DEFAULT 0, \`completedAt\` timestamp NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`tasks\``);
    }

}
