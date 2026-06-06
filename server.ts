/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import http from "http";
import path from "path";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { testDatabaseConnection, dbService } from "./src/server/db.ts";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "vb-jwt-procurement-secret-key-9938";

// Set up standard HTTP server to support Socket.IO and Express together
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Lazy initialization helper for Gemini
let aiClient: GoogleGenAI | null = null;
const isApiKeyConfigured = () => {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  return key && key !== "MY_GEMINI_API_KEY" && key !== "MY_GOOGLE_API_KEY" && key.trim() !== "";
};

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    if (isApiKeyConfigured()) {
      const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// Helpers for Socket.IO dispatching
function pushNotification(title: string, message: string, type: "success" | "info" | "warning" | "error") {
  console.log(`[Socket Notification] Broadcasting alert: "${title}" - "${message}"`);
  io.emit("system-notification", {
    id: `notif-${Date.now()}`,
    title,
    message,
    type,
    read: false,
    createdAt: new Date().toISOString()
  });
  // Persist notification immediately in database
  dbService.createNotification({ title, message, type }).catch(err => {
    console.error("Failed to store notification in database", err);
  });
}

// --- REST Endpoint Route Declarations ---

// JWT Token Authentication Middleware
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Access token required for authorization" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: "Invalid or expired session token" });
    req.user = user;
    next();
  });
}

// REST Route for checking Sync state
app.get("/api/health", async (req, res) => {
  const isPostgresConnected = !dbService.isFallback();
  res.json({
    status: "ok",
    database: isPostgresConnected ? "PostgreSQL (Prisma)" : "In-Memory JSON Fallback Server Layer",
    engine: isPostgresConnected ? "active" : "fallback-mode"
  });
});

// Real synchronization of localStorage data
app.post("/api/sync", async (req, res) => {
  try {
    const payload = req.body;
    if (!payload) return res.status(400).json({ error: "Missing sync payload data" });

    const result = await dbService.syncLocalStorageData(payload);
    res.json({ success: true, database: dbService.isFallback() ? "fallback" : "postgres", ...result });
  } catch (err: any) {
    console.error("Local Storage database synchronization failed", err);
    res.status(500).json({ error: err.message });
  }
});

// Authentication Routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;
    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({ error: "Missing required registration parameters" });
    }

    const existingUser = await dbService.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: "Email address is already in use by another user profile" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await dbService.createUser({
      email,
      passwordHash,
      firstName,
      lastName,
      role: role.toUpperCase(),
    });

    res.status(201).json({
      success: true,
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password, rememberMe, role } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email address is required to login" });
    }

    let user = await dbService.getUserByEmail(email);
    if (!user) {
      // Create user on-the-fly to support the seamless mock user onboarding fallback from earlier setup
      const defaultPasswordHash = await bcrypt.hash(password || "password123", 10);
      
      let resolvedRole = "PROCUREMENT";
      if (role) {
        resolvedRole = role.toUpperCase();
      } else if (email.includes("admin")) {
        resolvedRole = "ADMIN";
      } else if (email.includes("mgr") || email.includes("manager") || email.includes("sophia") || email.includes("rodriguez")) {
        resolvedRole = "MANAGER";
      } else if (email.includes("vendor") || email.includes("marcus") || email.includes("apex") || email.includes("kross")) {
        resolvedRole = "VENDOR";
      } else if (email.includes("jenkins") || email.includes("sarah")) {
        resolvedRole = "PROCUREMENT";
      }

      user = await dbService.createUser({
        email,
        passwordHash: defaultPasswordHash,
        firstName: email.split("@")[0],
        lastName: "Member",
        role: resolvedRole
      });
    } else if (password) {
      // Validate password if user supplied a password
      const isPassValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPassValid) {
        return res.status(401).json({ error: "Invalid password credentials provided" });
      }
    }

    const tokenExp = rememberMe ? "30d" : "1d";
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: tokenExp });
    const refreshToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "90d" });

    // Track login activity
    await dbService.createActivity({
      type: "AUTH",
      description: `${user.firstName} ${user.lastName} successfully logged in.`,
      user: user.firstName,
      role: user.role
    });

    res.json({
      success: true,
      token,
      refreshToken,
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email address is required" });

  const user = await dbService.getUserByEmail(email);
  if (!user) return res.status(404).json({ error: "No profile registered with this email address" });

  // Mock a safe reset token for the user forgot password workflow
  const resetToken = jwt.sign({ id: user.id, purpose: "reset" }, JWT_SECRET, { expiresIn: "1h" });
  res.json({
    success: true,
    message: "Password reset link formulated. In production, this emails the user.",
    token: resetToken
  });
});

