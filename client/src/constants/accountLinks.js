import { Heart, KeyRound, MapPin, Package, UserRound } from "lucide-react";

export const accountLinks = [
  {
    name: "My Profile",
    href: "/account",
    icon: UserRound,
  },
  {
    name: "Manage Addresses",
    href: "/addresses",
    icon: MapPin,
  },
  {
    name: "My Orders",
    href: "/orders",
    icon: Package,
  },
  {
    name: "My Wishlist",
    href: "/wishlist",
    icon: Heart,
  },
  {
    name: "Password Manager",
    href: "/change-password",
    icon: KeyRound,
  },
];
