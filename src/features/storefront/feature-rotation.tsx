"use client";

import { useEffect, useState } from "react";
import { AppIcon } from "@/components/ui/app-icon";

const features = [
  { icon: "product" as const, title: "Product information", description: "Review the available product details and images before making a decision.", tone: "bg-[#244b36]" },
  { icon: "orders" as const, title: "Clear ordering options", description: "See whether ordering is available and understand the next step before you begin.", tone: "bg-[#536b4e]" },
  { icon: "support" as const, title: "Direct seller support", description: "Ask the seller about product availability, delivery arrangements or an existing order.", tone: "bg-[#78694b]" },
  { icon: "security" as const, title: "Payment status checks", description: "Online payment status is verified with the payment provider, not inferred from a return page.", tone: "bg-[#465c60]" },
];

export function StorefrontFeatureRotation() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % features.length);
    }, 3500);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="relative flex h-full min-h-[190px] flex-col justify-between">
      <div className="relative min-h-[126px]">
        {features.map((feature, index) => (
          <div
            key={feature.title}
            aria-hidden={active !== index}
            className={`absolute inset-0 flex items-center gap-4 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${active === index ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`}
          >
            <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white sm:h-14 sm:w-14 ${feature.tone}`}>
              <AppIcon name={feature.icon} size={24} strokeWidth={1.5} />
            </span>
            <div>
              <p className="font-medium text-[#203a2b]">{feature.title}</p>
              <p className="mt-2 max-w-[250px] text-sm leading-6 text-[#68766c]">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 flex gap-2" aria-label={`Feature ${active + 1} of ${features.length}`}>
        {features.map((feature, index) => (
          <button
            key={feature.title}
            type="button"
            aria-label={`Show feature ${index + 1}: ${feature.title}`}
            aria-pressed={active === index}
            onClick={() => setActive(index)}
            className={`h-1 flex-1 rounded-full transition-colors ${active === index ? "bg-[#244b36]" : "bg-[#244b36]/20"}`}
          />
        ))}
      </div>
    </div>
  );
}
