import {
  Bell,
  Cctv,
  Cpu,
  LayoutDashboard,
  PencilRuler,
  Settings2,
  TableProperties,
} from "lucide-react";
import type { Role } from "../../lib/types";

export interface NavItem {
  to: string;
  label: string;
  code: string;
  icon: typeof Cctv;
  roles: Role[];
}

export const navItems: NavItem[] = [
  {
    to: "/dashboard",
    label: "Live monitoring",
    code: "01",
    icon: LayoutDashboard,
    roles: ["admin", "operator", "viewer"],
  },
  { to: "/cameras", label: "Camera sources", code: "02", icon: Cctv, roles: ["admin", "operator"] },
  { to: "/detection", label: "Detection & tracking", code: "03", icon: Cpu, roles: ["admin", "operator"] },
  { to: "/zones", label: "Zones & lines", code: "04", icon: PencilRuler, roles: ["admin", "operator"] },
  {
    to: "/reports",
    label: "Sessions & reports",
    code: "05",
    icon: TableProperties,
    roles: ["admin", "operator", "viewer"],
  },
  {
    to: "/alerts",
    label: "Alerts center",
    code: "06",
    icon: Bell,
    roles: ["admin", "operator", "viewer"],
  },
  { to: "/admin", label: "Admin & system", code: "07", icon: Settings2, roles: ["admin"] },
];
