import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
  integer,
  serial,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from 'drizzle-orm';
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - required for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  username: varchar("username").unique(),
  bio: text("bio"),
  isAdmin: boolean("is_admin").default(false),
  adminLevel: integer("admin_level").default(0), // 0=user, 1=admin, 2=super admin
  isBanned: boolean("is_banned").default(false),
  banReason: text("ban_reason"),
  banExpiresAt: timestamp("ban_expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const faculty = pgTable("faculty", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  title: varchar("title").notNull(),
  department: varchar("department").notNull(),
  email: varchar("email").notNull().unique(),
  phone: varchar("phone"),
  avatar: varchar("avatar"),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const news = pgTable("news", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  excerpt: text("excerpt"),
  content: text("content"),
  imageUrl: varchar("image_url"),
  authorId: varchar("author_id").references(() => users.id),
  published: boolean("published").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  location: varchar("location"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  organizerId: varchar("organizer_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chatChannels = pgTable("chat_channels", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull().unique(),
  description: text("description"),
  isPrivate: boolean("is_private").default(false),
  createdById: varchar("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  channelId: integer("channel_id").references(() => chatChannels.id),
  userId: varchar("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  filename: varchar("filename").notNull(),
  fileSize: integer("file_size"),
  mimeType: varchar("mime_type"),
  uploadedById: varchar("uploaded_by_id").references(() => users.id),
  downloadCount: integer("download_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  reportType: varchar("report_type").notNull(), // user, content, other
  targetId: varchar("target_id"), // ID of reported item
  reporterId: varchar("reporter_id").references(() => users.id),
  reason: text("reason").notNull(),
  status: varchar("status").default("pending"), // pending, reviewed, resolved
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  siteName: varchar("site_name").default("LAUTECH Portal"),
  siteDescription: text("site_description"),
  logoUrl: varchar("logo_url"),
  heroImageUrl: varchar("hero_image_url"),
  primaryColor: varchar("primary_color").default("#1E3A8A"),
  secondaryColor: varchar("secondary_color").default("#F59E0B"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  news: many(news),
  events: many(events),
  chatMessages: many(chatMessages),
  documents: many(documents),
  reports: many(reports),
}));

export const newsRelations = relations(news, ({ one }) => ({
  author: one(users, { fields: [news.authorId], references: [users.id] }),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  organizer: one(users, { fields: [events.organizerId], references: [users.id] }),
}));

export const chatChannelsRelations = relations(chatChannels, ({ many, one }) => ({
  messages: many(chatMessages),
  createdBy: one(users, { fields: [chatChannels.createdById], references: [users.id] }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  channel: one(chatChannels, { fields: [chatMessages.channelId], references: [chatChannels.id] }),
  user: one(users, { fields: [chatMessages.userId], references: [users.id] }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  uploadedBy: one(users, { fields: [documents.uploadedById], references: [users.id] }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  reporter: one(users, { fields: [reports.reporterId], references: [users.id] }),
}));

// Export types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Faculty = typeof faculty.$inferSelect;
export type InsertFaculty = typeof faculty.$inferInsert;
export type News = typeof news.$inferSelect;
export type InsertNews = typeof news.$inferInsert;
export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;
export type ChatChannel = typeof chatChannels.$inferSelect;
export type InsertChatChannel = typeof chatChannels.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;
export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;
export type SiteSettings = typeof siteSettings.$inferSelect;
export type InsertSiteSettings = typeof siteSettings.$inferInsert;

// Validation schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFacultySchema = createInsertSchema(faculty).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNewsSchema = createInsertSchema(news).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatChannelSchema = createInsertSchema(chatChannels).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
