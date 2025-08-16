import { storage } from "./storage";

export async function initializeMainAdmin() {
  try {
    // Check if main admin already exists
    const existingAdmin = await storage.getUserByEmail("oladoyeheritage445@gmail.com");
    
    if (!existingAdmin) {
      console.log("Main admin not found. Will be created on first login.");
      return;
    }

    // Ensure main admin has proper permissions
    if (!existingAdmin.isAdmin || existingAdmin.adminLevel !== 2) {
      await storage.promoteToAdmin(existingAdmin.id, 2);
      console.log("Main admin permissions updated successfully");
    } else {
      console.log("Main admin already has proper permissions");
    }

    // Initialize default chat channels if they don't exist
    const channels = await storage.getChatChannels();
    if (channels.length === 0) {
      await storage.createChatChannel({
        name: "general",
        description: "General discussion for all members",
        isPrivate: false,
        createdById: existingAdmin.id,
      });

      await storage.createChatChannel({
        name: "economics",
        description: "Economics department discussions",
        isPrivate: false,
        createdById: existingAdmin.id,
      });

      await storage.createChatChannel({
        name: "announcements",
        description: "Official announcements from administration",
        isPrivate: false,
        createdById: existingAdmin.id,
      });

      console.log("Default chat channels created successfully");
    }

    // Initialize default site settings
    const siteSettings = await storage.getSiteSettings();
    if (!siteSettings) {
      await storage.updateSiteSettings({
        siteName: "LAUTECH Portal",
        siteDescription: "Academic Management System for Ladoke Akintola University of Technology",
        primaryColor: "#1E3A8A",
        secondaryColor: "#F59E0B",
      });
      console.log("Default site settings created successfully");
    }

  } catch (error) {
    console.error("Error initializing main admin:", error);
  }
}
