import {
  users,
  faculty,
  news,
  events,
  chatChannels,
  chatMessages,
  documents,
  reports,
  siteSettings,
  type User,
  type UpsertUser,
  type Faculty,
  type InsertFaculty,
  type News,
  type InsertNews,
  type Event,
  type InsertEvent,
  type ChatChannel,
  type InsertChatChannel,
  type ChatMessage,
  type InsertChatMessage,
  type Document,
  type InsertDocument,
  type Report,
  type InsertReport,
  type SiteSettings,
  type InsertSiteSettings,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, like, and, or } from "drizzle-orm";

export interface IStorage {
  // User operations - required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  banUser(id: string, reason: string, expiresAt?: Date): Promise<void>;
  unbanUser(id: string): Promise<void>;
  
  // Faculty operations
  getFaculty(): Promise<Faculty[]>;
  searchFaculty(query: string): Promise<Faculty[]>;
  createFaculty(faculty: InsertFaculty): Promise<Faculty>;
  updateFaculty(id: number, updates: Partial<Faculty>): Promise<Faculty | undefined>;
  deleteFaculty(id: number): Promise<void>;
  
  // News operations
  getNews(): Promise<News[]>;
  getPublishedNews(): Promise<News[]>;
  createNews(news: InsertNews): Promise<News>;
  updateNews(id: number, updates: Partial<News>): Promise<News | undefined>;
  deleteNews(id: number): Promise<void>;
  
  // Event operations
  getEvents(): Promise<Event[]>;
  getUpcomingEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, updates: Partial<Event>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<void>;
  
  // Chat operations
  getChatChannels(): Promise<ChatChannel[]>;
  createChatChannel(channel: InsertChatChannel): Promise<ChatChannel>;
  getChatMessages(channelId: number, limit?: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Document operations
  getDocuments(): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocumentDownloadCount(id: number): Promise<void>;
  deleteDocument(id: number): Promise<void>;
  
  // Report operations
  getReports(): Promise<Report[]>;
  createReport(report: InsertReport): Promise<Report>;
  updateReportStatus(id: number, status: string, adminNotes?: string): Promise<void>;
  
  // Site settings
  getSiteSettings(): Promise<SiteSettings | undefined>;
  updateSiteSettings(settings: Partial<SiteSettings>): Promise<SiteSettings>;
  
  // Admin operations
  getAdmins(): Promise<User[]>;
  promoteToAdmin(userId: string, level: number): Promise<void>;
  removeAdminRights(userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async banUser(id: string, reason: string, expiresAt?: Date): Promise<void> {
    await db
      .update(users)
      .set({
        isBanned: true,
        banReason: reason,
        banExpiresAt: expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));
  }

  async unbanUser(id: string): Promise<void> {
    await db
      .update(users)
      .set({
        isBanned: false,
        banReason: null,
        banExpiresAt: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));
  }

  // Faculty operations
  async getFaculty(): Promise<Faculty[]> {
    return await db.select().from(faculty).orderBy(asc(faculty.name));
  }

  async searchFaculty(query: string): Promise<Faculty[]> {
    return await db
      .select()
      .from(faculty)
      .where(
        or(
          like(faculty.name, `%${query}%`),
          like(faculty.department, `%${query}%`),
          like(faculty.title, `%${query}%`)
        )
      )
      .orderBy(asc(faculty.name));
  }

  async createFaculty(facultyData: InsertFaculty): Promise<Faculty> {
    const [newFaculty] = await db.insert(faculty).values(facultyData).returning();
    return newFaculty;
  }

  async updateFaculty(id: number, updates: Partial<Faculty>): Promise<Faculty | undefined> {
    const [updatedFaculty] = await db
      .update(faculty)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(faculty.id, id))
      .returning();
    return updatedFaculty;
  }

  async deleteFaculty(id: number): Promise<void> {
    await db.delete(faculty).where(eq(faculty.id, id));
  }

  // News operations
  async getNews(): Promise<News[]> {
    return await db.select().from(news).orderBy(desc(news.createdAt));
  }

  async getPublishedNews(): Promise<News[]> {
    return await db
      .select()
      .from(news)
      .where(eq(news.published, true))
      .orderBy(desc(news.createdAt));
  }

  async createNews(newsData: InsertNews): Promise<News> {
    const [newNews] = await db.insert(news).values(newsData).returning();
    return newNews;
  }

  async updateNews(id: number, updates: Partial<News>): Promise<News | undefined> {
    const [updatedNews] = await db
      .update(news)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(news.id, id))
      .returning();
    return updatedNews;
  }

