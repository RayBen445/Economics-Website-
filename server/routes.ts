import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { setupAuth, requireAuth, requireAdmin, requireSuperAdmin } from "./auth";
import {
  insertFacultySchema,
  insertNewsSchema,
  insertEventSchema,
  insertChatChannelSchema,
  insertChatMessageSchema,
  insertQuizSchema,
  insertPrivateMessageSchema,
  insertChatHistoryEntrySchema,
} from "@shared/schema";

// File upload configuration
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  await setupAuth(app);

  // Faculty routes
  app.get('/api/faculty', async (req, res) => {
    try {
      const { search } = req.query;
      let faculty;
      
      if (search && typeof search === 'string') {
        faculty = await storage.searchFaculty(search);
      } else {
        faculty = await storage.getFaculty();
      }
      
      res.json(faculty);
    } catch (error) {
      console.error("Error fetching faculty:", error);
      res.status(500).json({ message: "Failed to fetch faculty" });
    }
  });

  app.post('/api/faculty', requireAdmin, async (req: any, res) => {
    try {
      const facultyData = insertFacultySchema.parse(req.body);
      const newFaculty = await storage.createFaculty(facultyData);
      res.json(newFaculty);
    } catch (error) {
      console.error("Error creating faculty:", error);
      res.status(500).json({ message: "Failed to create faculty" });
    }
  });

  // News routes
  app.get('/api/news', async (req, res) => {
    try {
      const news = await storage.getPublishedNews();
      res.json(news);
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ message: "Failed to fetch news" });
    }
  });

  app.post('/api/news', requireAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const newsData = insertNewsSchema.parse({
        ...req.body,
        authorId: userId,
      });
      const newNews = await storage.createNews(newsData);
      res.json(newNews);
    } catch (error) {
      console.error("Error creating news:", error);
      res.status(500).json({ message: "Failed to create news" });
    }
  });

  // Events routes
  app.get('/api/events', async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.post('/api/events', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const eventData = insertEventSchema.parse({
        ...req.body,
        organizerId: userId,
      });
      const newEvent = await storage.createEvent(eventData);
      res.json(newEvent);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  // Chat routes
  app.get('/api/chat/channels', requireAuth, async (req, res) => {
    try {
      const channels = await storage.getChatChannels();
      res.json(channels);
    } catch (error) {
      console.error("Error fetching chat channels:", error);
      res.status(500).json({ message: "Failed to fetch chat channels" });
    }
  });

  app.post('/api/chat/channels', requireAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const channelData = insertChatChannelSchema.parse({
        ...req.body,
        createdById: userId,
      });
      const newChannel = await storage.createChatChannel(channelData);
      res.json(newChannel);
    } catch (error) {
      console.error("Error creating chat channel:", error);
      res.status(500).json({ message: "Failed to create chat channel" });
    }
  });

  app.get('/api/chat/channels/:channelId/messages', requireAuth, async (req, res) => {
    try {
      const channelId = parseInt(req.params.channelId);
      const messages = await storage.getChatMessages(channelId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  // Quiz routes
  app.get('/api/quizzes', requireAuth, async (req, res) => {
    try {
      const quizzes = await storage.getQuizzes();
      res.json(quizzes);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      res.status(500).json({ message: "Failed to fetch quizzes" });
    }
  });

  app.post('/api/quizzes', requireAdmin, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const quizData = insertQuizSchema.parse({
        ...req.body,
        createdById: userId,
      });
      const newQuiz = await storage.createQuiz(quizData);
      res.json(newQuiz);
    } catch (error) {
      console.error("Error creating quiz:", error);
      res.status(500).json({ message: "Failed to create quiz" });
    }
  });

  app.get('/api/quizzes/:id', requireAuth, async (req, res) => {
    try {
      const quizId = parseInt(req.params.id);
      const quiz = await storage.getQuiz(quizId);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      const questions = await storage.getQuizQuestions(quizId);
      res.json({ ...quiz, questions });
    } catch (error) {
      console.error("Error fetching quiz:", error);
      res.status(500).json({ message: "Failed to fetch quiz" });
    }
  });

  // Admin routes
  app.get('/api/admin/users', requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post('/api/admin/promote-user', requireSuperAdmin, async (req: any, res) => {
    try {
      const { targetUserId, adminLevel } = req.body;
      await storage.promoteToAdmin(targetUserId, adminLevel);
      res.json({ message: "User promoted successfully" });
    } catch (error) {
      console.error("Error promoting user:", error);
      res.status(500).json({ message: "Failed to promote user" });
    }
  });

  // Site settings routes
  app.get('/api/site-settings', async (req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching site settings:", error);
      res.status(500).json({ message: "Failed to fetch site settings" });
    }
  });

  app.put('/api/site-settings', requireSuperAdmin, async (req: any, res) => {
    try {
      const updatedSettings = await storage.updateSiteSettings(req.body);
      res.json(updatedSettings);
    } catch (error) {
      console.error("Error updating site settings:", error);
      res.status(500).json({ message: "Failed to update site settings" });
    }
  });

  // AI Chat routes
  app.post('/api/ai-chat', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { message, sessionId } = req.body;
      
      // Simple AI response (can be enhanced with real AI integration)
      const aiResponse = `I understand you're asking about: "${message}". As an AI assistant for LAUTECH Portal, I'm here to help with academic questions, course information, and university services. How can I assist you further?`;
      
      const historyEntry = await storage.saveChatHistory({
        userId,
        sessionId: sessionId || `session_${Date.now()}`,
        userMessage: message,
        aiResponse,
      });
      
      res.json({ response: aiResponse, sessionId: historyEntry.sessionId });
    } catch (error) {
      console.error("Error processing AI chat:", error);
      res.status(500).json({ message: "Failed to process AI chat" });
    }
  });

  app.get('/api/ai-chat/history', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const sessionId = req.query.sessionId as string;
      const history = await storage.getChatHistory(userId, sessionId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      res.status(500).json({ message: "Failed to fetch chat history" });
    }
  });

  // Private messages routes
  app.get('/api/messages', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const messages = await storage.getPrivateMessages(userId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching private messages:", error);
      res.status(500).json({ message: "Failed to fetch private messages" });
    }
  });

  app.post('/api/messages', requireAuth, async (req: any, res) => {
    try {
      const senderId = req.user.id;
      const messageData = insertPrivateMessageSchema.parse({
        ...req.body,
        senderId,
      });
      const newMessage = await storage.sendPrivateMessage(messageData);
      res.json(newMessage);
    } catch (error) {
      console.error("Error sending private message:", error);
      res.status(500).json({ message: "Failed to send private message" });
    }
  });

  // User profile routes
  app.put('/api/user/profile', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { username, bio } = req.body;
      
      const updatedUser = await storage.updateUser(userId, {
        username,
        bio,
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}