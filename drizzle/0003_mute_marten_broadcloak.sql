CREATE TABLE `completed_courses` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`course_code` text NOT NULL,
	`order` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `completed_semesters` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`semester_name` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `user` DROP COLUMN `transfer_edge`;