import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Input,
  Avatar,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { Search, Bell, Settings, LogOut, User } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router";

const navItems = [
  { label: "Home", href: "/" },
  { label: "News", href: "/news" },
  { label: "Safety", href: "/safety" },
  { label: "Directory", href: "/directory" },
  { label: "Events", href: "/events" },
  { label: "Apps", href: "/apps" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  return (
    <Navbar
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      classNames={{
        base: "bg-[#1a1a1a] shadow-md",
        wrapper: "max-w-full px-4 sm:px-6",
      }}
      maxWidth="full"
      height="4rem"
    >
      {/* Mobile menu toggle */}
      <NavbarContent className="sm:hidden" justify="start">
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="text-white"
        />
      </NavbarContent>

      {/* Brand */}
      <NavbarContent justify="start" className="gap-8">
        <NavbarBrand>
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/images/logo.png"
              alt="Adamus Resources"
              className="h-14 object-contain"
            />
          </Link>
        </NavbarBrand>

        {/* Desktop nav items */}
        <div className="hidden gap-1 sm:flex">
          {navItems.map((item) => (
            <NavbarItem key={item.href}>
              <Link
                to={item.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "bg-white/20 text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            </NavbarItem>
          ))}
        </div>
      </NavbarContent>

      {/* Search & Actions */}
      <NavbarContent justify="end" className="gap-2 sm:gap-4">
        {/* Search */}
        <NavbarItem className="hidden md:flex">
          <Input
            classNames={{
              base: "max-w-[220px]",
              inputWrapper: "bg-white/20 hover:bg-white/30 group-data-[focus=true]:bg-white/30 border-0",
              input: "text-white placeholder:text-white/60 text-sm",
            }}
            placeholder="Search..."
            size="sm"
            startContent={<Search size={16} className="text-white/60" />}
            type="search"
          />
        </NavbarItem>

        {/* Notifications */}
        <NavbarItem>
          <Button
            isIconOnly
            variant="light"
            aria-label="Notifications"
            className="text-white hover:bg-white/20"
            size="sm"
          >
            <div className="relative">
              <Bell size={20} />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                3
              </span>
            </div>
          </Button>
        </NavbarItem>

        {/* User Menu */}
        <NavbarItem>
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                as="button"
                name="PK"
                size="sm"
                classNames={{
                  base: "bg-white text-primary-600 font-semibold cursor-pointer",
                }}
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="User menu">
              <DropdownItem key="profile" startContent={<User size={16} />}>
                My Profile
              </DropdownItem>
              <DropdownItem key="settings" startContent={<Settings size={16} />}>
                Settings
              </DropdownItem>
              <DropdownItem
                key="logout"
                color="danger"
                startContent={<LogOut size={16} />}
              >
                Log Out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarItem>
      </NavbarContent>

      {/* Mobile menu */}
      <NavbarMenu className="bg-[#1a1a1a] pt-6">
        {/* Mobile Search */}
        <div className="mb-4 px-2">
          <Input
            classNames={{
              inputWrapper: "bg-white/20 border-0",
              input: "text-white placeholder:text-white/60",
            }}
            placeholder="Search..."
            size="sm"
            startContent={<Search size={16} className="text-white/60" />}
            type="search"
          />
        </div>
        {navItems.map((item) => (
          <NavbarMenuItem key={item.href}>
            <Link
              to={item.href}
              className={`block w-full rounded-lg px-3 py-2 text-lg ${
                isActive(item.href)
                  ? "bg-white/20 font-semibold text-white"
                  : "text-white/80"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </Link>
          </NavbarMenuItem>
        ))}
        <NavbarMenuItem>
          <Link
            to="/admin"
            className="mt-4 block w-full rounded-lg px-3 py-2 text-lg text-white/60"
            onClick={() => setIsMenuOpen(false)}
          >
            Admin Portal
          </Link>
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  );
}
