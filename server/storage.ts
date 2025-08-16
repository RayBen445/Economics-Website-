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
  motivationQuotes,
  privateMessages,
  eventComments,
  quizzes,
  quizQuestions,
  quizAttempts,
  contactDetails,
  chatHistory,
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
  type MotivationQuote,
  type InsertMotivationQuote,
  type PrivateMessage,
  type InsertPrivateMessage,
  type EventComment,
  type InsertEventComment,
  type Quiz,
  type InsertQuiz,
  type QuizQuestion,
  type InsertQuizQuestion,
  type QuizAttempt,
  type InsertQuizAttempt,
  type ContactDetail,
  type InsertContactDetail,
  type ChatHistoryEntry,
  type InsertChatHistoryEntry,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, like, and, or } from "drizzle-orm";

export interface IStorage {
  // User operations - real authentication
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  banUser(id: string, reason: string, expiresAt?: Date): Promise<void>;
  unbanUser(id: string): Promise<void>;
  promoteToAdmin(id: string, adminLevel: number): Promise<void>;
  getAllUsers(): Promise<User[]>;

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

  // Motivation quotes
  getMotivationQuotes(): Promise<MotivationQuote[]>;
  getRandomQuote(): Promise<MotivationQuote | undefined>;
  createMotivationQuote(quote: InsertMotivationQuote): Promise<MotivationQuote>;
  updateMotivationQuote(id: number, updates: Partial<MotivationQuote>): Promise<MotivationQuote | undefined>;
  deleteMotivationQuote(id: number): Promise<void>;

  // Private messages
  getPrivateMessages(userId: string): Promise<PrivateMessage[]>;
  getConversation(user1Id: string, user2Id: string): Promise<PrivateMessage[]>;
  sendPrivateMessage(message: InsertPrivateMessage): Promise<PrivateMessage>;
  markMessageAsRead(messageId: number): Promise<void>;

  // Event comments
  getEventComments(eventId: number): Promise<EventComment[]>;
  createEventComment(comment: InsertEventComment): Promise<EventComment>;
  deleteEventComment(id: number): Promise<void>;

  // Quiz system
  getQuizzes(): Promise<Quiz[]>;
  getQuiz(id: number): Promise<Quiz | undefined>;
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  updateQuiz(id: number, updates: Partial<Quiz>): Promise<Quiz | undefined>;
  deleteQuiz(id: number): Promise<void>;

  getQuizQuestions(quizId: number): Promise<QuizQuestion[]>;
  createQuizQuestion(question: InsertQuizQuestion): Promise<QuizQuestion>;
  updateQuizQuestion(id: number, updates: Partial<QuizQuestion>): Promise<QuizQuestion | undefined>;
  deleteQuizQuestion(id: number): Promise<void>;

  getQuizAttempts(quizId: number): Promise<QuizAttempt[]>;
  getUserQuizAttempts(userId: string): Promise<QuizAttempt[]>;
  createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt>;

  // Contact details
  getContactDetails(): Promise<ContactDetail[]>;
  createContactDetail(contact: InsertContactDetail): Promise<ContactDetail>;
  updateContactDetail(id: number, updates: Partial<ContactDetail>): Promise<ContactDetail | undefined>;
  deleteContactDetail(id: number): Promise<void>;