  async deleteNews(id: number): Promise<void> {
    await db.delete(news).where(eq(news.id, id));
  }

  // Event operations
  async getEvents(): Promise<Event[]> {
    return await db.select().from(events).orderBy(asc(events.startTime));
  }

  async getUpcomingEvents(): Promise<Event[]> {
    const now = new Date();
    return await db
      .select()
      .from(events)
      .where(and(eq(events.startTime, now)))
      .orderBy(asc(events.startTime));
  }

  async createEvent(eventData: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(eventData).returning();
    return newEvent;
  }

  async updateEvent(id: number, updates: Partial<Event>): Promise<Event | undefined> {
    const [updatedEvent] = await db
      .update(events)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();
    return updatedEvent;
  }

  async deleteEvent(id: number): Promise<void> {
    await db.delete(events).where(eq(events.id, id));
  }

  // Chat operations
  async getChatChannels(): Promise<ChatChannel[]> {
    return await db.select().from(chatChannels).orderBy(asc(chatChannels.name));
  }

  async createChatChannel(channelData: InsertChatChannel): Promise<ChatChannel> {
    const [newChannel] = await db.insert(chatChannels).values(channelData).returning();
    return newChannel;
  }

  async getChatMessages(channelId: number, limit: number = 50): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.channelId, channelId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
  }

  async createChatMessage(messageData: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatMessages).values(messageData).returning();
    return newMessage;
  }

  // Document operations
  async getDocuments(): Promise<Document[]> {
    return await db.select().from(documents).orderBy(desc(documents.createdAt));
  }

  async createDocument(documentData: InsertDocument): Promise<Document> {
    const [newDocument] = await db.insert(documents).values(documentData).returning();
    return newDocument;
  }

  async updateDocumentDownloadCount(id: number): Promise<void> {
    await db
      .update(documents)
      .set({ downloadCount: eq(documents.downloadCount, documents.downloadCount) })
      .where(eq(documents.id, id));
  }

  async deleteDocument(id: number): Promise<void> {
    await db.delete(documents).where(eq(documents.id, id));
  }

  // Report operations
  async getReports(): Promise<Report[]> {
    return await db.select().from(reports).orderBy(desc(reports.createdAt));
  }

  async createReport(reportData: InsertReport): Promise<Report> {
    const [newReport] = await db.insert(reports).values(reportData).returning();
    return newReport;
  }

  async updateReportStatus(id: number, status: string, adminNotes?: string): Promise<void> {
    await db
      .update(reports)
      .set({
        status,
        adminNotes,
        updatedAt: new Date(),
      })
      .where(eq(reports.id, id));
  }

  // Site settings
  async getSiteSettings(): Promise<SiteSettings | undefined> {
    const [settings] = await db.select().from(siteSettings).limit(1);
    return settings;
  }

  async updateSiteSettings(settingsData: Partial<SiteSettings>): Promise<SiteSettings> {
    // First try to update existing settings
    const [updated] = await db
      .update(siteSettings)
      .set({ ...settingsData, updatedAt: new Date() })
      .returning();

    if (updated) {
      return updated;
    }

    // If no settings exist, create new ones
    const [created] = await db
      .insert(siteSettings)
      .values(settingsData as InsertSiteSettings)
      .returning();
    return created;
  }

  // Admin operations
  async getAdmins(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.isAdmin, true))
      .orderBy(desc(users.adminLevel), asc(users.firstName));
  }

  async promoteToAdmin(userId: string, level: number): Promise<void> {
    await db
      .update(users)
      .set({
        isAdmin: true,
        adminLevel: level,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async removeAdminRights(userId: string): Promise<void> {
    await db
      .update(users)
      .set({
        isAdmin: false,
        adminLevel: 0,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }
}

export const storage = new DatabaseStorage();
