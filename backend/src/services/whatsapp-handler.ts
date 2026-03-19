import { Request, Response } from "express";
import { supabase } from "../lib/supabase";

const URGENT_KEYWORDS = [
  "urgent",
  "problem",
  "issue",
  "delay",
  "violation",
  "dob",
  "stop work",
  "emergency",
  "danger",
  "accident",
  "injury",
  "fire",
  "flood",
  "collapse",
];

// Site managers whose messages always get stored
const SITE_MANAGER_PHONES = (process.env.SITE_MANAGER_PHONES || "")
  .split(",")
  .filter(Boolean);

function isUrgent(text: string): boolean {
  const lower = text.toLowerCase();
  return URGENT_KEYWORDS.some((kw) => lower.includes(kw));
}

function isSiteManager(phone: string): boolean {
  return SITE_MANAGER_PHONES.includes(phone);
}

async function matchProjectByKeywords(
  text: string
): Promise<{ id: string; address: string } | null> {
  const { data: projects } = await supabase
    .from("projects")
    .select("id, address");

  if (!projects) return null;

  const lower = text.toLowerCase();
  return (
    projects.find((p) => {
      const addressPart = p.address.split(",")[0].toLowerCase().trim();
      return lower.includes(addressPart);
    }) || null
  );
}

export async function handleWhatsAppWebhook(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const message = req.body;

    // Twilio-style payload
    const senderPhone = message.From || message.from || "";
    const senderName = message.ProfileName || message.senderName || "Unknown";
    const messageText = message.Body || message.text || "";
    const hasMedia = !!(message.NumMedia && parseInt(message.NumMedia) > 0);
    const mediaUrl = message.MediaUrl0 || message.mediaUrl || null;

    const urgent = isUrgent(messageText);
    const fromManager = isSiteManager(senderPhone);

    // Only store urgent messages or messages from site managers
    if (!urgent && !fromManager) {
      res.status(200).json({ status: "ignored" });
      return;
    }

    const project = await matchProjectByKeywords(messageText);

    // Store the message
    await supabase.from("whatsapp_messages").insert({
      project_id: project?.id || null,
      sender_name: senderName,
      sender_phone: senderPhone,
      message_text: messageText,
      has_media: hasMedia,
      media_url: mediaUrl,
      is_urgent: urgent,
    });

    // Create alert for urgent messages
    if (urgent) {
      await supabase.from("alerts").insert({
        project_id: project?.id || null,
        type: "critical",
        source: "whatsapp",
        title: `Urgent WhatsApp: ${senderName}`,
        description: messageText.substring(0, 500),
      });
    }

    // Log activity
    await supabase.from("activity_log").insert({
      project_id: project?.id || null,
      user_name: senderName,
      action: `WhatsApp: "${messageText.substring(0, 100)}${messageText.length > 100 ? "..." : ""}"`,
      source: "whatsapp",
    });

    res.status(200).json({ status: "stored", urgent });
  } catch (err) {
    console.error("[WhatsApp] Error handling webhook:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
