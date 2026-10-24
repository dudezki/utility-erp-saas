CREATE TABLE `catalog_modules` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`display_name` text NOT NULL,
	`availability_status` text DEFAULT 'planned' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	CONSTRAINT "ck_catalog_modules_status" CHECK("catalog_modules"."availability_status" IN ('planned','preview','available'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `catalog_modules_code_unique` ON `catalog_modules` (`code`);--> statement-breakpoint
CREATE TABLE `package_listings` (
	`id` text PRIMARY KEY NOT NULL,
	`package_version_id` text NOT NULL,
	`price_id` text,
	`market_code` text NOT NULL,
	`locale` text NOT NULL,
	`currency` text NOT NULL,
	`billing_interval` text NOT NULL,
	`offer_kind` text NOT NULL,
	`sales_status` text NOT NULL,
	`is_public` integer DEFAULT false NOT NULL,
	`badge` text NOT NULL,
	`summary` text NOT NULL,
	`is_featured` integer DEFAULT false NOT NULL,
	`display_order` integer DEFAULT 0 NOT NULL,
	`visible_from` text NOT NULL,
	`visible_until` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	FOREIGN KEY (`package_version_id`) REFERENCES `package_versions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`package_version_id`,`price_id`) REFERENCES `package_prices`(`package_version_id`,`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "ck_package_listings_kind" CHECK("package_listings"."offer_kind" IN ('preview','inquiry','paid')),
	CONSTRAINT "ck_package_listings_sales" CHECK("package_listings"."sales_status" IN ('open','inquiry_only','closed')),
	CONSTRAINT "ck_package_listings_paid_price" CHECK("package_listings"."offer_kind" <> 'paid' OR "package_listings"."price_id" IS NOT NULL),
	CONSTRAINT "ck_package_listings_interval" CHECK("package_listings"."visible_until" IS NULL OR "package_listings"."visible_until" > "package_listings"."visible_from"),
	CONSTRAINT "ck_package_listings_public_boolean" CHECK("package_listings"."is_public" IN (0,1)),
	CONSTRAINT "ck_package_listings_featured_boolean" CHECK("package_listings"."is_featured" IN (0,1))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_package_listings_version_market` ON `package_listings` (`package_version_id`,`market_code`,`locale`,`currency`,`billing_interval`);--> statement-breakpoint
CREATE UNIQUE INDEX `uq_package_listings_version_id` ON `package_listings` (`package_version_id`,`id`);--> statement-breakpoint
CREATE TABLE `package_modules` (
	`package_version_id` text NOT NULL,
	`module_id` text NOT NULL,
	`display_order` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`package_version_id`, `module_id`),
	FOREIGN KEY (`package_version_id`) REFERENCES `package_versions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`module_id`) REFERENCES `catalog_modules`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `package_prices` (
	`id` text PRIMARY KEY NOT NULL,
	`package_version_id` text NOT NULL,
	`currency` text NOT NULL,
	`billing_interval` text NOT NULL,
	`amount_minor` integer NOT NULL,
	`publication_status` text DEFAULT 'draft' NOT NULL,
	`valid_from` text NOT NULL,
	`valid_until` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	FOREIGN KEY (`package_version_id`) REFERENCES `package_versions`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "ck_package_prices_amount" CHECK("package_prices"."amount_minor" >= 0),
	CONSTRAINT "ck_package_prices_status" CHECK("package_prices"."publication_status" IN ('draft','published')),
	CONSTRAINT "ck_package_prices_interval" CHECK("package_prices"."valid_until" IS NULL OR "package_prices"."valid_until" > "package_prices"."valid_from")
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_package_prices_version_id` ON `package_prices` (`package_version_id`,`id`);--> statement-breakpoint
CREATE TABLE `package_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`package_id` text NOT NULL,
	`version_code` text NOT NULL,
	`display_name` text NOT NULL,
	`publication_status` text DEFAULT 'draft' NOT NULL,
	`published_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	FOREIGN KEY (`package_id`) REFERENCES `packages`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "ck_package_versions_status" CHECK("package_versions"."publication_status" IN ('draft','published')),
	CONSTRAINT "ck_package_versions_published_at" CHECK("package_versions"."publication_status" <> 'published' OR "package_versions"."published_at" IS NOT NULL)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_package_versions_code` ON `package_versions` (`package_id`,`version_code`);--> statement-breakpoint
CREATE TABLE `packages` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `packages_code_unique` ON `packages` (`code`);--> statement-breakpoint
PRAGMA defer_foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_preview_subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`registration_id` text NOT NULL,
	`package_version_id` text,
	`package_listing_id` text,
	`package_code` text NOT NULL,
	`package_version` text NOT NULL,
	`package_name` text NOT NULL,
	`modules_snapshot` text NOT NULL,
	`module_codes_snapshot` text,
	`voucher_code` text NOT NULL,
	`status` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	FOREIGN KEY (`registration_id`) REFERENCES `registrations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`package_version_id`) REFERENCES `package_versions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`package_listing_id`) REFERENCES `package_listings`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`package_version_id`,`package_listing_id`) REFERENCES `package_listings`(`package_version_id`,`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_preview_subscriptions`("id", "registration_id", "package_version_id", "package_listing_id", "package_code", "package_version", "package_name", "modules_snapshot", "module_codes_snapshot", "voucher_code", "status", "created_at", "updated_at", "deleted_at") SELECT "id", "registration_id", NULL, NULL, "package_code", "package_version", "package_name", "modules_snapshot", NULL, "voucher_code", "status", "created_at", "updated_at", "deleted_at" FROM `preview_subscriptions`;--> statement-breakpoint
DROP TABLE `preview_subscriptions`;--> statement-breakpoint
ALTER TABLE `__new_preview_subscriptions` RENAME TO `preview_subscriptions`;--> statement-breakpoint
PRAGMA defer_foreign_keys=OFF;--> statement-breakpoint
CREATE UNIQUE INDEX `uq_preview_subscriptions_registration` ON `preview_subscriptions` (`registration_id`);
--> statement-breakpoint
CREATE TRIGGER tr_package_versions_immutable_update BEFORE UPDATE ON package_versions WHEN OLD.publication_status='published'
BEGIN
 SELECT RAISE(ABORT,'Published package versions are immutable; create a new version');
END;
--> statement-breakpoint
CREATE TRIGGER tr_package_versions_immutable_delete BEFORE DELETE ON package_versions WHEN OLD.publication_status='published'
BEGIN
 SELECT RAISE(ABORT,'Published package versions cannot be deleted');
END;
--> statement-breakpoint
CREATE TRIGGER tr_package_modules_immutable_insert BEFORE INSERT ON package_modules WHEN EXISTS (SELECT 1 FROM package_versions WHERE id=NEW.package_version_id AND publication_status='published')
BEGIN
 SELECT RAISE(ABORT,'Published module inclusions are immutable');
END;
--> statement-breakpoint
CREATE TRIGGER tr_package_modules_immutable_update BEFORE UPDATE ON package_modules WHEN EXISTS (SELECT 1 FROM package_versions WHERE id=OLD.package_version_id AND publication_status='published') OR EXISTS (SELECT 1 FROM package_versions WHERE id=NEW.package_version_id AND publication_status='published')
BEGIN
 SELECT RAISE(ABORT,'Published module inclusions are immutable');
END;
--> statement-breakpoint
CREATE TRIGGER tr_package_modules_immutable_delete BEFORE DELETE ON package_modules WHEN EXISTS (SELECT 1 FROM package_versions WHERE id=OLD.package_version_id AND publication_status='published')
BEGIN
 SELECT RAISE(ABORT,'Published module inclusions are immutable');
END;
--> statement-breakpoint
CREATE TRIGGER tr_package_prices_immutable_update BEFORE UPDATE ON package_prices WHEN OLD.publication_status='published'
BEGIN
 SELECT RAISE(ABORT,'Published prices are immutable');
END;
--> statement-breakpoint
CREATE TRIGGER tr_package_prices_immutable_delete BEFORE DELETE ON package_prices WHEN OLD.publication_status='published'
BEGIN
 SELECT RAISE(ABORT,'Published prices are immutable');
END;
--> statement-breakpoint
CREATE TRIGGER tr_packages_stable_code BEFORE UPDATE ON packages WHEN NEW.code<>OLD.code
BEGIN
 SELECT RAISE(ABORT,'Package codes are immutable');
END;
--> statement-breakpoint
CREATE TRIGGER tr_catalog_modules_stable_code BEFORE UPDATE ON catalog_modules WHEN NEW.code<>OLD.code
BEGIN
 SELECT RAISE(ABORT,'Module codes are immutable');
END;
