import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { FadeIn } from "@/components/animations/FadeIn";
import { TextReveal } from "@/components/animations/TextReveal";
import { getSiteInfo } from "@/lib/siteInfo";

export const dynamic    = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Denova PK privacy policy — how we collect, use, and protect your data.",
};

interface Section {
  title:   string;
  content: string;
}

// Sections use {{email}} / {{phone}} / {{address}} / {{brand}} tokens
// which are replaced with live admin settings at render time.
const SECTIONS: Section[] = [
  {
    title: "Information We Collect",
    content: `When you use {{brand}}, we may collect the following information:

Personal Identification: Your name, email address, phone number, and delivery address when you create an account or place an order.

Payment Information: We collect payment details solely for processing transactions. We do not store credit/debit card numbers. All payment data is processed by our secure payment partners.

Usage Data: Information about how you interact with our website, including pages visited, time spent, products viewed, and device/browser information.

Cookies: We use cookies to maintain your session, remember your cart, and improve your browsing experience. You can disable cookies in your browser settings.`,
  },
  {
    title: "How We Use Your Information",
    content: `We use the information we collect to:

Process and fulfill your orders and send confirmation emails and SMS notifications.
Manage your account and provide customer support.
Personalize your shopping experience and show relevant products.
Send promotional emails and newsletters (only if you have opted in).
Improve our website, products, and services based on usage analytics.
Comply with legal obligations and prevent fraud.`,
  },
  {
    title: "Information Sharing",
    content: `We do not sell, trade, or rent your personal information to third parties. We may share your data with:

Delivery Partners: Courier services to fulfill your orders (name, address, phone number only).
Payment Processors: Secure payment gateways to process transactions.
Analytics Providers: Anonymized data for website performance analysis.
Legal Authorities: When required by law or to protect our legal rights.

All third-party partners are contractually bound to maintain the confidentiality of your data.`,
  },
  {
    title: "Data Security",
    content: `We implement industry-standard security measures to protect your personal information including SSL encryption, secure servers, and regular security audits. However, no method of transmission over the Internet is 100% secure. We encourage you to use a strong password and keep your login credentials confidential.`,
  },
  {
    title: "Your Rights",
    content: `You have the right to:

Access: Request a copy of the personal data we hold about you.
Correction: Ask us to correct inaccurate or incomplete information.
Deletion: Request deletion of your personal data from our systems.
Opt-out: Unsubscribe from marketing communications at any time.
Portability: Request your data in a portable format.

To exercise any of these rights, please contact us at {{email}}.`,
  },
  {
    title: "Cookies Policy",
    content: `We use the following types of cookies:

Essential Cookies: Required for the website to function (shopping cart, session management).
Analytics Cookies: Help us understand how visitors use our site (Google Analytics).
Marketing Cookies: Used to deliver relevant ads (only with your consent).

You can control cookie preferences through your browser settings or our cookie consent banner.`,
  },
  {
    title: "Children's Privacy",
    content: `Our website is not intended for children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us immediately.`,
  },
  {
    title: "Changes to This Policy",
    content: `We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a prominent notice on our website. Your continued use of our services after changes are posted constitutes your acceptance of the updated policy.`,
  },
  {
    title: "Contact Us",
    content: `If you have any questions about this Privacy Policy or how we handle your data, please contact us at:

Email: {{email}}
Phone: {{phone}}
Address: {{address}}`,
  },
];

function fillTokens(text: string, tokens: Record<string, string>): string {
  let out = text;
  for (const [key, val] of Object.entries(tokens)) {
    out = out.replaceAll(`{{${key}}}`, val);
  }
  return out;
}

export default async function PrivacyPage() {
  const info = await getSiteInfo();

  const tokens = {
    email:   info.email,
    phone:   info.phone,
    address: info.address,
    brand:   info.brandName,
  };

  return (
    <>
      <div className="pt-28 pb-10 sm:pt-32 sm:pb-14 bg-[#fafaf9] border-b border-[#e5e7eb]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <Breadcrumb
              items={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]}
              className="mb-4 justify-center"
            />
          </FadeIn>
          <FadeIn>
            <span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#3b5f8f]">
              Legal
            </span>
          </FadeIn>
          <TextReveal as="h1" delay={100}>
            <span className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1a1a] mt-2 block">
              Privacy Policy
            </span>
          </TextReveal>
          <FadeIn delay={200}>
            <p className="text-[#6b7280] text-sm mt-4">
              Last updated: {info.legalLastUpdated}
            </p>
          </FadeIn>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <FadeIn>
          <p className="text-sm text-[#6b7280] leading-relaxed mb-10 p-5 bg-[#fafaf9] border border-[#e5e7eb]">
            At {info.brandName}, your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase. Please read this policy carefully.
          </p>
        </FadeIn>

        <div className="space-y-8">
          {SECTIONS.map((section, i) => (
            <FadeIn key={section.title} delay={i * 40}>
              <div className="border-b border-[#e5e7eb] pb-8 last:border-b-0">
                <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-[#1a1a1a] mb-3">
                  {i + 1}. {section.title}
                </h2>
                <div className="text-sm text-[#6b7280] leading-relaxed whitespace-pre-line">
                  {fillTokens(section.content, tokens)}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </>
  );
}