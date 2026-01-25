/**
 * AI Chatbot Service
 * Task: 1.4.1 - AI Chatbot (Claude Integration)
 */

import Anthropic from "@anthropic-ai/sdk";
import { connectDB } from "~/lib/db/connection.server";
import {
  ChatSession,
  ChatMessage,
  FAQ,
  type IChatMessage,
} from "~/lib/db/models/chat.server";
import { Contact } from "~/lib/db/models/contact.server";
import { News } from "~/lib/db/models/news.server";

// Check if API key is configured
const hasApiKey = !!process.env.ANTHROPIC_API_KEY;

// Initialize Anthropic client (only if API key exists)
const anthropic = hasApiKey
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

// Comprehensive system prompt with company knowledge
const SYSTEM_PROMPT = `You are ARL Assistant, the helpful AI assistant for Adamus Resources Limited (ARL), a gold mining company in Ghana. You help employees find information quickly and answer their questions about the company.

## About Adamus Resources Limited (ARL)
- Gold mining company located in Nzema area, Western Region, Ghana
- Part of the Nguvu Mining group
- Approximately 280km west of Accra, nearest town is Takoradi
- Focus: Safety excellence, environmental stewardship, community development
- Operations: Open-pit gold mining and processing

## Key Departments & Extensions
- Emergency Hotline: Extension 999 (or radio Channel 1)
- Security Control Room: Extension 333
- Site Clinic (Medical): Extension 444 (24/7 for emergencies)
- Safety Department: Extension 555
- IT Help Desk: Extension 100
- HR Department: Extension 200
- HR Manager: Extension 201
- Payroll: Extension 202
- Training: Extension 203
- Admin/Reception: Extension 111
- Transport Office: Extension 150

## Working Hours
- Office staff: 7:30 AM - 4:30 PM (Mon-Fri)
- Operations Day shift: 6:00 AM - 6:00 PM
- Operations Night shift: 6:00 PM - 6:00 AM
- Canteen: Breakfast 5:30-7:30 AM, Lunch 11:30 AM-1:30 PM, Dinner 5:30-7:30 PM
- Clinic: 24/7 emergencies, routine 7:30 AM - 4:30 PM

## Important Information
- Payday: 25th of each month
- Site speed limit: 40 km/h (20 km/h near buildings)
- Assembly Points: A (Main Gate), B (Processing Plant), C (Workshop), D (Magazine gate)

## Safety Golden Rules (violations = dismissal)
1. No alcohol/drugs at work
2. Always wear PPE
3. Never bypass safety devices
4. Follow LOTO procedures
5. No unauthorized entry to restricted areas
6. Use fall protection at heights
7. Follow driving rules
8. Report all incidents

## PPE Requirements
Minimum: Hard hat, steel-toe boots, high-vis vest, safety glasses
Processing Plant: Add ear protection, dust mask
Pit area: Full PPE plus radio

## Your Capabilities
- Answer questions about company policies, procedures, safety
- Provide contact information and extension numbers
- Give directions to facilities (canteen, clinic, gym, prayer room)
- Explain HR processes (leave, payroll, benefits)
- Help with IT queries (password reset, email, WiFi)
- Share safety procedures and emergency information
- Direct users to appropriate departments

## Response Guidelines
- Be helpful, professional, and concise
- Use the context provided from the company database when available
- For emergencies, always emphasize calling Extension 999 immediately
- If unsure, recommend contacting the specific department
- Keep responses focused and practical
- Use bullet points for lists
- Include relevant extension numbers when applicable
- Greet users warmly but briefly

## Important Notes
- You are an AI assistant, not a human
- For sensitive HR matters, always recommend speaking with HR directly
- For medical emergencies, emphasize calling the clinic (444) or emergency (999)
- Don't make up specific names or details not provided in context
- If asked about specific people, suggest checking the Directory on the intranet`;

// Rate limiting
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_MESSAGES_PER_WINDOW = 10;
const sessionMessageCounts = new Map<string, { count: number; resetAt: number }>();

