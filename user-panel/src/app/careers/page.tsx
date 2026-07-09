import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Clock, ArrowRight, Heart, Users, TrendingUp, Zap } from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { FadeIn } from "@/components/animations/FadeIn";
import { TextReveal } from "@/components/animations/TextReveal";
import { SlideUp } from "@/components/animations/SlideUp";

export const metadata: Metadata = {
  title: "Careers",
  description: "Join the Denova PK team. Explore open positions and grow with us.",
};

const PERKS = [
  { icon: Heart,      title: "Passion-Driven Culture",  desc: "Work with people who genuinely love fashion, craft, and quality." },
  { icon: TrendingUp, title: "Growth Opportunities",    desc: "We invest in our team with training, mentorship, and clear career paths." },
  { icon: Users,      title: "Collaborative Team",      desc: "A flat, open culture where every voice matters and ideas are celebrated." },
  { icon: Zap,        title: "Competitive Benefits",    desc: "Competitive salaries, staff discounts, flexible hours, and performance bonuses." },
];

const OPENINGS = [
  {
    title:       "Senior Fashion Designer",
    department:  "Design",
    type:        "Full-time",
    location:    "Lahore, Pakistan",
    desc:        "Lead the design process for our seasonal collections, from concept to final production.",
    requirements: ["5+ years of fashion design experience", "Proficiency in Adobe Illustrator & Photoshop", "Strong understanding of Pakistani textile market", "Portfolio required"],
  },
  {
    title:       "E-Commerce Manager",
    department:  "Digital",
    type:        "Full-time",
    location:    "Lahore, Pakistan",
    desc:        "Manage our online store, drive digital sales, and lead our e-commerce growth strategy.",
    requirements: ["3+ years e-commerce experience", "Experience with Shopify or custom platforms", "Strong analytical and marketing skills", "SEO & data analysis knowledge"],
  },
  {
    title:       "Customer Experience Executive",
    department:  "Support",
    type:        "Full-time",
    location:    "Lahore / Remote",
    desc:        "Be the first point of contact for our customers, delivering exceptional service across all channels.",
    requirements: ["Excellent written and verbal communication", "Experience in customer service", "Proficiency in WhatsApp Business & CRM tools", "Empathetic and solution-oriented mindset"],
  },
  {
    title:       "Content Creator & Stylist",
    department:  "Marketing",
    type:        "Full-time",
    location:    "Lahore, Pakistan",
    desc:        "Create compelling visual content for our social media, website, and marketing campaigns.",
    requirements: ["Experience in fashion photography or styling", "Proficiency in Adobe Lightroom / Premiere", "Creative eye with strong aesthetic sensibility", "Portfolio or social profile required"],
  },
  {
    title:       "Supply Chain Coordinator",
    department:  "Operations",
    type:        "Full-time",
    location:    "Lahore, Pakistan",
    desc:        "Coordinate with fabric suppliers, production units, and logistics partners to ensure smooth operations.",
    requirements: ["2+ years in supply chain or operations", "Knowledge of textile supply chain in Pakistan", "Strong Excel and organizational skills", "Problem-solving mindset"],
  },
  {
    title:       "Brand Intern",
    department:  "Marketing",
    type:        "Internship (3 months)",
    location:    "Lahore / Remote",
    desc:        "Join our marketing team as an intern and get hands-on experience in brand building, social media, and campaigns.",
    requirements: ["Currently enrolled in Business, Marketing, or Media program", "Passion for fashion and storytelling", "Basic knowledge of Instagram & social platforms", "Strong written communication in English & Urdu"],
  },
];

