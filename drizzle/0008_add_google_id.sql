DROP TABLE `request`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`password_hash` text,
	`google_id` text,
	`first_name` text,
	`last_name` text,
	`current_college` text,
	`major` text,
	`target_uni` text,
	`start_season` text,
	`start_year` integer,
	`igetc_tasks` text,
	`pattern_tasks` text,
	`deadlines` text,
	`last_college_change` integer
);
--> statement-breakpoint
INSERT INTO `__new_user`("id", "username", "password_hash", "google_id", "first_name", "last_name", "current_college", "major", "target_uni", "start_season", "start_year", "igetc_tasks", "pattern_tasks", "deadlines", "last_college_change") SELECT "id", "username", "password_hash", "google_id", "first_name", "last_name", "current_college", "major", "target_uni", "start_season", "start_year", "igetc_tasks", "pattern_tasks", "deadlines", "last_college_change" FROM `user`;--> statement-breakpoint
DROP TABLE `user`;--> statement-breakpoint
ALTER TABLE `__new_user` RENAME TO `user`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_google_id_unique` ON `user` (`google_id`);