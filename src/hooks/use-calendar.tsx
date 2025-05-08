
import { useState, useEffect } from "react";
import { startOfWeek, endOfWeek, startOfDay, addDays, format, addWeeks, subWeeks } from "date-fns";
import { getAppointments, Appointment } from "@/services/appointmentService";
import { toast } from "sonner";
import { useIsMobile, useMediaQuery } from "@/hooks/use-mobile";

export const useCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [activeView, setActiveView] = useState("week");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Use more granular breakpoints for better responsive design
  const isMobile = useIsMobile();
  const isSmallMobile = useMediaQuery("(max-width: 430px)");
  const isMediumMobile = useMediaQuery("(min-width: 431px) and (max-width: 639px)");
  const isLargeMobile = useMediaQuery("(min-width: 640px) and (max-width: 767px)");
  
  useEffect(() => {
    const loadAppointments = async () => {
      setIsLoading(true);
      try {
        const appointmentsData = await getAppointments();
        setAppointments(appointmentsData);
      } catch (error) {
        toast.error("Error al cargar los turnos");
        console.error("Error loading appointments:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAppointments();
  }, [refreshKey]);
  
  // Determine how many days to show based on screen size with improved values
  const getDaysToShow = () => {
    if (isSmallMobile) return 3; // Smallest screens: show at least 3 days
    if (isMediumMobile) return 4; // Medium mobile: 4 days
    if (isLargeMobile) return 5; // Larger mobile devices: 5 days
    return 7; // Desktop: Full week
  };
  
  const getDaysOfWeek = () => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const daysToShow = activeView === "fullWeek" ? 7 : getDaysToShow();
    const end = activeView === "fullWeek" || !isMobile
      ? endOfWeek(selectedDate, { weekStartsOn: 1 })
      : addDays(start, daysToShow - 1);
    
    const days = [];
    let day = start;
    
    while (day <= end) {
      days.push(day);
      day = addDays(day, 1);
    }
    
    return days;
  };

  // Navigation for weekly view
  const goToNextWeek = () => {
    setSelectedDate(prevDate => addWeeks(prevDate, 1));
  };

  const goToPreviousWeek = () => {
    setSelectedDate(prevDate => subWeeks(prevDate, 1));
  };
  
  // Navigation for days view
  const goToNextDays = () => {
    const daysToShow = getDaysToShow();
    setSelectedDate(prevDate => addDays(prevDate, daysToShow));
  };

  const goToPreviousDays = () => {
    const daysToShow = getDaysToShow();
    setSelectedDate(prevDate => subDays(prevDate, daysToShow));
  };
  
  const handleAppointmentAdded = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };
  
  const openAppointmentDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };
  
  return {
    selectedDate,
    setSelectedDate,
    isFormOpen, 
    setIsFormOpen,
    selectedAppointment,
    setSelectedAppointment,
    activeView,
    setActiveView,
    appointments,
    isLoading,
    refreshKey,
    isMobile,
    isSmallMobile,
    isMediumMobile,
    isLargeMobile,
    getDaysToShow,
    getDaysOfWeek,
    handleAppointmentAdded,
    openAppointmentDetails,
    goToNextWeek,
    goToPreviousWeek,
    goToNextDays,
    goToPreviousDays
  };
};

export default useCalendar;