// Profile Actions
app.post("/api/auth/profile", authenticateToken, async (req: any, res) => {
  try {
    const fields = req.body;
    const email = req.user.email;
    const user = await dbService.getUserByEmail(email);

    if (!user) return res.status(404).json({ error: "Logged in user not found" });

    const updated = await dbService.updateVendor(user.id, fields); // user mapping fallback is identical
    res.json({ success: true, user: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Vendors REST
app.get("/api/vendors", async (req, res) => {
  const list = await dbService.getVendors();
  res.json(list);
});

app.post("/api/vendors", async (req, res) => {
  try {
    const data = req.body;
    const newVendor = await dbService.createVendor(data);

    // Track Sourcing Activity log & emit notifications
    await dbService.createActivity({
      type: "VENDOR",
      description: `Vendor profile created: "${newVendor.companyName}".`,
      user: "System Admin",
      role: "ADMIN"
    });
    pushNotification("Vendor Configured", `"${newVendor.companyName}" successfully recorded in database.`, "success");

    res.status(201).json(newVendor);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/vendors/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updated = await dbService.updateVendor(id, data);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/vendors/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await dbService.deleteVendor(id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// RFQs CRUD REST
app.get("/api/rfqs", async (req, res) => {
  const list = await dbService.getRfqs();
  res.json(list);
});

app.post("/api/rfqs", async (req, res) => {
  try {
    const data = req.body;
    const newRfq = await dbService.createRfq(data);

    await dbService.createActivity({
      type: "RFQ",
      description: `Draft Sourcing Request initialized: "${newRfq.title}".`,
      user: data.creatorName || "Sarah",
      role: "PROCUREMENT"
    });

    res.status(201).json(newRfq);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/rfqs/:id/publish", async (req, res) => {
  try {
    const { id } = req.params;
    await dbService.updateRfqStatus(id, "OPEN");

    const rfqs = await dbService.getRfqs();
    const rfq = rfqs.find((r: any) => r.id === id);
    const title = rfq ? rfq.title : "Sourcing Contract";

    await dbService.createActivity({
      type: "RFQ",
      description: `RFQ "${title}" published to public exchange for bid quotations.`,
      user: "Sarah",
      role: "PROCUREMENT"
    });

    // Notify registered vendors of newly open project
    pushNotification("RFQ Open for Bids", `"${title}" has been published. Sourcing representatives notified.`, "success");

    res.json({ success: true, status: "Open" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/rfqs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await dbService.deleteRfq(id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Quotations Bids REST
app.get("/api/quotations", async (req, res) => {
  const list = await dbService.getQuotations();
  res.json(list);
});

app.post("/api/quotations", async (req, res) => {
  try {
    const data = req.body;
    const newQuote = await dbService.createQuotation(data);

    await dbService.createActivity({
      type: "QUOTATION",
      description: `Quotation bid submitted by "${newQuote.vendorName}" costing $${(newQuote.grandTotal || 0).toLocaleString()}.`,
      user: newQuote.vendorName,
      role: "VENDOR"
    });

    pushNotification("Quotation Bid Logged", `"${newQuote.vendorName}" registered bid response costing $${newQuote.grandTotal?.toLocaleString()}.`, "info");

    res.status(201).json(newQuote);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Approvals REST APIs
app.get("/api/approvals", async (req, res) => {
  const list = await dbService.getApprovals();
  res.json(list);
});

app.post("/api/approvals", async (req, res) => {
  try {
    const data = req.body;
    const newApproval = await dbService.createApproval(data);
    res.status(201).json(newApproval);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/approvals/:id/process", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks, managerName } = req.body;

    const approvals = await dbService.getApprovals();
    const current = approvals.find((a: any) => a.id === id);
    if (!current) return res.status(404).json({ error: "Approval request not found" });

    // Conduct workflow calculations
    let nextStatus = status;
    let isFinalApproved = false;

    // Check dual stage threshold limit
    const targetQuoteId = current.targetQuoteId || current.targetId;
    const quotes = await dbService.getQuotations();
    const winningQuote = quotes.find((q: any) => q.id === targetQuoteId);
    const amount = winningQuote ? winningQuote.grandTotal : 0;
    const isMultiStage = amount >= 50000;

    if (status === "Approved" && isMultiStage) {
      if (current.status === "Pending" || current.status?.toUpperCase() === "PENDING") {
        nextStatus = "Approved (Level 1 Passed)";
      } else if (current.status === "Approved (Level 1 Passed)") {
        nextStatus = "Approved";
        isFinalApproved = true;
      }
    } else {
      isFinalApproved = status === "Approved";
    }

    const updatedTimeline = [
      {
        status: status === "Rejected" ? "REJECTED" : nextStatus.toUpperCase().replace(/\s+/g, "_"),
        remark: remarks || `Contract review resolved by ${managerName}.`,
        user: managerName,
        date: new Date()
      }
    ];

    await dbService.updateApproval(id, {
      status: status === "Rejected" ? "Rejected" : nextStatus,
      managerRemarks: remarks,
      updatedBy: managerName,
      timeline: updatedTimeline
    });

    if (status === "Rejected") {
      pushNotification("Approval Denied", `Procurement transaction proposal rejected by manager ${managerName}.`, "error");
      await dbService.createActivity({
        type: "APPROVAL",
        description: `Contract signature request targetted ID ${id} rejected by ${managerName}.`,
        user: managerName,
        role: "MANAGER"
      });
    } else if (isFinalApproved) {
      pushNotification("Approval Granted!", `Procurement proposal approved. PO and legal Invoice generated.`, "success");
      await dbService.createActivity({
        type: "APPROVAL",
        description: `Final management seal awarded to signature request ${id} by ${managerName}.`,
        user: managerName,
        role: "MANAGER"
      });

      // Award the quotation automatically, create PO & Invoice items for state integrity
      if (winningQuote) {
        await dbService.updateQuotationStatus(winningQuote.id, "Accepted");

        // Reject other bids for the same RFQ
        for (const q of quotes) {
          if (q.rfqId === winningQuote.rfqId && q.id !== winningQuote.id) {
            await dbService.updateQuotationStatus(q.id, "Rejected");
          }
        }

        // Generate PO database record
        const poCount = (await dbService.getPurchaseOrders()).length;
        const poNumber = `PO-2026-00${poCount + 1}`;
        await dbService.createPurchaseOrder({
          id: `po-${Date.now()}`,
          poNumber,
          rfqId: winningQuote.rfqId,
          rfqTitle: winningQuote.rfqTitle || "IT Infrastructure",
          quotationId: winningQuote.id,
          vendorId: winningQuote.vendorId,
          vendorName: winningQuote.vendorName,
          items: (winningQuote.items || []).map((qi: any) => ({
            productName: qi.productName,
            quantity: qi.quantity,
            unit: "Units",
            unitPrice: qi.unitPrice,
            total: qi.totalPrice
          })),
          subTotal: winningQuote.subtotal,
          tax: winningQuote.tax,
          totalAmount: winningQuote.grandTotal,
          status: "Approved"
        });

        // Generate Invoice record
        const invCount = (await dbService.getInvoices()).length;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        await dbService.createInvoice({
          id: `inv-${Date.now()}`,
          invoiceNumber: `INV-2026-00${invCount + 1}`,
          poNumber,
          rfqId: winningQuote.rfqId,
          rfqTitle: winningQuote.rfqTitle || "IT Infrastructure",
          quotationId: winningQuote.id,
          vendorId: winningQuote.vendorId,
          vendorName: winningQuote.vendorName,
          items: (winningQuote.items || []).map((qi: any) => ({
            productName: qi.productName,
            quantity: qi.quantity,
            unit: "Units",
            price: qi.unitPrice,
            total: qi.totalPrice
          })),
          subtotal: winningQuote.subtotal,
          tax: winningQuote.tax,
          grandTotal: winningQuote.grandTotal,
          status: "Unpaid",
          dueDate
        });
      }
    } else {
      pushNotification("Level 1 Authorized", `Transaction cleared Level 1 benchmarks. Dual authorization is in-progress.`, "info");
    }

    res.json({ success: true, status: nextStatus });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Purchase Orders REST
app.get("/api/purchase-orders", async (req, res) => {
  const list = await dbService.getPurchaseOrders();
  res.json(list);
});

// Invoices REST APIs
app.get("/api/invoices", async (req, res) => {
  const list = await dbService.getInvoices();
  res.json(list);
});

app.put("/api/invoices/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await dbService.updateInvoiceStatus(id, status);

    const invoices = await dbService.getInvoices();
    const invoice = invoices.find((inv: any) => inv.id === id);
    const invoiceNo = invoice ? invoice.invoiceNumber : "invoice";

    await dbService.createActivity({
      type: "INVOICE",
      description: `Invoice "${invoiceNo}" collections progress updated to ${status.toUpperCase()}.`,
      user: "Sophia",
      role: "MANAGER"
    });

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Activities REST
app.get("/api/activities", async (req, res) => {
  const list = await dbService.getActivities();
  res.json(list);
});

// Notifications REST
app.get("/api/notifications", async (req, res) => {
  const list = await dbService.getNotifications();
  res.json(list);
});

app.post("/api/notifications/:id/read", async (req, res) => {
  try {
    const { id } = req.params;
    await dbService.markNotificationRead(id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/notifications/clear", async (req, res) => {
  try {
    await dbService.clearNotifications();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Original API route for AI Vendor recommendation with database logging history support
app.post("/api/ai/recommendation", async (req, res) => {
  console.log("[AI Rec API] POST request received at /api/ai/recommendation.");
  
  const calculateFallback = (rfq: any, sanitizedQuotes: any[], sanitizedVendors: any[]) => {
    console.log("[AI Rec API] Programmatically calculating 40/30/30 fallback metrics...");
    
    const prices = sanitizedQuotes.map(q => q.grandTotal);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceDiff = maxPrice - minPrice || 1;

    const timelines = sanitizedQuotes.map(q => q.deliveryTimeline);
    const minTimeline = Math.min(...timelines);
    const maxTimeline = Math.max(...timelines);
    const timelineDiff = maxTimeline - minTimeline || 1;

    const scoredQuotes = sanitizedQuotes.map((q: any) => {
      const vendor = sanitizedVendors.find((v: any) => v.id === q.vendorId);
      const rating = vendor ? vendor.rating : 4.0;

      const priceScoreNorm = ((maxPrice - q.grandTotal) / priceDiff) * 100;
      const speedScoreNorm = ((maxTimeline - q.deliveryTimeline) / timelineDiff) * 100;
      const ratingScoreNorm = (rating / 5.0) * 100;

      const totalScore = (priceScoreNorm * 0.40) + (speedScoreNorm * 0.30) + (ratingScoreNorm * 0.30);

      return {
        quote: q,
        totalScore,
        priceScoreNorm,
        speedScoreNorm,
        ratingScoreNorm,
        vendor
      };
    });

    scoredQuotes.sort((a, b) => b.totalScore - a.totalScore);
    const best = scoredQuotes[0] || {
      quote: sanitizedQuotes[0],
      totalScore: 90,
      priceScoreNorm: 90,
      speedScoreNorm: 90,
      ratingScoreNorm: 80,
      vendor: null
    };

    const ratingVal = best.vendor ? best.vendor.rating : 4.0;
    const finalScore = Math.max(10, Math.min(100, Math.round(best.totalScore)));
    const finalCost = Math.max(10, Math.min(100, Math.round(best.priceScoreNorm)));
    const finalSpeed = Math.max(10, Math.min(100, Math.round(best.speedScoreNorm)));
    const finalReliability = Math.max(10, Math.min(100, Math.round(best.ratingScoreNorm)));

    return {
      recommendedVendor: best.quote.vendorName,
      recommendedQuoteId: best.quote.id,
      confidenceScore: finalScore,
      costEfficiency: finalCost,
      costScore: finalCost,
      deliveryScore: finalSpeed,
      speedScore: finalSpeed,
      reliabilityScore: finalReliability,
      riskLevel: ratingVal >= 4.5 ? "Negligible Risk" : "Low Risk",
      reasoning: [
        `Awarded to **${best.quote.vendorName}** based on optimized 40/30/30 programmatic sourcing matrix evaluation.`,
        `Cost Score: ${finalCost}/100 on pricing total of $${best.quote.grandTotal.toLocaleString()} (weighted 40%).`,
        `Speed Score: ${finalSpeed}/100 with expected lead period of ${best.quote.deliveryTimeline} days (weighted 30%).`,
        `Fulfillment Trust: ${finalReliability}/100 with certified supplier KPI rating of ${ratingVal}★ (weighted 30%).`
      ],
      summary: `Programmatic fallback selection evaluates ${best.quote.vendorName} as the optimal supplier matching timing constraints with unit-rate savings.`,
      keyHighlight: `Optimized value ratio balancing price index with lead delivery turnaround.`,
      isFallBack: true
    };
  };

  try {
    const { rfq, quotes, vendors } = req.body;

    if (!rfq || !quotes || !Array.isArray(quotes) || quotes.length === 0) {
      return res.status(400).json({ error: "Missing required contract fields for AI review" });
    }

    const sanitizedQuotes = quotes.map((q: any) => ({
      id: q.id || `quote-${Math.random()}`,
      vendorName: q.vendorName || "Unknown Vendor",
      vendorId: q.vendorId || "",
      deliveryTimeline: Number(q.deliveryTimeline) || 7,
      grandTotal: Number(q.grandTotal) || 0,
      notes: q.notes || "No special SLA remarks.",
      items: Array.isArray(q.items) ? q.items : []
    }));

    const sanitizedVendors = Array.isArray(vendors) ? vendors.map((v: any) => ({
      id: v.id || "",
      companyName: v.companyName || "Unknown Company",
      rating: Number(v.rating) || 4.0,
      completedOrdersCount: Number(v.completedOrdersCount) || 0,
      averageDeliveryDays: Number(v.averageDeliveryDays) || 7
    })) : [];

    let finalPayload: any;

    const ai = getGeminiClient();
    if (!ai) {
      console.log("[AI Rec API] No validated Gemini API key. Initiating fallback algorithm.");
      finalPayload = calculateFallback(rfq, sanitizedQuotes, sanitizedVendors);
    } else {
      console.log("[AI Rec API] Invoking live Gemini model (gemini-3.5-flash) with structured schema...");
      
      const prompt = `You are the Lead Procurement AI Specialist at VendorBridge ERP. Analyze the following RFQ and submitted quotations to determine the best vendor partner.

RFQ:
- Title: ${rfq.title}
- Description: ${rfq.description}
- Items Requested: ${JSON.stringify(rfq.items)}

Submitted Vendor Quotations:
${sanitizedQuotes.map((q: any) => `
- Quote ID: ${q.id}
- Vendor: ${q.vendorName}
- Timeline: ${q.deliveryTimeline} days
- Grand Total Price (Tax Inc): $${q.grandTotal}
- Notes: ${q.notes}
- Unit prices: ${JSON.stringify(q.items)}
`).join("\n")}

Vendor SLA Profiles:
${JSON.stringify(sanitizedVendors)}

Analyze these bids thoroughly and select the single best vendor quotation partner. Focus on the best overall value balancing delivery speed, cost, and reliability.`;

      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            systemInstruction: "You are an expert procurement enterprise algorithm. Always choose the most balanced bid prioritizing vendor reliability and cost efficiency, and formulate your output strictly in JSON according to the schema.",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                recommendedVendor: { type: Type.STRING, description: "Name of the recommended vendor company (must match one of the submitted vendors exactly)" },
                recommendedQuoteId: { type: Type.STRING, description: "The ID of the quote matching the recommended vendor" },
                confidenceScore: { type: Type.INTEGER, description: "An overall confidence percentage score (0 to 100)" },
                costEfficiency: { type: Type.INTEGER, description: "A score representing the financial value/savings of this bid (0 to 100)" },
                deliveryScore: { type: Type.INTEGER, description: "A score representing the speed and delivery timeline (0 to 100)" },
                reliabilityScore: { type: Type.INTEGER, description: "A score representing the vendor rating and historical trustworthiness (0 to 100)" },
                riskLevel: { type: Type.STRING, description: "Level of projected operational risk: 'Negligible Risk', 'Low Risk', 'Moderate Risk', or 'High Risk'" },
                reasoning: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Array of bullet points reasoning why this partner represents the optimal choice."
                },
                summary: { type: Type.STRING, description: "A single sentence summarizing the recommendation decision." }
              },
              required: [
                "recommendedVendor",
                "recommendedQuoteId",
                "confidenceScore",
                "costEfficiency",
                "deliveryScore",
                "reliabilityScore",
                "riskLevel",
                "reasoning",
                "summary"
              ]
            }
          },
        });

        const text = response.text || "";
        let parsedResponse: any = {};
        try {
          parsedResponse = JSON.parse(text.trim());
        } catch (e) {
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsedResponse = JSON.parse(jsonMatch[0].trim());
          } else {
            throw new Error("Unable to parse clean JSON block from Gemini output.");
          }
        }

        let recommendedQuoteId = parsedResponse.recommendedQuoteId;
        if (!recommendedQuoteId) {
          const match = sanitizedQuotes.find(
            (q: any) => q.vendorName.toLowerCase().includes(parsedResponse.recommendedVendor?.toLowerCase() || "") ||
                        (parsedResponse.recommendedVendor?.toLowerCase() || "").includes(q.vendorName.toLowerCase())
          );
          recommendedQuoteId = match ? match.id : sanitizedQuotes[0]?.id;
        }

        finalPayload = {
          recommendedVendor: parsedResponse.recommendedVendor || sanitizedQuotes[0]?.vendorName,
          recommendedQuoteId: recommendedQuoteId,
          confidenceScore: Number(parsedResponse.confidenceScore) || 92,
          costEfficiency: Number(parsedResponse.costEfficiency) || 88,
          costScore: Number(parsedResponse.costEfficiency) || 88,
          deliveryScore: Number(parsedResponse.deliveryScore) || 90,
          speedScore: Number(parsedResponse.deliveryScore) || 90,
          reliabilityScore: Number(parsedResponse.reliabilityScore) || 95,
          riskLevel: parsedResponse.riskLevel || "Low Risk",
          reasoning: Array.isArray(parsedResponse.reasoning) ? parsedResponse.reasoning : [parsedResponse.reasoning || "Optimized cost balanced selection."],
          summary: parsedResponse.summary || "Vendor recommendation formulated successfully.",
          keyHighlight: parsedResponse.summary || "Optimal balance of cost index with fulfillment speed.",
          isFallBack: false
        };
      } catch (apiError) {
        console.error("[AI Rec API] Gemini live call failed. Initiating programmatic fallback model...", apiError);
        finalPayload = calculateFallback(rfq, sanitizedQuotes, sanitizedVendors);
      }
    }

    // Persist Sourcing Recommendation Log report directly into audit logger
    await dbService.createActivity({
      type: "RFQ",
      description: `AI recommended vendor "${finalPayload.recommendedVendor}" (Confidence score: ${finalPayload.confidenceScore}%) for Project: "${rfq.title}".`,
      user: "Lead Procurement AI Specialist",
      role: "PROCUREMENT"
    });

    return res.json(finalPayload);
  } catch (error: any) {
    console.error("[AI Rec API] Global evaluation error:", error);
    try {
      const { rfq, quotes, vendors } = req.body;
      const fallbackResult = calculateFallback(rfq, quotes || [], vendors || []);
      return res.json(fallbackResult);
    } catch (err) {
      res.status(500).json({ error: "Sourcing matrix evaluation failure: " + error.message });
    }
  }
});

// Setup sockets
io.on("connection", (socket) => {
  console.log(`[Socket.IO] Client connection established: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Vite dev server vs production static asset routing
async function startServer() {
  // Test connection to postgres before booting
  await testDatabaseConnection();

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`[VendorBridge ERP Full-Stack Web Server] Listening on http://localhost:${PORT}`);
  });
}

startServer();
