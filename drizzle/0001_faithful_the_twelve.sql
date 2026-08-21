ALTER TABLE `rpgCharacters` DROP INDEX `rpgCharacters_accountId_unique`;--> statement-breakpoint
ALTER TABLE `rpgAccounts` ADD `activeCharacterId` int;
--> statement-breakpoint
ALTER TABLE `rpgCharacters` DROP INDEX `rpgCharacters_accountId_unique`;
