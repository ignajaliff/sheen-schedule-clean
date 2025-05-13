
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

type StatsCardProps = {
  title: string;
  description: string;
  value: string;
  icon?: React.ReactNode;
  gradient: string;
};

const StatsCard = ({
  title,
  description,
  value,
  icon,
  gradient
}: StatsCardProps) => {
  return (
    <Card className="relative shadow-md border border-gray-300">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-30 rounded-lg`} />
      <CardHeader className="pb-2 relative z-10 bg-cyan-300">
        <CardTitle className="flex items-center gap-2 text-gray-800">
          {icon}
          {title}
        </CardTitle>
        <CardDescription className="text-gray-600">{description}</CardDescription>
      </CardHeader>
      <CardContent className="relative z-10 bg-cyan-300">
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
