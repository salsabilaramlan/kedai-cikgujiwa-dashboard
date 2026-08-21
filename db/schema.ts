import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
export const orders=sqliteTable("orders",{
 id:integer("id").primaryKey({autoIncrement:true}),orderNo:text("order_no").notNull().unique(),customer:text("customer").notNull(),phone:text("phone").notNull().default(""),product:text("product").notNull(),details:text("details").notNull().default(""),quantity:integer("quantity").notNull().default(1),total:real("total").notNull().default(0),paymentStatus:text("payment_status").notNull().default("Belum bayar"),status:text("status").notNull().default("Belum dibuat"),dueDate:text("due_date").notNull().default(""),notes:text("notes").notNull().default(""),createdAt:text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),updatedAt:text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});
export const sheetStatus=sqliteTable("sheet_status",{orderKey:text("order_key").primaryKey(),status:text("status").notNull(),updatedAt:text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)});
