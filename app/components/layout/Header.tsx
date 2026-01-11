import { Link } from "react-router";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Button,
} from "@heroui/react";
import { Bell, Menu, Search } from "lucide-react";
import { useState } from "react";
import { NAV_LINKS, COMPANY } from "~/lib/constants";

/**
 * Header Component - Main navigation bar
 * Task: 1.1.1.3.1, 1.1.1.3.2, 1.1.1.3.3
 */
export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <Navbar
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      classNames={{
        base: "bg-navy-900 text-white shadow-lg",
        wrapper: "max-w-7xl",
      }}
      maxWidth="full"
    >
      {/* Mobile menu toggle */}
      <NavbarContent className="sm:hidden" justify="start">
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="text-white"
        />
      </NavbarContent>

      {/* Brand / Logo */}
      <NavbarContent className="pr-3 sm:pr-0" justify="center">
        <NavbarBrand>
          <Link to="/" className="flex items-center gap-3">
            {/* Logo placeholder - replace with actual logo */}
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-500 font-bold text-navy-900">
              ARL
            </div>
            <div className="hidden flex-col sm:flex">
              <span className="text-lg font-bold text-gold-400">
                {COMPANY.intranetName}
              </span>
              <span className="text-xs text-gray-300">{COMPANY.name}</span>
            </div>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      {/* Desktop Navigation */}
      <NavbarContent className="hidden gap-6 sm:flex" justify="center">
        {NAV_LINKS.map((link) => (
          <NavbarItem key={link.href}>
            <Link
              to={link.href}
              className="text-sm font-medium text-gray-200 transition-colors hover:text-gold-400"
            >
              {link.label}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      {/* Actions */}
      <NavbarContent justify="end">
        <NavbarItem className="hidden lg:flex">
          <Button
            isIconOnly
            variant="light"
            aria-label="Search"
            className="text-gray-200 hover:text-gold-400"
          >
            <Search size={20} />
          </Button>
        </NavbarItem>
        <NavbarItem>
          <Button
            isIconOnly
            variant="light"
            aria-label="Notifications"
            className="relative text-gray-200 hover:text-gold-400"
          >
            <Bell size={20} />
            {/* Alert badge - will be dynamic later */}
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              2
            </span>
          </Button>
        </NavbarItem>
      </NavbarContent>

      {/* Mobile Menu */}
      <NavbarMenu className="bg-navy-800 pt-6">
        {NAV_LINKS.map((link) => (
          <NavbarMenuItem key={link.href}>
            <Link
              to={link.href}
              onClick={() => setIsMenuOpen(false)}
              className="block w-full py-2 text-lg text-gray-200 hover:text-gold-400"
            >
              {link.label}
            </Link>
          </NavbarMenuItem>
        ))}
        <NavbarMenuItem>
          <hr className="my-4 border-gray-600" />
          <Link
            to="/admin"
            onClick={() => setIsMenuOpen(false)}
            className="block w-full py-2 text-sm text-gray-400 hover:text-gold-400"
          >
            Admin Login
          </Link>
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  );
}
