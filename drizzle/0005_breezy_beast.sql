CREATE TABLE `custom_courses` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`local_code` text NOT NULL,
	`title` text NOT NULL,
	`units` real NOT NULL,
	`required_by` text,
	`created_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
