import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  Bell,
  BookOpen,
  Briefcase,
  CakeSlice,
  ChefHat,
  Flame,
  Hammer,
  Heart,
  Image,
  LayoutGrid,
  MessageCircle,
  Paintbrush,
  PlusCircle,
  Search,
  ShieldAlert,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Store,
  TrendingUp,
  User,
  Wrench,
  Zap,
  Scissors,
} from "lucide-react";

export function getCategoryIcon(slug?: string): LucideIcon {
  switch (slug) {
    case "plumber":
      return Wrench;
    case "electrician":
      return Zap;
    case "ac-repair":
      return Snowflake;
    case "city-gas":
      return Flame;
    case "painter":
      return Paintbrush;
    case "carpenter":
      return Hammer;
    case "handyman":
      return Wrench;
    case "home-cooking":
      return ChefHat;
    case "pastries":
      return CakeSlice;
    case "tailoring":
      return Scissors;
    case "handmade":
      return Sparkles;
    default:
      return Wrench;
  }
}

export const uiIcons = {
  home: LayoutGrid,
  search: Search,
  categories: LayoutGrid,
  profile: User,
  messages: MessageCircle,
  settings: LayoutGrid,
  add: PlusCircle,
  notifications: Bell,
  favorites: Heart,
  growth: TrendingUp,
  learning: BookOpen,
  trust: BadgeCheck,
  safety: ShieldCheck,
  reporting: ShieldAlert,
  market: Store,
  opportunity: Briefcase,
  portfolio: Image,
};
