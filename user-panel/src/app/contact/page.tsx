"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, MessageCircle } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Input, Textarea } from "@/components/ui/Input";
import { FadeIn } from "@/components/animations/FadeIn";
import { TextReveal } from "@/components/animations/TextReveal";
import { SlideUp } from "@/components/animations/SlideUp";
import { contactSchema, type ContactFormData } from "@/lib/validations";
import { useToastStore } from "@/store/toastStore";
import { trackMetaEvent } from "@/lib/metaPixel";

type BusinessHour = { day: string; time: string };

interface SiteInfo {
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  businessHours: BusinessHour[];
  storeLocationEnabled: boolean;
  storeLatitude: string;
  storeLongitude: string;
  mapEmbedUrl: string;
}

const EMPTY_INFO: SiteInfo = {
  email: "",
  phone: "",
  whatsapp: "",
  address: "",
  businessHours: [],
  storeLocationEnabled: false,
  storeLatitude: "",
  storeLongitude: "",
  mapEmbedUrl: "",
};

function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, "");
}

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [info, setInfo] = useState<SiteInfo>(EMPTY_INFO);
  const showToast = useToastStore((s) => s.addToast);

  // Fetch site info once on mount
  useEffect(() => {
    fetch("/api/site-info")
      .then((r) => {
        if (!r.ok) throw new Error("Site information is unavailable.");
        return r.json();
      })
      .then((d) => {
        if (d) {
          setInfo({
            email: d.email || "",
            phone: d.phone || "",
            whatsapp: d.whatsapp || "",
            address: d.address || "",
            businessHours: Array.isArray(d.businessHours) ? d.businessHours : [],
            storeLocationEnabled: d.storeLocationEnabled === true,
            storeLatitude: d.storeLatitude || "",
            storeLongitude: d.storeLongitude || "",
            mapEmbedUrl: d.mapEmbedUrl || "",
          });
        }
      })
      .catch((err) => {
        console.error("Contact page failed to load site info:", err);
        showToast({ type: "error", message: "Contact details are temporarily unavailable." });
      });
  }, [showToast]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const payload = await res.json().catch(() => null);

    if (!res.ok) {
      showToast({
        type: "error",
        message: payload?.error ?? "We could not send your message. Please try again.",
      });
      return;
    }

    setSubmitted(true);
    reset();
    trackMetaEvent("Lead");
    showToast({ type: "success", message: "Message sent successfully!" });
    setTimeout(() => setSubmitted(false), 5000);
  };

  const waNumber = normalizePhone(info.whatsapp);
  const hasMap = info.storeLocationEnabled && (info.mapEmbedUrl || (info.storeLatitude && info.storeLongitude));
  const mapUrl = info.mapEmbedUrl || (
    info.storeLatitude && info.storeLongitude
      ? `https://www.openstreetmap.org/export/embed.html?mlat=${encodeURIComponent(info.storeLatitude)}&mlon=${encodeURIComponent(info.storeLongitude)}&zoom=15&layer=mapnik`
      : ""
  );

  const CONTACT_INFO = [
    { icon: Phone,         label: "Phone",    value: info.phone || "Unavailable",       href: info.phone ? `tel:${normalizePhone(info.phone)}` : null },
    { icon: Mail,          label: "Email",    value: info.email || "Unavailable",       href: info.email ? `mailto:${info.email}` : null },
    { icon: MessageCircle, label: "WhatsApp", value: info.whatsapp || "Unavailable",    href: waNumber ? `https://wa.me/${waNumber}` : null },
    { icon: MapPin,        label: "Address",  value: info.address || "Unavailable",     href: null },
  ];

  return (
    <>
      {/* Header */}
      <div className="pt-28 pb-10 sm:pt-32 sm:pb-14 bg-[#fafaf9] border-b border-[#e5e7eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <Breadcrumb
              items={[{ label: "Home", href: "/" }, { label: "Contact" }]}
              className="mb-4"
            />
          </FadeIn>
          <FadeIn>
            <span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#F97316]">
              Get in Touch
            </span>
          </FadeIn>
          <TextReveal as="h1" delay={100}>
            <span className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a1a1a] mt-2 block">
              We&apos;d Love to Hear from You
            </span>
          </TextReveal>
          <FadeIn delay={200}>
            <p className="text-[#6b7280] text-sm sm:text-base max-w-xl mt-3 leading-relaxed">
              Have a question, feedback, or just want to say hello? Our team is here to help.
            </p>
          </FadeIn>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 lg:gap-12">

          {/* Form */}
          <FadeIn>
            <div className="bg-white border border-[#e5e7eb] p-6 sm:p-8 lg:p-10">

              <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#1a1a1a] mb-2">
                Send Us a Message
              </h2>
              <p className="text-sm text-[#6b7280] mb-6">
                Fill out the form below and we&apos;ll get back to you within 24 hours.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  aria-hidden="true"
                  {...register("company")}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Full Name" required placeholder="John Doe"
                    {...register("name")} error={errors.name?.message} />
                  <Input label="Email Address" required type="email" placeholder="you@example.com"
                    {...register("email")} error={errors.email?.message} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Phone (optional)" type="tel" placeholder="+92 300 1234567"
                    {...register("phone")} error={errors.phone?.message} />
                  <Input label="Subject" required placeholder="Order inquiry"
                    {...register("subject")} error={errors.subject?.message} />
                </div>

                <Textarea label="Message" required rows={6}
                  placeholder="Tell us how we can help..."
                  {...register("message")} error={errors.message?.message} />

                <button type="submit" disabled={isSubmitting || submitted}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#1a1a1a] text-white px-8 py-3.5 text-sm font-semibold tracking-wide hover:bg-[#F97316] transition-colors disabled:opacity-60">
                  {isSubmitting ? (
                    <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Sending...</>
                  ) : submitted ? (
                    <><CheckCircle size={16} />Message Sent!</>
                  ) : (
                    <><Send size={15} />Send Message</>
                  )}
                </button>
              </form>
            </div>
          </FadeIn>

          {/* Sidebar */}
          <div className="space-y-6">

            <SlideUp>
              <div className="bg-[#1a1a1a] text-white p-6 sm:p-8">
                <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-[#F97316] mb-5">
                  Contact Info
                </h3>
                <div className="space-y-4">
                  {CONTACT_INFO.map((item) => (
                    <div key={item.label} className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                        <item.icon size={15} className="text-[#F97316]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] uppercase tracking-wider text-white/50 mb-0.5">
                          {item.label}
                        </p>
                        {item.href ? (
                          <a
                            href={item.href}
                            target={item.href.startsWith("http") ? "_blank" : undefined}
                            rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                            onClick={() => trackMetaEvent("Contact")}
                            className="text-sm text-white hover:text-[#F97316] transition-colors break-words"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-sm text-white break-words">{item.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </SlideUp>

            <SlideUp stagger={100} index={1}>
              <div className="bg-white border border-[#e5e7eb] p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-5">
                  <Clock size={16} className="text-[#F97316]" />
                  <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-[#1a1a1a]">
                    Business Hours
                  </h3>
                </div>
                <div className="space-y-2.5">
                  {info.businessHours.length > 0 ? info.businessHours.map((h) => (
                    <div key={h.day} className="flex items-center justify-between text-sm">
                      <span className="text-[#6b7280]">{h.day}</span>
                      <span className="text-[#1a1a1a] font-medium">{h.time}</span>
                    </div>
                  )) : (
                    <p className="text-sm text-[#6b7280]">Business hours are currently unavailable.</p>
                  )}
                </div>
              </div>
            </SlideUp>

            {hasMap && (
            <SlideUp stagger={100} index={2}>
              <div className="bg-white border border-[#e5e7eb] overflow-hidden">
                <div className="relative aspect-[4/3] bg-[#fafaf9]">
                  <iframe
                    src={mapUrl}
                    className="absolute inset-0 w-full h-full border-0"
                    loading="lazy"
                    title={`${info.address} location`}
                  />
                </div>
                <div className="p-4">
                  <p className="text-xs font-semibold text-[#1a1a1a]">
                    Visit Our Flagship Store
                  </p>
                  <p className="text-xs text-[#6b7280] mt-1">
                    {info.address}
                  </p>
                </div>
              </div>
            </SlideUp>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
