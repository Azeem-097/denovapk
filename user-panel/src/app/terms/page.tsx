import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { FadeIn } from "@/components/animations/FadeIn";
import { TextReveal } from "@/components/animations/TextReveal";
import { getSiteInfo } from "@/lib/siteInfo";

export const dynamic    = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Denova PK terms of service and conditions of use.",
};

interface Section {
  title:   string;
  content: string;
}

const SECTIONS: Section[] = [
  {
    title: "Acceptance of Terms",
    content: "By accessing and using the {{brand}} website, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our website or services.",
  },
  {
    title: "Use of the Website",
    content: `You agree to use this website only for lawful purposes. You must not:

Use the site in any way that violates applicable local, national, or international laws or regulations.
Transmit any unsolicited or unauthorized advertising or promotional material.
Attempt to gain unauthorized access to any part of the website or its servers.
Engage in any conduct that restricts or inhibits anyone's use or enjoyment of the website.`,
  },
  {
    title: "Product Information",
    content: "We make every effort to display products and their colors accurately. However, actual colors may vary slightly due to monitor settings. Product descriptions and prices are subject to change without notice. We reserve the right to discontinue any product at any time.",
  },
  {
    title: "Pricing & Payment",
    content: "All prices are listed in Pakistani Rupees (PKR) and are inclusive of applicable taxes. We reserve the right to change prices at any time. In case of a pricing error, we will notify you and give you the option to proceed at the correct price or cancel your order.",
  },
  {
    title: "Order Acceptance",
    content: "Placing an order does not constitute a contract until we confirm acceptance via email. We reserve the right to refuse or cancel any order at our discretion, including orders where product information or pricing errors have occurred.",
  },
  {
    title: "Intellectual Property",
    content: "All content on this website — including text, graphics, logos, images, and software — is the property of {{brand}} and is protected by Pakistani and international copyright laws. You may not reproduce, distribute, or create derivative works without our express written permission.",
  },
  {
    title: "User Accounts",
    content: "You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account. We are not liable for any loss resulting from unauthorized use of your account.",
  },
  {
    title: "Limitation of Liability",
    content: "To the fullest extent permitted by law, {{brand}} shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services or products.",
  },
  {
    title: "Governing Law",
    content: "These Terms of Service are governed by the laws of the Islamic Republic of Pakistan. Any disputes shall be subject to the exclusive jurisdiction of the courts of Lahore, Punjab, Pakistan.",
  },
  {
    title: "Changes to Terms",
    content: "We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting. Your continued use of the website after changes are posted constitutes your acceptance.",
  },
  {
    title: "Contact",
    content: "For questions regarding these terms, contact us at {{email}} or {{phone}}.",
  },
];

function fillTokens(text: string, tokens: Record<string, string>): string {
  let out = text;
  for (const [key, val] of Object.entries(tokens)) {
    out = out.replaceAll(`{{${key}}}`, val);
  }
  return out;
}

export default async function TermsPage() {
  const info = await getSiteInfo();

  const tokens = {
    email:   info.email,
    phone:   info.phone,
    brand:   info.brandName,
  };

  return (
    <>
      <div className="pt-28 pb-10 sm:pt-32 sm:pb-14 bg-[#fafaf9] border-b border-[#e5e7eb]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <Breadcrumb
              items={[{ label: "Home", href: "/" }, { label: "Terms of Service" }]}
              className="mb-4 justify-center"
            />
          </FadeIn>
          <FadeIn>
            <span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#c9a96e]">
              Legal
            </span>
          </FadeIn>
          <TextReveal as="h1" delay={100}>
            <span className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1a1a] mt-2 block">
              Terms of Service
            </span>
          </TextReveal>
          <FadeIn delay={200}>
            <p className="text-[#6b7280] text-sm mt-4">
              Last updated: {info.legalLastUpdated}
            </p>
          </FadeIn>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 space-y-8">
        {SECTIONS.map((section, i) => (
          <FadeIn key={section.title} delay={i * 40}>
            <div className="border-b border-[#e5e7eb] pb-8 last:border-b-0">
              <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-[#1a1a1a] mb-3">
                {i + 1}. {section.title}
              </h2>
              <p className="text-sm text-[#6b7280] leading-relaxed whitespace-pre-line">
                {fillTokens(section.content, tokens)}
              </p>
            </div>
          </FadeIn>
        ))}
      </div>
    </>
  );
}