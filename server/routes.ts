import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertFacultySchema,
  insertNewsSchema,
  insertEventSchema,
  insertChatChannelSchema,
  insertChatMessageSchema,
  insertDocumentSchema,
  insertReportSchema,
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

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Check if user is banned
      if (user?.isBanned && user.banExpiresAt && new Date() < user.banExpiresAt) {
        return res.status(403).json({ 
          message: "Account is banned", 
          banReason: user.banReason,
          banExpiresAt: user.banExpiresAt 
        });
      }
      
      // Unban user if ban has expired
      if (user?.isBanned && user.banExpiresAt && new Date() >= user.banExpiresAt) {
        await storage.unbanUser(userId);
        const updatedUser = await storage.getUser(userId);
        return res.json(updatedUser);
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User profile routes
  app.put('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  // Faculty routes
  app.get('/api/faculty', async (req, res) => {
    try {
      const { search } = req.query;
      let facultyList;
      
      if (search && typeof search === 'string') {
        facultyList = await storage.searchFaculty(search);
      } else {
        facultyList = await storage.getFaculty();
      }
      
      res.json(facultyList);
    } catch (error) {
      console.error("Error fetching faculty:", error);
      res.status(500).json({ message: "Failed to fetch faculty" });
    }
  });

  app.post('/api/faculty', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const validatedData = insertFacultySchema.parse(req.body);
      const newFaculty = await storage.createFaculty(validatedData);
      res.json(newFaculty);
    } catch (error) {
      console.error("Error creating faculty:", error);
      res.status(500).json({ message: "Failed to create faculty" });
    }
  });

  // News routes
  app.get('/api/news', async (req, res) => {
    try {
      const newsList = await storage.getPublishedNews();
      res.json(newsList);
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ message: "Failed to fetch news" });
    }
  });

  app.post('/api/news', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const validatedData = insertNewsSchema.parse({
        ...req.body,
        authorId: userId,
      });
      
      const newNews = await storage.createNews(validatedData);
      res.json(newNews);
    } catch (error) {
      console.error("Error creating news:", error);
      res.status(500).json({ message: "Failed to create news" });
    }
  });

  // Event routes
  app.get('/api/events', async (req, res) => {
    try {
      const eventsList = await storage.getUpcomingEvents();
      res.json(eventsList);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.post('/api/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const validatedData = insertEventSchema.parse({
        ...req.body,
        organizerId: userId,
      });
      
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
      if (!user?.isAdmin || user.adminLevel < 2) {
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
      
      if (!user?.isAdmin || user.adminLevel < 2) {
        return res.status(403).json({ message: "Super admin access required" });
      }
      
      const updatedSettings = await storage.updateSiteSettings(req.body);
      res.json(updatedSettings);
    } catch (error) {
      console.error("Error updating site settings:", error);
      res.status(500).json({ message: "Failed to update site settings" });
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