  // Chat history for AI conversations
  getChatHistory(userId: string, sessionId?: string): Promise<ChatHistoryEntry[]>;
  saveChatHistory(history: InsertChatHistoryEntry): Promise<ChatHistoryEntry>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.email,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(asc(users.createdAt));
  }

  async promoteToAdmin(id: string, adminLevel: number): Promise<void> {
    await db
      .update(users)
      .set({ isAdmin: true, adminLevel, updatedAt: new Date() })
      .where(eq(users.id, id));
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

  // Motivation quotes operations
  async getMotivationQuotes(): Promise<MotivationQuote[]> {
    return await db
      .select()
      .from(motivationQuotes)
      .where(eq(motivationQuotes.isActive, true))
      .orderBy(desc(motivationQuotes.createdAt));
  }

  async getRandomQuote(): Promise<MotivationQuote | undefined> {
    const quotes = await db
      .select()
      .from(motivationQuotes)
      .where(eq(motivationQuotes.isActive, true));

    if (quotes.length === 0) return undefined;

    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  }

  async createMotivationQuote(quoteData: InsertMotivationQuote): Promise<MotivationQuote> {
    const [newQuote] = await db.insert(motivationQuotes).values(quoteData).returning();
    return newQuote;
  }

  async updateMotivationQuote(id: number, updates: Partial<MotivationQuote>): Promise<MotivationQuote | undefined> {
    const [updated] = await db
      .update(motivationQuotes)
      .set(updates)
      .where(eq(motivationQuotes.id, id))
      .returning();
    return updated;
  }

  async deleteMotivationQuote(id: number): Promise<void> {
    await db.delete(motivationQuotes).where(eq(motivationQuotes.id, id));
  }

  // Private messages operations
  async getPrivateMessages(userId: string): Promise<PrivateMessage[]> {
    return await db
      .select()
      .from(privateMessages)
      .where(or(eq(privateMessages.senderId, userId), eq(privateMessages.receiverId, userId)))
      .orderBy(desc(privateMessages.createdAt));
  }

  async getConversation(user1Id: string, user2Id: string): Promise<PrivateMessage[]> {
    return await db
      .select()
      .from(privateMessages)
      .where(
        or(
          and(eq(privateMessages.senderId, user1Id), eq(privateMessages.receiverId, user2Id)),
          and(eq(privateMessages.senderId, user2Id), eq(privateMessages.receiverId, user1Id))
        )
      )
      .orderBy(asc(privateMessages.createdAt));
  }

  async sendPrivateMessage(messageData: InsertPrivateMessage): Promise<PrivateMessage> {
    const [newMessage] = await db.insert(privateMessages).values(messageData).returning();
    return newMessage;
  }

  async markMessageAsRead(messageId: number): Promise<void> {
    await db
      .update(privateMessages)
      .set({ isRead: true })
      .where(eq(privateMessages.id, messageId));
  }

  // Event comments operations
  async getEventComments(eventId: number): Promise<EventComment[]> {
    return await db
      .select()
      .from(eventComments)
      .where(eq(eventComments.eventId, eventId))
      .orderBy(asc(eventComments.createdAt));
  }

  async createEventComment(commentData: InsertEventComment): Promise<EventComment> {
    const [newComment] = await db.insert(eventComments).values(commentData).returning();
    return newComment;
  }

  async deleteEventComment(id: number): Promise<void> {
    await db.delete(eventComments).where(eq(eventComments.id, id));
  }

  // Quiz system operations
  async getQuizzes(): Promise<Quiz[]> {
    return await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.isActive, true))
      .orderBy(desc(quizzes.createdAt));
  }

  async getQuiz(id: number): Promise<Quiz | undefined> {
    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, id));
    return quiz;
  }

  async createQuiz(quizData: InsertQuiz): Promise<Quiz> {
    const [newQuiz] = await db.insert(quizzes).values(quizData).returning();
    return newQuiz;
  }

  async updateQuiz(id: number, updates: Partial<Quiz>): Promise<Quiz | undefined> {
    const [updated] = await db
      .update(quizzes)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(quizzes.id, id))
      .returning();
    return updated;
  }

  async deleteQuiz(id: number): Promise<void> {
    await db.delete(quizzes).where(eq(quizzes.id, id));
  }

  async getQuizQuestions(quizId: number): Promise<QuizQuestion[]> {
    return await db
      .select()
      .from(quizQuestions)
      .where(eq(quizQuestions.quizId, quizId))
      .orderBy(asc(quizQuestions.createdAt));
  }

  async createQuizQuestion(questionData: InsertQuizQuestion): Promise<QuizQuestion> {
    const [newQuestion] = await db.insert(quizQuestions).values(questionData).returning();
    return newQuestion;
  }

  async updateQuizQuestion(id: number, updates: Partial<QuizQuestion>): Promise<QuizQuestion | undefined> {
    const [updated] = await db
      .update(quizQuestions)
      .set(updates)
      .where(eq(quizQuestions.id, id))
      .returning();
    return updated;
  }

  async deleteQuizQuestion(id: number): Promise<void> {
    await db.delete(quizQuestions).where(eq(quizQuestions.id, id));
  }

  async getQuizAttempts(quizId: number): Promise<QuizAttempt[]> {
    return await db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.quizId, quizId))
      .orderBy(desc(quizAttempts.completedAt));
  }

  async getUserQuizAttempts(userId: string): Promise<QuizAttempt[]> {
    return await db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.userId, userId))
      .orderBy(desc(quizAttempts.completedAt));
  }

  async createQuizAttempt(attemptData: InsertQuizAttempt): Promise<QuizAttempt> {
    const [newAttempt] = await db.insert(quizAttempts).values(attemptData).returning();
    return newAttempt;
  }

  // Contact details operations
  async getContactDetails(): Promise<ContactDetail[]> {
    return await db
      .select()
      .from(contactDetails)
      .orderBy(asc(contactDetails.order), asc(contactDetails.type));
  }

  async createContactDetail(contactData: InsertContactDetail): Promise<ContactDetail> {
    const [newContact] = await db.insert(contactDetails).values(contactData).returning();
    return newContact;
  }

  async updateContactDetail(id: number, updates: Partial<ContactDetail>): Promise<ContactDetail | undefined> {
    const [updated] = await db
      .update(contactDetails)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(contactDetails.id, id))
      .returning();
    return updated;
  }

  async deleteContactDetail(id: number): Promise<void> {
    await db.delete(contactDetails).where(eq(contactDetails.id, id));
  }

  // Chat history operations
  async getChatHistory(userId: string, sessionId?: string): Promise<ChatHistoryEntry[]> {
    let query = db
      .select()
      .from(chatHistory)
      .where(eq(chatHistory.userId, userId));

    if (sessionId) {
      query = query.where(eq(chatHistory.sessionId, sessionId));
    }

    return await query.orderBy(asc(chatHistory.createdAt));
  }

  async saveChatHistory(historyData: InsertChatHistoryEntry): Promise<ChatHistoryEntry> {
    const [newHistory] = await db.insert(chatHistory).values(historyData).returning();
    return newHistory;
  }
}

export const storage = new DatabaseStorage();