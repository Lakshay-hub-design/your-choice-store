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
    href: "/account/orders",
    icon: Package,
  },
  {
    name: "My Wishlist",
    href: "/account/wishlist",
    icon: Heart,
  },
  {
    name: "Password Manager",
    href: "/change-password",
    icon: KeyRound,
  },
];
