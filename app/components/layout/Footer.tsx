import { Link } from "@heroui/react";
import { Phone, Mail, MapPin } from "lucide-react";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "News", href: "/news" },
  { label: "Safety", href: "/safety" },
  { label: "Directory", href: "/directory" },
  { label: "Gallery", href: "/gallery" },
  { label: "Apps", href: "/apps" },
];

const emergencyContacts = [
  { label: "Emergency", value: "Call Control Room", icon: Phone },
  { label: "HSE", value: "Safety Hotline", icon: Phone },
  { label: "IT Support", value: "Help Desk", icon: Mail },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand & Description */}
          <div>
            <div className="flex items-center gap-3">
              <img
                src="/images/logo-icon.png"
                alt="ARL"
                className="h-10 w-10 object-contain"
              />
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gold-400">ARL Connect</span>
                <span className="text-xs text-gray-400">Adamus Resources Limited</span>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-400">
              Your central hub for company news, safety information, and resources.
              Connecting our team across the mine site.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gold-400">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 transition-colors hover:text-gold-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Emergency Contacts */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gold-400">
              Emergency Contacts
            </h3>
            <ul className="mt-4 space-y-3">
              {emergencyContacts.map((contact) => (
                <li key={contact.label} className="flex items-center gap-3">
                  <contact.icon size={16} className="text-gold-500" />
                  <div>
                    <span className="text-sm font-medium text-gray-300">
                      {contact.label}:
                    </span>{" "}
                    <span className="text-sm text-gray-400">{contact.value}</span>
                  </div>
                </li>
              ))}
            </ul>
            <Link
              href="/directory"
              className="mt-4 inline-block text-sm text-gold-400 hover:text-gold-300"
            >
              View Full Directory →
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 border-t border-navy-700 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-gray-500">
              © {currentYear} Adamus Resources Limited. All rights reserved.
            </p>
            <p className="text-xs text-gray-600">
              Internal Use Only - Accessible on Company Network
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
