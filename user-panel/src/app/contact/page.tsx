"use client";
import { useState } from "react";
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

const CONTACT_INFO = [
  { icon: Phone, label: "Phone", value: "+92 300 123 4567", href: "tel:+923001234567" },
  { icon: Mail,  label: "Email", value: "hello@denovapk.com", href: "mailto:hello@denovapk.com" },
  { icon: MessageCircle, label: "WhatsApp", value: "+92 300 123 4567", href: "https://wa.me/923001234567" },
  { icon: MapPin, label: "Address", value: "Gulberg III, Lahore, Pakistan", href: null },
];

const HOURS = [
  { day: "Monday – Friday", time: "10:00 AM — 8:00 PM" },
  { day: "Saturday",        time: "11:00 AM — 6:00 PM" },
  { day: "Sunday",          time: "Closed" },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const showToast = useToastStore((s) => s.addToast);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    void data; // API call here
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitted(true);
    reset();
    showToast({ type: "success", message: "Message sent successfully!" });
    setTimeout(() => setSubmitted(false), 5000);
  };

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
            <span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#c9a96e]">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    required
                    placeholder="John Doe"
                    {...register("name")}
                    error={errors.name?.message}
                  />
                  <Input
                    label="Email Address"
                    required
                    type="email"
                    placeholder="you@example.com"
                    {...register("email")}
                    error={errors.email?.message}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Phone (optional)"
                    type="tel"
                    placeholder="+92 300 1234567"
                    {...register("phone")}
                    error={errors.phone?.message}
                  />
                  <Input
                    label="Subject"
                    required
                    placeholder="Order inquiry"
                    {...register("subject")}
                    error={errors.subject?.message}
                  />
                </div>

                <Textarea
                  label="Message"
                  required
                  rows={6}
                  placeholder="Tell us how we can help..."
                  {...register("message")}
                  error={errors.message?.message}
                />

                <button
                  type="submit"
                  disabled={isSubmitting || submitted}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#1a1a1a] text-white px-8 py-3.5 text-sm font-semibold tracking-wide hover:bg-[#c9a96e] transition-colors disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : submitted ? (
                    <>
                      <CheckCircle size={16} />
                      Message Sent!
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </FadeIn>

          {/* Sidebar: Contact info */}
          <div className="space-y-6">

            {/* Contact info card */}
            <SlideUp>
              <div className="bg-[#1a1a1a] text-white p-6 sm:p-8">
                <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-[#c9a96e] mb-5">
                  Contact Info
                </h3>
                <div className="space-y-4">
                  {CONTACT_INFO.map((info) => (
                    <div key={info.label} className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                        <info.icon size={15} className="text-[#c9a96e]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] uppercase tracking-wider text-white/50 mb-0.5">
                          {info.label}
                        </p>
                        {info.href ? (
                          <a
                            href={info.href}
                            target={info.href.startsWith("http") ? "_blank" : undefined}
                            rel={info.href.startsWith("http") ? "noopener noreferrer" : undefined}
                            className="text-sm text-white hover:text-[#c9a96e] transition-colors break-words"
                          >
                            {info.value}
                          </a>
                        ) : (
                          <p className="text-sm text-white break-words">{info.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </SlideUp>

            {/* Hours */}
            <SlideUp stagger={100} index={1}>
              <div className="bg-white border border-[#e5e7eb] p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-5">
                  <Clock size={16} className="text-[#c9a96e]" />
                  <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-[#1a1a1a]">
                    Business Hours
                  </h3>
                </div>
                <div className="space-y-2.5">
                  {HOURS.map((h) => (
                    <div key={h.day} className="flex items-center justify-between text-sm">
                      <span className="text-[#6b7280]">{h.day}</span>
                      <span className="text-[#1a1a1a] font-medium">{h.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </SlideUp>

            {/* Map placeholder */}
            <SlideUp stagger={100} index={2}>
              <div className="bg-white border border-[#e5e7eb] overflow-hidden">
                <div className="relative aspect-[4/3] bg-[#fafaf9]">
                  <iframe
                    src="https://www.openstreetmap.org/export/embed.html?bbox=74.34%2C31.51%2C74.36%2C31.53&layer=mapnik"
                    className="absolute inset-0 w-full h-full border-0"
                    loading="lazy"
                    title="Denova PK location"
                  />
                </div>
                <div className="p-4">
                  <p className="text-xs font-semibold text-[#1a1a1a]">
                    Visit Our Flagship Store
                  </p>
                  <p className="text-xs text-[#6b7280] mt-1">
                    Gulberg III, Lahore, Pakistan
                  </p>
                </div>
              </div>
            </SlideUp>
          </div>
        </div>
      </div>
    </>
  );
}