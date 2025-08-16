import { Badge } from "@/components/ui/badge";
import { Shield, Crown } from "lucide-react";

interface AdminBadgeProps {
  isAdmin: boolean;
  adminLevel: number;
  className?: string;
}

export function AdminBadge({ isAdmin, adminLevel, className }: AdminBadgeProps) {
  if (!isAdmin) return null;

  const getBadgeConfig = () => {
    switch (adminLevel) {
      case 2:
        return {
          label: "Super Admin",
          icon: Crown,
          variant: "default" as const,
          className: "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
        };
      case 1:
        return {
          label: "Admin",
          icon: Shield,
          variant: "secondary" as const,
          className: "bg-gradient-to-r from-blue-600 to-green-600 text-white hover:from-blue-700 hover:to-green-700"
        };
      default:
        return {
          label: "Admin",
          icon: Shield,
          variant: "outline" as const,
          className: "border-blue-600 text-blue-600"
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant} 
      className={`${config.className} ${className} inline-flex items-center gap-1 px-2 py-1`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}