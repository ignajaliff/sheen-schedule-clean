
export interface Appointment {
  id: string;
  clientName: string;
  date: string;
  time: string;
  serviceType: string;
  location: string;
  isHomeService: boolean;
  status: "pending" | "completed" | "cancelled";
}

// Datos de ejemplo
let sampleAppointments: Appointment[] = [
  {
    id: "1",
    clientName: "Carlos Rodríguez",
    date: "05/05/2025",
    time: "10:00",
    serviceType: "Lavado completo",
    location: "Taller principal",
    isHomeService: false,
    status: "pending"
  },
  {
    id: "2",
    clientName: "María González",
    date: "05/05/2025",
    time: "11:30",
    serviceType: "Lavado exterior",
    location: "Av. Libertad 1250",
    isHomeService: true,
    status: "pending"
  },
  {
    id: "3",
    clientName: "Juan Pérez",
    date: "05/05/2025",
    time: "14:00",
    serviceType: "Lavado y encerado",
    location: "Taller principal",
    isHomeService: false,
    status: "completed"
  },
  {
    id: "4",
    clientName: "Ana Martínez",
    date: "06/05/2025",
    time: "09:15",
    serviceType: "Limpieza de interiores",
    location: "Calle Robles 456",
    isHomeService: true,
    status: "completed"
  },
  {
    id: "5",
    clientName: "Roberto Fernández",
    date: "06/05/2025",
    time: "16:30",
    serviceType: "Lavado premium",
    location: "Taller principal",
    isHomeService: false,
    status: "cancelled"
  },
  {
    id: "6",
    clientName: "Laura Díaz",
    date: "07/05/2025",
    time: "11:00",
    serviceType: "Lavado completo",
    location: "Av. Principal 789",
    isHomeService: true,
    status: "pending"
  },
  {
    id: "7",
    clientName: "Daniel Torres",
    date: "07/05/2025",
    time: "15:45",
    serviceType: "Limpieza de tapicería",
    location: "Taller principal",
    isHomeService: false,
    status: "pending"
  },
  {
    id: "8",
    clientName: "Carolina Sánchez",
    date: "08/05/2025",
    time: "10:30",
    serviceType: "Lavado y encerado",
    location: "Calle Norte 321",
    isHomeService: true,
    status: "pending"
  }
];

// Servicio para obtener los turnos
export const getAppointments = (): Appointment[] => {
  return sampleAppointments;
};

// Servicio para obtener un turno por ID
export const getAppointmentById = (id: string): Appointment | undefined => {
  return sampleAppointments.find(appointment => appointment.id === id);
};

// Filtrar turnos por estado
export const getAppointmentsByStatus = (status: string): Appointment[] => {
  if (status === 'all') return sampleAppointments;
  return sampleAppointments.filter(appointment => appointment.status === status);
};

// Obtener estadísticas
export const getAppointmentStats = () => {
  const total = sampleAppointments.length;
  const completed = sampleAppointments.filter(app => app.status === "completed").length;
  const cancelled = sampleAppointments.filter(app => app.status === "cancelled").length;
  const pending = sampleAppointments.filter(app => app.status === "pending").length;
  
  const homeServices = sampleAppointments.filter(app => app.isHomeService).length;
  const workshopServices = sampleAppointments.filter(app => !app.isHomeService).length;
  
  // Conteo de tipos de servicio
  const serviceTypes: Record<string, number> = {};
  sampleAppointments.forEach(app => {
    if (serviceTypes[app.serviceType]) {
      serviceTypes[app.serviceType]++;
    } else {
      serviceTypes[app.serviceType] = 1;
    }
  });
  
  return {
    total,
    completed,
    cancelled,
    pending,
    completionRate: total > 0 ? (completed / total) * 100 : 0,
    homeServices,
    workshopServices,
    serviceTypes
  };
};

// Generar un ID único
const generateId = (): string => {
  return Date.now().toString() + Math.floor(Math.random() * 1000).toString();
};

// Agregar un nuevo turno
export interface NewAppointmentData {
  clientName: string;
  date: Date;
  time: string;
  serviceType: string;
  location: string;
  isHomeService: boolean;
}

export const addAppointment = (appointmentData: NewAppointmentData): Appointment => {
  const formattedDate = formatDate(appointmentData.date);
  
  const newAppointment: Appointment = {
    id: generateId(),
    clientName: appointmentData.clientName,
    date: formattedDate,
    time: appointmentData.time,
    serviceType: appointmentData.serviceType,
    location: appointmentData.isHomeService ? appointmentData.location : "Taller principal",
    isHomeService: appointmentData.isHomeService,
    status: "pending"
  };
  
  sampleAppointments = [...sampleAppointments, newAppointment];
  return newAppointment;
};

// Actualizar el estado de un turno
export const updateAppointmentStatus = (id: string, status: "pending" | "completed" | "cancelled"): Appointment | undefined => {
  const appointmentIndex = sampleAppointments.findIndex(app => app.id === id);
  
  if (appointmentIndex !== -1) {
    const updatedAppointment = {
      ...sampleAppointments[appointmentIndex],
      status
    };
    
    sampleAppointments = [
      ...sampleAppointments.slice(0, appointmentIndex),
      updatedAppointment,
      ...sampleAppointments.slice(appointmentIndex + 1)
    ];
    
    return updatedAppointment;
  }
  
  return undefined;
};

// Función auxiliar para formatear la fecha
const formatDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
};