export default function CareersPage() {
  return (
    <>
      {/* Hero */}
      <div className="pt-28 pb-10 sm:pt-32 sm:pb-14 bg-[#1a1a1a] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <Breadcrumb
              items={[{ label: "Home", href: "/" }, { label: "Careers" }]}
              className="mb-6 [&_span]:text-white/60 [&_a]:text-white/60 [&_a:hover]:text-[#c9a96e] [&_svg]:text-white/40"
            />
          </FadeIn>
          <FadeIn>
            <span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#c9a96e]">
              Join Our Team
            </span>
          </FadeIn>
          <TextReveal as="h1" delay={100}>
            <span className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-2 block leading-tight">
              Build the Future of
              <br />
              <span className="text-[#c9a96e]">Pakistani Fashion</span>
            </span>
          </TextReveal>
          <FadeIn delay={200}>
            <p className="text-white/70 text-sm sm:text-base max-w-2xl mt-5 leading-relaxed">
              At Denova PK, we are more than a clothing brand. We are a team of passionate individuals who believe in the power of design, craftsmanship, and storytelling. If that excites you, we would love to have you on board.
            </p>
          </FadeIn>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 space-y-16">

        {/* Perks */}
        <section>
          <FadeIn>
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl font-bold text-[#1a1a1a] mb-8 text-center">
              Why Work With Us?
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
            {PERKS.map((perk, i) => (
              <SlideUp key={perk.title} stagger={80} index={i}>
                <div className="group border border-[#e5e7eb] bg-white p-6 hover:border-[#c9a96e] transition-colors">
                  <div className="w-10 h-10 rounded-full bg-[#f5f0e8] flex items-center justify-center mb-4 group-hover:bg-[#c9a96e] transition-colors">
                    <perk.icon size={18} className="text-[#c9a96e] group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-sm font-bold text-[#1a1a1a] mb-2">{perk.title}</h3>
                  <p className="text-sm text-[#6b7280] leading-relaxed">{perk.desc}</p>
                </div>
              </SlideUp>
            ))}
          </div>
        </section>

        {/* Openings */}
        <section>
          <FadeIn>
            <div className="text-center mb-8">
              <span className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-[#c9a96e]">
                {OPENINGS.length} Open Positions
              </span>
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl font-bold text-[#1a1a1a] mt-2">
                Current Openings
              </h2>
            </div>
          </FadeIn>

          <div className="space-y-4">
            {OPENINGS.map((job, i) => (
              <FadeIn key={job.title} delay={i * 50}>
                <div className="bg-white border border-[#e5e7eb] p-5 sm:p-6 hover:border-[#c9a96e] transition-colors group">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h3 className="text-base font-bold text-[#1a1a1a]">{job.title}</h3>
                        <span className="text-[10px] px-2 py-0.5 bg-[#f5f0e8] text-[#c9a96e] font-semibold uppercase tracking-wider">
                          {job.department}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#6b7280] mb-3 flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin size={11} />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {job.type}
                        </span>
                      </div>
                      <p className="text-sm text-[#6b7280] leading-relaxed mb-3">
                        {job.desc}
                      </p>
                      <ul className="space-y-1">
                        {job.requirements.map((req) => (
                          <li key={req} className="flex items-start gap-2 text-xs text-[#6b7280]">
                            <span className="w-1 h-1 rounded-full bg-[#c9a96e] mt-1.5 flex-shrink-0" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Link
                      href={`mailto:careers@denovapk.com?subject=Application: ${encodeURIComponent(job.title)}`}
                      className="group/btn inline-flex items-center gap-2 bg-[#1a1a1a] text-white px-5 py-2.5 text-xs font-semibold tracking-wide hover:bg-[#c9a96e] transition-colors flex-shrink-0 mt-1"
                    >
                      Apply Now
                      <ArrowRight size={13} className="transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* No match */}
        <FadeIn>
          <div className="bg-[#fafaf9] border border-[#e5e7eb] p-8 text-center">
            <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-[#1a1a1a] mb-2">
              Do not see a role that fits?
            </h3>
            <p className="text-sm text-[#6b7280] mb-5 max-w-md mx-auto">
              We are always looking for talented people. Send your CV and a brief introduction to our careers team.
            </p>
            <a
              href="mailto:careers@denovapk.com"
              className="inline-flex items-center gap-2 bg-[#1a1a1a] text-white px-7 py-3 text-sm font-semibold hover:bg-[#c9a96e] transition-colors"
            >
              Send Open Application
              <ArrowRight size={14} />
            </a>
          </div>
        </FadeIn>

      </div>
    </>
  );
}