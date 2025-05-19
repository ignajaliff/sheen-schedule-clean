import { DropletIcon } from "lucide-react";
const Header = ({
  title
}: {
  title: string;
}) => {
  return <header className="bg-white border-b border-gray-200 py-4 px-4 flex items-center justify-between fixed top-0 left-0 right-0 z-40 h-16">
      <div className="flex items-center">
        <DropletIcon className="text-cleanly-blue mr-2" size={24} />
        <h1 className="font-bold bg-gradient-to-r from-cleanly-blue to-blue-700 bg-clip-text text-transparent text-xl">Provves</h1>
      </div>
      <h2 className="text-lg font-medium">{title}</h2>
      <div className="w-8"></div> {/* Espacio para equilibrar el header */}
    </header>;
};
export default Header;