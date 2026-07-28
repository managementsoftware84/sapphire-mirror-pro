import {
  AlertTriangle, Award, BarChart3, BookOpen, Bot, Briefcase, Building, Building2,
  Calculator, Calendar, Camera, Car, CheckCircle, ClipboardCheck, Clock, Cloud, Code2,
  Coins, Cpu, CreditCard, DollarSign, Dumbbell, Eye, Factory, FileCheck, FileText,
  Fingerprint, FlaskConical, Gamepad2, Gavel, Globe, GraduationCap, HardDrive,
  Headphones, HeartHandshake, Home, Hotel, Key, Landmark, Leaf, Lightbulb, Lock, Mail,
  MapPin, Megaphone, MessageSquare, Mic, MonitorPlay, Package, Phone, PhoneCall,
  PieChart, Pill, Plane, Printer, Radio, Receipt, Recycle, Scale, Scissors, ScrollText,
  Server, Share2, Shield, Shirt, ShoppingBag, ShoppingCart, Star, Stethoscope, Store,
  Sun, Target, Trash2, TrendingUp, Trophy, Truck, UserCheck, UserCog, UserPlus, Users,
  Utensils, Vote, Wallet, Wifi, Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ProductRow } from "./catalog.functions";

/** icon_name (stored in DB) -> lucide component. */
export const PRODUCT_ICONS: Record<string, LucideIcon> = {
  AlertTriangle, Award, BarChart3, BookOpen, Bot, Briefcase, Building, Building2,
  Calculator, Calendar, Camera, Car, CheckCircle, ClipboardCheck, Clock, Cloud, Code2,
  Coins, Cpu, CreditCard, DollarSign, Dumbbell, Eye, Factory, FileCheck, FileText,
  Fingerprint, FlaskConical, Gamepad2, Gavel, Globe, GraduationCap, HardDrive,
  Headphones, HeartHandshake, Home, Hotel, Key, Landmark, Leaf, Lightbulb, Lock, Mail,
  MapPin, Megaphone, MessageSquare, Mic, MonitorPlay, Package, Phone, PhoneCall,
  PieChart, Pill, Plane, Printer, Radio, Receipt, Recycle, Scale, Scissors, ScrollText,
  Server, Share2, Shield, Shirt, ShoppingBag, ShoppingCart, Star, Stethoscope, Store,
  Sun, Target, Trash2, TrendingUp, Trophy, Truck, UserCheck, UserCog, UserPlus, Users,
  Utensils, Vote, Wallet, Wifi, Zap,
};

/** View model matching the shape HomeIndex's cards expect. */
export interface ViewDemo {
  id: string;
  name: string;
  category: string;
  masterCategory: string;
  description: string;
  url: string;
  icon: LucideIcon;
  status: "ACTIVE" | "COMING_SOON";
  features: string[];
  frontend: string[];
  backend: string[];
  color: string;
  price: string;
  discountPrice: string;
}

export function toViewDemo(row: ProductRow): ViewDemo {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    masterCategory: row.master_category,
    description: row.description,
    url: row.url,
    icon: PRODUCT_ICONS[row.icon_name] ?? Package,
    status: row.status as ViewDemo["status"],
    features: row.features ?? [],
    frontend: row.frontend ?? [],
    backend: row.backend ?? [],
    color: row.color,
    price: row.price,
    discountPrice: row.discount_price,
  };
}