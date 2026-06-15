CREATE TABLE `accounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `accounts_name_unique` ON `accounts` (`name`);--> statement-breakpoint
INSERT INTO `accounts` (`name`) VALUES ('Live Account');--> statement-breakpoint
ALTER TABLE `import_batches` ADD `account_id` integer REFERENCES accounts(id);--> statement-breakpoint
ALTER TABLE `trades` ADD `account_id` integer REFERENCES accounts(id);--> statement-breakpoint
ALTER TABLE `executions` ADD `account_id` integer REFERENCES accounts(id);--> statement-breakpoint
ALTER TABLE `journal_entries` ADD `account_id` integer REFERENCES accounts(id);--> statement-breakpoint
UPDATE `import_batches` SET `account_id` = (SELECT `id` FROM `accounts` WHERE `name` = 'Live Account' LIMIT 1);--> statement-breakpoint
UPDATE `trades` SET `account_id` = (SELECT `id` FROM `accounts` WHERE `name` = 'Live Account' LIMIT 1);--> statement-breakpoint
UPDATE `executions` SET `account_id` = (SELECT `id` FROM `accounts` WHERE `name` = 'Live Account' LIMIT 1);--> statement-breakpoint
UPDATE `journal_entries` SET `account_id` = (SELECT `id` FROM `accounts` WHERE `name` = 'Live Account' LIMIT 1);--> statement-breakpoint
DROP INDEX `executions_source_row_hash_unq`;--> statement-breakpoint
CREATE UNIQUE INDEX `executions_source_row_hash_account_unq` ON `executions` (`source_row_hash`,`account_id`);
