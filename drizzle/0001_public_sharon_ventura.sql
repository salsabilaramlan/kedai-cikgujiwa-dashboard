CREATE TABLE `sheet_status` (
	`order_key` text PRIMARY KEY NOT NULL,
	`status` text NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
