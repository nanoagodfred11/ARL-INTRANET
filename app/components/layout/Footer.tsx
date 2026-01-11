import { Link } from "react-router";
import { COMPANY, NAV_LINKS } from "~/lib/constants";

/**
 * Footer Component
 * Task: 1.1.1.3.5
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-500 font-bold text-navy-900">
                ARL
              </div>
              <div>
                <h3 className="text-lg font-bold text-gold-400">
                  {COMPANY.intranetName}
                </h3>
                <p className="text-sm text-gray-400">{COMPANY.name}</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-400">
              Your central hub for company news, safety information, and
              resources. Connecting our team across the mine site.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gold-400">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-gray-400 transition-colors hover:text-gold-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Emergency */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gold-400">
              Emergency Contacts
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <span className="font-medium text-red-400">Emergency:</span>{" "}
                Call Control Room
              </li>
              <li>
                <span className="font-medium text-gold-400">HSE:</span> Safety
                Hotline
              </li>
              <li>
                <span className="font-medium text-gold-400">IT Support:</span>{" "}
                Help Desk
              </li>
            </ul>
            <div className="mt-4">
              <Link
                to="/directory"
                className="text-sm text-gold-400 underline hover:text-gold-300"
              >
                View Full Directory →
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t border-gray-700 pt-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-gray-500">
              © {currentYear} {COMPANY.name}. All rights reserved.
            </p>
            <p className="text-sm text-gray-500">
              Internal Use Only - Accessible on Company Network
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
