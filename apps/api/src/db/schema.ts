import { mysqlTable, mysqlSchema, AnyMySqlColumn, index, primaryKey, bigint, json, int, unique, varchar, datetime, tinyint } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const rawJson = mysqlTable("raw_json", {
	id: bigint({ mode: "number" }).autoincrement().notNull(),
	jsonContent: json("json_content").notNull(),
	refCount: int("ref_count").default(1).notNull(),
},
(table) => [
	index("idx_ref_count").on(table.refCount),
	primaryKey({ columns: [table.id], name: "raw_json_id"}),
]);

export const userFiles = mysqlTable("user_files", {
	id: bigint({ mode: "number" }).autoincrement().notNull(),
	fileName: varchar("file_name", { length: 255 }).notNull(),
	userId: varchar("user_id", { length: 36 }).notNull(),
	jsonId: bigint("json_id", { mode: "number" }).notNull(),
	shareId: varchar("share_id", { length: 64 }),
	createdAt: datetime("created_at", { mode: 'string'}).default(sql`(CURRENT_TIMESTAMP)`).notNull(),
	updatedAt: datetime("updated_at", { mode: 'string'}).default(sql`(CURRENT_TIMESTAMP)`).notNull(),
	expiredAt: bigint("expired_at", { mode: "number" }).notNull(),
	isShared: tinyint("is_shared").default(0).notNull(),
},
(table) => [
	index("idx_user_id").on(table.userId),
	primaryKey({ columns: [table.id], name: "user_files_id"}),
	unique("idx_share_id").on(table.shareId),
]);
