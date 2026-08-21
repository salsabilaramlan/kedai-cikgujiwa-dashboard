CREATE TABLE `orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_no` text NOT NULL,
	`customer` text NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`product` text NOT NULL,
	`details` text DEFAULT '' NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`total` real DEFAULT 0 NOT NULL,
	`payment_status` text DEFAULT 'Belum bayar' NOT NULL,
	`status` text DEFAULT 'Belum dibuat' NOT NULL,
	`due_date` text DEFAULT '' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_order_no_unique` ON `orders` (`order_no`);