export function checkChatRateLimit(sessionId: string): boolean {
  const now = Date.now();
  const record = sessionMessageCounts.get(sessionId);

  if (!record || now > record.resetAt) {
    sessionMessageCounts.set(sessionId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= MAX_MESSAGES_PER_WINDOW) {
    return false;
  }

  record.count++;
  return true;
}

// Create or get session
export async function getOrCreateSession(sessionId: string): Promise<string> {
  await connectDB();

  let session = await ChatSession.findOne({ sessionId });

  if (!session) {
    session = await ChatSession.create({ sessionId });
  } else {
    session.lastActivity = new Date();
    await session.save();
  }

  return session._id.toString();
}

// Get chat history for a session
export async function getChatHistory(
  sessionId: string,
  limit: number = 20
): Promise<IChatMessage[]> {
  await connectDB();

  const session = await ChatSession.findOne({ sessionId });
  if (!session) return [];

  return ChatMessage.find({ session: session._id })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

// Search for relevant context from database
async function getRelevantContext(query: string): Promise<string> {
  await connectDB();

  const contextParts: string[] = [];
  const queryLower = query.toLowerCase();

  // Search FAQs - always search for potential matches
  try {
    const faqs = await FAQ.find(
      { $text: { $search: query }, isActive: true },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(3)
      .lean();

    if (faqs.length > 0) {
      contextParts.push("## Relevant Information from Knowledge Base:");
      faqs.forEach((faq) => {
        contextParts.push(`Q: ${faq.question}\nA: ${faq.answer}\n`);
      });
    }
  } catch (e) {
    // Text index might not exist, try regex search as fallback
    const faqs = await FAQ.find({
      isActive: true,
      $or: [
        { question: { $regex: query.split(' ')[0], $options: 'i' } },
        { keywords: { $in: query.toLowerCase().split(' ') } }
      ]
    })
      .limit(3)
      .lean();

    if (faqs.length > 0) {
      contextParts.push("## Relevant Information from Knowledge Base:");
      faqs.forEach((faq) => {
        contextParts.push(`Q: ${faq.question}\nA: ${faq.answer}\n`);
      });
    }
  }

  // Search contacts if query seems to be about finding someone
  const contactKeywords = ["contact", "phone", "email", "reach", "find", "who is", "number", "extension", "call", "manager", "director", "supervisor"];
  if (contactKeywords.some((kw) => queryLower.includes(kw))) {
    try {
      const contacts = await Contact.find(
        { $text: { $search: query } },
        { score: { $meta: "textScore" } }
      )
        .sort({ score: { $meta: "textScore" } })
        .limit(5)
        .lean();

      if (contacts.length > 0) {
        contextParts.push("\n## Contacts from Directory:");
        contacts.forEach((contact) => {
          const parts = [`${contact.fullName}`];
          if (contact.position) parts.push(`Position: ${contact.position}`);
          if (contact.department) parts.push(`Department: ${contact.department}`);
          if (contact.phone) parts.push(`Phone: ${contact.phone}`);
          if (contact.email) parts.push(`Email: ${contact.email}`);
          contextParts.push(`- ${parts.join(', ')}`);
        });
      }
    } catch (e) {
      // Fallback search
      const searchTerms = query.split(' ').filter(t => t.length > 2);
      if (searchTerms.length > 0) {
        const contacts = await Contact.find({
          $or: searchTerms.map(term => ({
            $or: [
              { name: { $regex: term, $options: 'i' } },
              { position: { $regex: term, $options: 'i' } },
              { department: { $regex: term, $options: 'i' } }
            ]
          }))
        })
          .limit(5)
          .lean();

        if (contacts.length > 0) {
          contextParts.push("\n## Contacts from Directory:");
          contacts.forEach((contact) => {
            const parts = [`${contact.fullName}`];
            if (contact.position) parts.push(`Position: ${contact.position}`);
            if (contact.department) parts.push(`Department: ${contact.department}`);
            if (contact.phone) parts.push(`Phone: ${contact.phone}`);
            if (contact.email) parts.push(`Email: ${contact.email}`);
            contextParts.push(`- ${parts.join(', ')}`);
          });
        }
      }
    }
  }

  // Search recent news if query seems news-related
  const newsKeywords = ["news", "announcement", "update", "recent", "latest", "what's new", "happening"];
  if (newsKeywords.some((kw) => queryLower.includes(kw))) {
    const news = await News.find({ status: "published" })
      .sort({ publishedAt: -1 })
      .limit(5)
      .select("title excerpt publishedAt")
      .lean();

    if (news.length > 0) {
      contextParts.push("\n## Recent Company News:");
      news.forEach((item) => {
        const date = item.publishedAt
          ? new Date(item.publishedAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })
          : 'Recent';
        contextParts.push(`- ${item.title} (${date})`);
        if (item.excerpt) contextParts.push(`  ${item.excerpt.substring(0, 100)}...`);
      });
    }
  }

  return contextParts.join("\n");
}

// Fallback response when no API key - search FAQs directly
async function getFallbackResponse(query: string): Promise<string> {
  await connectDB();
  const queryLower = query.toLowerCase();

  // Try to find matching FAQ
  try {
    // First try text search
    const faqs = await FAQ.find(
      { $text: { $search: query }, isActive: true },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(1)
      .lean();

    if (faqs.length > 0) {
      return faqs[0].answer;
    }
  } catch (e) {
    // Text index might not exist
  }

  // Fallback: keyword matching
  const keywords = queryLower.split(' ').filter(w => w.length > 2);

  for (const keyword of keywords) {
    const faq = await FAQ.findOne({
      isActive: true,
      keywords: { $in: [keyword] }
    }).lean();

    if (faq) {
      return faq.answer;
    }
  }

  // Check for specific common queries
  if (queryLower.includes('emergency') || queryLower.includes('urgent')) {
    return "For ANY emergency, call Extension 999 immediately (or radio Channel 1). For medical emergencies, contact the Site Clinic at Extension 444. Security Control Room is at Extension 333. Remember: STOP work, SECURE the area, CALL for help, and REPORT to your supervisor.";
  }

  if (queryLower.includes('hr') || queryLower.includes('human resource')) {
    return "HR Department contacts: Main HR Office - Extension 200, HR Manager - Extension 201, Payroll queries - Extension 202, Training & Development - Extension 203. The HR office is located in the Admin Building, Ground Floor. Office hours: 7:30 AM - 4:30 PM weekdays.";
  }

  if (queryLower.includes('it') || queryLower.includes('computer') || queryLower.includes('password')) {
    return "For IT support, contact the IT Help Desk at Extension 100 or email ithelp@adamusresources.com. The IT office is in the Admin Building, 1st Floor. Support hours: 7:00 AM - 5:00 PM. For password resets, have your employee ID ready.";
  }

  if (queryLower.includes('canteen') || queryLower.includes('food') || queryLower.includes('lunch')) {
    return "Canteen operating hours: Breakfast 5:30-7:30 AM, Lunch 11:30 AM-1:30 PM, Dinner 5:30-7:30 PM, Night shift meal 12:00-1:00 AM. Menus rotate weekly and are posted on the intranet. Special dietary requirements can be accommodated - speak to the canteen manager.";
  }

  if (queryLower.includes('clinic') || queryLower.includes('medical') || queryLower.includes('doctor') || queryLower.includes('sick')) {
    return "The Site Clinic is located next to the Admin Building. It operates 24/7 for emergencies, with routine consultations from 7:30 AM - 4:30 PM. For emergencies, call Extension 444 or radio 'Medical Emergency'. Services include first aid, basic medical care, and occupational health.";
  }

  if (queryLower.includes('leave') || queryLower.includes('vacation') || queryLower.includes('time off')) {
    return "To apply for leave: 1) Check your leave balance on HR portal, 2) Complete Leave Application Form, 3) Submit to supervisor at least 2 weeks in advance, 4) After approval, submit to HR. For emergency leave, contact HR immediately at Extension 200.";
  }

  if (queryLower.includes('pay') || queryLower.includes('salary') || queryLower.includes('wage')) {
    return "Salaries are paid on the 25th of each month. If the 25th falls on a weekend or holiday, payment is made on the last working day before. Payslips are available on the HR portal from the 23rd. For payroll queries, contact Extension 202.";
  }

  // Default fallback
  return "I can help you with information about ARL including: emergency contacts, HR queries, IT support, facilities (canteen, clinic, gym), safety procedures, and company policies. For specific questions, please try asking about a particular topic, or contact the relevant department directly:\n\n- Emergency: Extension 999\n- HR: Extension 200\n- IT Help Desk: Extension 100\n- Safety: Extension 555\n- Clinic: Extension 444";
}

// Send message and get response
export async function sendMessage(
  sessionId: string,
  userMessage: string
): Promise<{ response: string; error?: string }> {
  await connectDB();

  // Rate limit check
  if (!checkChatRateLimit(sessionId)) {
    return {
      response: "",
      error: "You're sending messages too quickly. Please wait a moment.",
    };
  }

  // Get or create session
  const session = await ChatSession.findOne({ sessionId });
  if (!session) {
    return { response: "", error: "Session not found" };
  }

  // Save user message
  await ChatMessage.create({
    session: session._id,
    role: "user",
    content: userMessage,
  });

  // If no API key, use fallback response system
  if (!anthropic) {
    const fallbackResponse = await getFallbackResponse(userMessage);

    // Save assistant response
    await ChatMessage.create({
      session: session._id,
      role: "assistant",
      content: fallbackResponse,
    });

    session.messageCount += 2;
    session.lastActivity = new Date();
    await session.save();

    return { response: fallbackResponse };
  }

  // Get conversation history
  const history = await ChatMessage.find({ session: session._id })
    .sort({ createdAt: 1 })
    .limit(20)
    .lean();

  // Get relevant context
  const context = await getRelevantContext(userMessage);

  // Build messages array for Claude
  const messages: { role: "user" | "assistant"; content: string }[] = history.map((msg) => ({
    role: msg.role as "user" | "assistant",
    content: msg.content,
  }));

  // Add context to the latest user message if available
  if (context) {
    const lastIndex = messages.length - 1;
    messages[lastIndex].content = `${userMessage}\n\n[Context from company database:\n${context}]`;
  }

  try {
    // Call Claude API
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages,
    });

    const assistantMessage =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Save assistant response
    await ChatMessage.create({
      session: session._id,
      role: "assistant",
      content: assistantMessage,
    });

    // Update session
    session.messageCount += 2;
    session.lastActivity = new Date();
    await session.save();

    return { response: assistantMessage };
  } catch (error: any) {
    console.error("Claude API error:", error);

    // Use fallback response on API error
    const fallbackResponse = await getFallbackResponse(userMessage);

    // Save fallback response
    await ChatMessage.create({
      session: session._id,
      role: "assistant",
      content: fallbackResponse,
    });

    session.messageCount += 2;
    session.lastActivity = new Date();
    await session.save();

    return { response: fallbackResponse };
  }
}

// Clear session
export async function clearSession(sessionId: string): Promise<void> {
  await connectDB();

  const session = await ChatSession.findOne({ sessionId });
  if (session) {
    await ChatMessage.deleteMany({ session: session._id });
    session.messageCount = 0;
    await session.save();
  }
}

// FAQ management functions
export async function getFAQs(category?: string): Promise<any[]> {
  await connectDB();

  const query: Record<string, unknown> = { isActive: true };
  if (category) query.category = category;

  return FAQ.find(query).sort({ category: 1, order: 1 }).lean();
}

export async function getFAQCategories(): Promise<string[]> {
  await connectDB();
  return FAQ.distinct("category", { isActive: true });
}

export async function createFAQ(data: {
  question: string;
  answer: string;
  category: string;
  keywords?: string[];
}): Promise<any> {
  await connectDB();
  return FAQ.create(data);
}

export async function updateFAQ(
  id: string,
  data: Partial<{
    question: string;
    answer: string;
    category: string;
    keywords: string[];
    isActive: boolean;
    order: number;
  }>
): Promise<any> {
  await connectDB();
  return FAQ.findByIdAndUpdate(id, data, { new: true }).lean();
}

export async function deleteFAQ(id: string): Promise<boolean> {
  await connectDB();
  const result = await FAQ.findByIdAndDelete(id);
  return !!result;
}
