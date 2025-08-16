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
  insertDocumentSchema,
  insertReportSchema,
  insertMotivationQuoteSchema,
  insertPrivateMessageSchema,
  insertEventCommentSchema,
  insertQuizSchema,
  insertQuizQuestionSchema,
  insertQuizAttemptSchema,
  insertContactDetailSchema,
  insertChatHistorySchema,
} from "@shared/schema";

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Faculty routes (admin only for creation)
  app.get('/api/faculty', async (req, res) => {
    try {
      const faculty = await storage.getFaculty();
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
      
      // Simple AI response (you can integrate with OpenAI or other AI services)
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

  // WebSocket for real-time chat
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer });

  wss.on('connection', (ws) => {
    console.log('New WebSocket connection');
    
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === 'join_channel') {
          // Join a specific chat channel
          ws.send(JSON.stringify({
            type: 'joined_channel',
            channelId: data.channelId
          }));
        } else if (data.type === 'send_message') {
          // Send message to channel
          const newMessage = await storage.createChatMessage({
            content: data.content,
            channelId: data.channelId,
            userId: data.userId,
          });
          
          // Broadcast to all connected clients
          wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'new_message',
                message: newMessage
              }));
            }
          });
        }
      } catch (error) {
        console.error('WebSocket error:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  return httpServer;
}
      const newEvent = await storage.createEvent(validatedData);
      res.json(newEvent);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  // Chat routes
  app.get('/api/chat/channels', isAuthenticated, async (req, res) => {
    try {
      const channels = await storage.getChatChannels();
      res.json(channels);
    } catch (error) {
      console.error("Error fetching chat channels:", error);
      res.status(500).json({ message: "Failed to fetch chat channels" });
    }
  });

  app.get('/api/chat/messages/:channelId', isAuthenticated, async (req, res) => {
    try {
      const channelId = parseInt(req.params.channelId);
      const messages = await storage.getChatMessages(channelId);
      res.json(messages.reverse()); // Reverse to show oldest first
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  // Document routes
  app.get('/api/documents', isAuthenticated, async (req, res) => {
    try {
      const documentsList = await storage.getDocuments();
      res.json(documentsList);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.post('/api/documents', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const documentData = {
        title: req.body.title || file.originalname,
        description: req.body.description || '',
        filename: file.filename,
        fileSize: file.size,
        mimeType: file.mimetype,
        uploadedById: userId,
      };
      
      const newDocument = await storage.createDocument(documentData);
      res.json(newDocument);
    } catch (error) {
      console.error("Error uploading document:", error);
      res.status(500).json({ message: "Failed to upload document" });
    }
  });

  // Admin routes
  app.get('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const admins = await storage.getAdmins();
      res.json(admins);
    } catch (error) {
      console.error("Error fetching admins:", error);
      res.status(500).json({ message: "Failed to fetch admins" });
    }
  });

  app.post('/api/admin/ban-user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { targetUserId, reason, duration } = req.body;
      let expiresAt: Date | undefined;
      
      if (duration && duration > 0) {
        expiresAt = new Date(Date.now() + duration * 24 * 60 * 60 * 1000); // duration in days
      }
      
      await storage.banUser(targetUserId, reason, expiresAt);
      res.json({ message: "User banned successfully" });
    } catch (error) {
      console.error("Error banning user:", error);
      res.status(500).json({ message: "Failed to ban user" });
    }
  });

  app.post('/api/admin/promote-user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Only super admin (level 2) can promote others
      if (!user?.isAdmin || (user.adminLevel !== null && user.adminLevel < 2)) {
        return res.status(403).json({ message: "Super admin access required" });
      }
      
      const { targetUserId, adminLevel } = req.body;
      await storage.promoteToAdmin(targetUserId, adminLevel);
      res.json({ message: "User promoted successfully" });
    } catch (error) {
      console.error("Error promoting user:", error);
      res.status(500).json({ message: "Failed to promote user" });
    }
  });

  // Report routes
  app.post('/api/reports', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reportData = insertReportSchema.parse({
        ...req.body,
        reporterId: userId,
      });
      
      const newReport = await storage.createReport(reportData);
      res.json(newReport);
    } catch (error) {
      console.error("Error creating report:", error);
      res.status(500).json({ message: "Failed to create report" });
    }
  });

  app.get('/api/admin/reports', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const reports = await storage.getReports();
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
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

  app.put('/api/site-settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin || (user.adminLevel !== null && user.adminLevel < 2)) {
        return res.status(403).json({ message: "Super admin access required" });
      }
      
      const updatedSettings = await storage.updateSiteSettings(req.body);
      res.json(updatedSettings);
    } catch (error) {
      console.error("Error updating site settings:", error);
      res.status(500).json({ message: "Failed to update site settings" });
    }
  });

  // Motivation quotes routes
  app.get('/api/quotes', async (req, res) => {
    try {
      const quotes = await storage.getMotivationQuotes();
      res.json(quotes);
    } catch (error) {
      console.error("Error fetching quotes:", error);
      res.status(500).json({ message: "Failed to fetch quotes" });
    }
  });

  app.get('/api/quotes/random', async (req, res) => {
    try {
      const quote = await storage.getRandomQuote();
      res.json(quote);
    } catch (error) {
      console.error("Error fetching random quote:", error);
      res.status(500).json({ message: "Failed to fetch random quote" });
    }
  });

  app.post('/api/quotes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const result = insertMotivationQuoteSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid quote data", errors: result.error.errors });
      }
      
      const newQuote = await storage.createMotivationQuote(result.data);
      res.status(201).json(newQuote);
    } catch (error) {
      console.error("Error creating quote:", error);
      res.status(500).json({ message: "Failed to create quote" });
    }
  });

  app.put('/api/quotes/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const id = parseInt(req.params.id);
      const updatedQuote = await storage.updateMotivationQuote(id, req.body);
      res.json(updatedQuote);
    } catch (error) {
      console.error("Error updating quote:", error);
      res.status(500).json({ message: "Failed to update quote" });
    }
  });

  app.delete('/api/quotes/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const id = parseInt(req.params.id);
      await storage.deleteMotivationQuote(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting quote:", error);
      res.status(500).json({ message: "Failed to delete quote" });
    }
  });

  // Private messages routes
  app.get('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messages = await storage.getPrivateMessages(userId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.get('/api/messages/conversation/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const otherUserId = req.params.userId;
      const conversation = await storage.getConversation(currentUserId, otherUserId);
      res.json(conversation);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const senderId = req.user.claims.sub;
      const result = insertPrivateMessageSchema.safeParse({
        ...req.body,
        senderId,
      });
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid message data", errors: result.error.errors });
      }
      
      const newMessage = await storage.sendPrivateMessage(result.data);
      res.status(201).json(newMessage);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.put('/api/messages/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const messageId = parseInt(req.params.id);
      await storage.markMessageAsRead(messageId);
      res.status(204).send();
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  // Event comments routes
  app.get('/api/events/:eventId/comments', async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const comments = await storage.getEventComments(eventId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching event comments:", error);
      res.status(500).json({ message: "Failed to fetch event comments" });
    }
  });

  app.post('/api/events/:eventId/comments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventId = parseInt(req.params.eventId);
      
      const result = insertEventCommentSchema.safeParse({
        ...req.body,
        eventId,
        userId,
      });
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid comment data", errors: result.error.errors });
      }
      
      const newComment = await storage.createEventComment(result.data);
      res.status(201).json(newComment);
    } catch (error) {
      console.error("Error creating event comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  app.delete('/api/events/comments/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const commentId = parseInt(req.params.id);
      
      // Allow users to delete their own comments or admins to delete any comment
      if (!user?.isAdmin) {
        // Additional check would be needed to verify ownership
      }
      
      await storage.deleteEventComment(commentId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });

  // Quiz routes
  app.get('/api/quizzes', isAuthenticated, async (req, res) => {
    try {
      const quizzes = await storage.getQuizzes();
      res.json(quizzes);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      res.status(500).json({ message: "Failed to fetch quizzes" });
    }
  });

  app.get('/api/quizzes/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const quiz = await storage.getQuiz(id);
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      res.json(quiz);
    } catch (error) {
      console.error("Error fetching quiz:", error);
      res.status(500).json({ message: "Failed to fetch quiz" });
    }
  });

  app.post('/api/quizzes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const result = insertQuizSchema.safeParse({
        ...req.body,
        createdById: userId,
      });
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid quiz data", errors: result.error.errors });
      }
      
      const newQuiz = await storage.createQuiz(result.data);
      res.status(201).json(newQuiz);
    } catch (error) {
      console.error("Error creating quiz:", error);
      res.status(500).json({ message: "Failed to create quiz" });
    }
  });

  app.get('/api/quizzes/:id/questions', isAuthenticated, async (req, res) => {
    try {
      const quizId = parseInt(req.params.id);
      const questions = await storage.getQuizQuestions(quizId);
      res.json(questions);
    } catch (error) {
      console.error("Error fetching quiz questions:", error);
      res.status(500).json({ message: "Failed to fetch quiz questions" });
    }
  });

  app.post('/api/quizzes/:id/questions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const quizId = parseInt(req.params.id);
      const result = insertQuizQuestionSchema.safeParse({
        ...req.body,
        quizId,
      });
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid question data", errors: result.error.errors });
      }
      
      const newQuestion = await storage.createQuizQuestion(result.data);
      res.status(201).json(newQuestion);
    } catch (error) {
      console.error("Error creating quiz question:", error);
      res.status(500).json({ message: "Failed to create quiz question" });
    }
  });

  app.post('/api/quizzes/:id/attempt', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const quizId = parseInt(req.params.id);
      
      const result = insertQuizAttemptSchema.safeParse({
        ...req.body,
        quizId,
        userId,
      });
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid attempt data", errors: result.error.errors });
      }
      
      const newAttempt = await storage.createQuizAttempt(result.data);
      res.status(201).json(newAttempt);
    } catch (error) {
      console.error("Error creating quiz attempt:", error);
      res.status(500).json({ message: "Failed to create quiz attempt" });
    }
  });

  app.get('/api/user/quiz-attempts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const attempts = await storage.getUserQuizAttempts(userId);
      res.json(attempts);
    } catch (error) {
      console.error("Error fetching user quiz attempts:", error);
      res.status(500).json({ message: "Failed to fetch quiz attempts" });
    }
  });

  // Contact details routes
  app.get('/api/contact-details', async (req, res) => {
    try {
      const contacts = await storage.getContactDetails();
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching contact details:", error);
      res.status(500).json({ message: "Failed to fetch contact details" });
    }
  });

  app.post('/api/contact-details', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const result = insertContactDetailSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid contact data", errors: result.error.errors });
      }
      
      const newContact = await storage.createContactDetail(result.data);
      res.status(201).json(newContact);
    } catch (error) {
      console.error("Error creating contact detail:", error);
      res.status(500).json({ message: "Failed to create contact detail" });
    }
  });

  app.put('/api/contact-details/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const id = parseInt(req.params.id);
      const updatedContact = await storage.updateContactDetail(id, req.body);
      res.json(updatedContact);
    } catch (error) {
      console.error("Error updating contact detail:", error);
      res.status(500).json({ message: "Failed to update contact detail" });
    }
  });

  app.delete('/api/contact-details/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const id = parseInt(req.params.id);
      await storage.deleteContactDetail(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting contact detail:", error);
      res.status(500).json({ message: "Failed to delete contact detail" });
    }
  });

  // Chat history routes for AI conversations
  app.get('/api/chat-history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessionId = req.query.sessionId as string;
      const history = await storage.getChatHistory(userId, sessionId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      res.status(500).json({ message: "Failed to fetch chat history" });
    }
  });

  app.post('/api/chat-history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = insertChatHistorySchema.safeParse({
        ...req.body,
        userId,
      });
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid chat history data", errors: result.error.errors });
      }
      
      const newHistory = await storage.saveChatHistory(result.data);
      res.status(201).json(newHistory);
    } catch (error) {
      console.error("Error saving chat history:", error);
      res.status(500).json({ message: "Failed to save chat history" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('New WebSocket connection');

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'chat_message') {
          const { channelId, content, userId } = message;
          
          // Save message to database
          const newMessage = await storage.createChatMessage({
            channelId: parseInt(channelId),
            content,
            userId,
          });

          // Broadcast to all connected clients
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'new_message',
                message: newMessage,
              }));
            }
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  return httpServer;
}
