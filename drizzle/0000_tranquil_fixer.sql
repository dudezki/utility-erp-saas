CREATE TABLE `preview_subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`registration_id` text NOT NULL,
	`package_code` text NOT NULL,
	`package_version` text NOT NULL,
	`package_name` text NOT NULL,
	`modules_snapshot` text NOT NULL,
	`voucher_code` text NOT NULL,
	`status` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	FOREIGN KEY (`registration_id`) REFERENCES `registrations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_preview_subscriptions_registration` ON `preview_subscriptions` (`registration_id`);--> statement-breakpoint
CREATE TABLE `registration_rate_limits` (
	`bucket_key` text PRIMARY KEY NOT NULL,
	`request_count` integer NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `registrations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`normalized_email` text NOT NULL,
	`company_name` text NOT NULL,
	`request_key` text NOT NULL,
	`request_fingerprint` text NOT NULL,
	`privacy_version` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_registrations_request_key` ON `registrations` (`request_key`);