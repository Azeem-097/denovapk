/**
 * WhatsApp syntax parser + variable interpolator.
 * Used for both live preview and actual message generation.
 */

// Format WhatsApp markdown into HTML for the live preview
export function parseWhatsAppSyntaxToHTML(text: string): string {
  if (!text) return "";
  
  let html = text
    .replace(/</g, "&lt;").replace(/>/g, "&gt;") // Escape HTML
    .replace(/\n/g, "<br/>") // Newlines
    .replace(/\*(.*?)\*/g, "<strong>$1</strong>") // Bold
    .replace(/_(.*?)_/g, "<em>$1</em>") // Italic
    .replace(/~(.*?)~/g, "<del>$1</del>"); // Strike
    
  return html;
}

// Inject variables into a template string
export function renderTemplate(template: string, variables: Record<string, string | number>): string {
  if (!template) return "";
  let rendered = template;
  
  for (const [key, value] of Object.entries(variables)) {
    // Replace all instances of {{key}}
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    rendered = rendered.replace(regex, String(value));
  }
  
  return rendered;
}