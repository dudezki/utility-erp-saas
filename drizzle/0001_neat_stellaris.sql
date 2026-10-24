ALTER TABLE `registrations` RENAME COLUMN "name" TO "full_name";--> statement-breakpoint
ALTER TABLE `registrations` ADD `first_name` text;--> statement-breakpoint
ALTER TABLE `registrations` ADD `middle_name` text;--> statement-breakpoint
ALTER TABLE `registrations` ADD `last_name` text;--> statement-breakpoint
ALTER TABLE `registrations` ADD `suffix` text;