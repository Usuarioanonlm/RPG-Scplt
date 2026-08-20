CREATE TABLE `rpgAccounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nickname` varchar(32) NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`sessionToken` varchar(96) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rpgAccounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `rpgAccounts_nickname_unique` UNIQUE(`nickname`),
	CONSTRAINT `rpgAccounts_sessionToken_unique` UNIQUE(`sessionToken`)
);
--> statement-breakpoint
CREATE TABLE `rpgCharacters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`accountId` int NOT NULL,
	`characterName` varchar(32) NOT NULL,
	`classId` varchar(32) NOT NULL,
	`originId` varchar(32) NOT NULL,
	`appearanceId` varchar(32) NOT NULL,
	`stateJson` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rpgCharacters_id` PRIMARY KEY(`id`),
	CONSTRAINT `rpgCharacters_accountId_unique` UNIQUE(`accountId`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
