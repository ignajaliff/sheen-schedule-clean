
import { Link, useLocation } from "react-router-dom";
import { 
  CalendarDays, 
  Home, 
  BarChart3, 
  Menu, 
  X, 
  Users
} from "lucide-react";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const Navbar = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const menuItems = [
    {
      name: "Turnos",
      path: "/appointments",
      icon: <Home size={20} />
    },
    {
      name: "Calendario",
      path: "/calendar",
      icon: <CalendarDays size={20} />
    },
    {
      name: "Clientes",
      path: "/clients",
      icon: <Users size={20} />
    },
    {
      name: "Estadísticas",
      path: "/metrics",
      icon: <BarChart3 size={20} />
    }
  ];

  return (
    <>
      {isMobile ? (
        <div className="fixed top-0 left-0 w-full bg-white shadow-sm z-50 px-4 py-3 flex justify-between items-center">
          <div className="font-bold text-lg text-gray-800">Cleanly</div>
          <button
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      ) : null}

      <nav
        className={`
          fixed z-40 transition-all duration-300
          ${isMobile
            ? isOpen
              ? "top-14 left-0 right-0 bottom-0 bg-white/95 backdrop-blur-sm"
              : "top-14 -left-full right-full bottom-0"
            : "top-0 left-0 bottom-0 w-20 bg-white border-r"
          }
        `}
      >
        <div className={`h-full flex ${isMobile ? "flex-col p-4" : "flex-col items-center pt-5"}`}>
          {!isMobile && (
            <div className="mb-10 flex flex-col items-center">
              <span className="font-bold text-xl text-cleanly-blue">C</span>
              <span className="text-xs text-gray-400 mt-1">Cleanly</span>
            </div>
          )}

          <ul className={`flex ${isMobile ? "flex-col space-y-1" : "flex-col items-center space-y-5"}`}>
            {menuItems.map((item) => (
              <li key={item.path} className="w-full">
                <Link
                  to={item.path}
                  className={`
                    flex items-center px-3 py-2 rounded-md transition-colors
                    ${isMobile ? "justify-start space-x-3" : "justify-center"}
                    ${
                      isActive(item.path)
                        ? "bg-cleanly-blue text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }
                  `}
                >
                  {item.icon}
                  {isMobile && <span>{item.name}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {!isMobile && (
        <div className="fixed top-0 left-20 right-0 h-16 bg-white border-b z-10"></div>
      )}

      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t py-1 px-2 z-40">
          <ul className="flex justify-around">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`
                    flex flex-col items-center p-2 text-xs
                    ${
                      isActive(item.path)
                        ? "text-cleanly-blue font-semibold"
                        : "text-gray-500"
                    }
                  `}
                >
                  {item.icon}
                  <span className="mt-1">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default Navbar;
