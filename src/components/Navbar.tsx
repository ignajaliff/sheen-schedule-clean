
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Car, Calendar, PieChart } from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.pathname);

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex items-center justify-around z-50 md:h-full md:w-20 md:flex-col md:left-0 md:top-0 md:border-t-0 md:border-r md:pb-10">
      <Link 
        to="/appointments" 
        className={`flex flex-col items-center justify-center w-20 h-full ${activeTab === "/appointments" ? "text-cleanly-blue" : "text-gray-500"}`}
        onClick={() => setActiveTab("/appointments")}
      >
        <Car size={24} className={`${activeTab === "/appointments" ? "animate-fade-in" : ""}`} />
        <span className="text-xs mt-1 md:text-[10px]">Turnos</span>
      </Link>
      
      <Link 
        to="/calendar" 
        className={`flex flex-col items-center justify-center w-20 h-full ${activeTab === "/calendar" ? "text-cleanly-blue" : "text-gray-500"}`}
        onClick={() => setActiveTab("/calendar")}
      >
        <Calendar size={24} className={`${activeTab === "/calendar" ? "animate-fade-in" : ""}`} />
        <span className="text-xs mt-1 md:text-[10px]">Calendario</span>
      </Link>
      
      <Link 
        to="/metrics" 
        className={`flex flex-col items-center justify-center w-20 h-full ${activeTab === "/metrics" ? "text-cleanly-blue" : "text-gray-500"}`}
        onClick={() => setActiveTab("/metrics")}
      >
        <PieChart size={24} className={`${activeTab === "/metrics" ? "animate-fade-in" : ""}`} />
        <span className="text-xs mt-1 md:text-[10px]">Datos</span>
      </Link>
    </nav>
  );
};

export default Navbar;
