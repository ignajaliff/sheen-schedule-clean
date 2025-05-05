
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  preferredContactMethod: "email" | "phone" | "whatsapp";
  vehicles: Vehicle[];
  notes: string;
  loyaltyPoints: number;
  lastServiceDate: string | null;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: string;
  licensePlate: string;
  type: "small" | "medium" | "large" | "suv" | "truck";
  color: string;
}

// Datos de ejemplo
let sampleClients: Client[] = [
  {
    id: "1",
    name: "Carlos Rodríguez",
    email: "carlos.rodriguez@example.com",
    phone: "+54 11 1234-5678",
    preferredContactMethod: "whatsapp",
    vehicles: [
      {
        id: "v1",
        make: "Toyota",
        model: "Corolla",
        year: "2020",
        licensePlate: "AB 123 CD",
        type: "medium",
        color: "Gris Plata"
      }
    ],
    notes: "Prefiere servicios los sábados por la mañana",
    loyaltyPoints: 120,
    lastServiceDate: "05/04/2025"
  },
  {
    id: "2",
    name: "María González",
    email: "maria.gonzalez@example.com",
    phone: "+54 11 8765-4321",
    preferredContactMethod: "email",
    vehicles: [
      {
        id: "v2",
        make: "Honda",
        model: "Civic",
        year: "2019",
        licensePlate: "XY 789 ZW",
        type: "medium",
        color: "Azul Marino"
      },
      {
        id: "v3",
        make: "Jeep",
        model: "Renegade",
        year: "2021",
        licensePlate: "CD 456 EF",
        type: "suv",
        color: "Rojo"
      }
    ],
    notes: "Alérgica a ciertos productos. Usar solo productos hipoalergénicos.",
    loyaltyPoints: 85,
    lastServiceDate: "28/04/2025"
  },
  {
    id: "3",
    name: "Juan Pérez",
    email: "juan.perez@example.com",
    phone: "+54 11 5555-1234",
    preferredContactMethod: "phone",
    vehicles: [
      {
        id: "v4",
        make: "Volkswagen",
        model: "Golf",
        year: "2018",
        licensePlate: "GH 222 IJ",
        type: "small",
        color: "Blanco"
      }
    ],
    notes: "Cliente frecuente. Siempre pide encerado extra.",
    loyaltyPoints: 200,
    lastServiceDate: "01/05/2025"
  },
  {
    id: "4",
    name: "Ana Martínez",
    email: "ana.martinez@example.com",
    phone: "+54 11 3333-7777",
    preferredContactMethod: "whatsapp",
    vehicles: [
      {
        id: "v5",
        make: "Ford",
        model: "Ranger",
        year: "2022",
        licensePlate: "KL 888 MN",
        type: "truck",
        color: "Negro"
      }
    ],
    notes: "",
    loyaltyPoints: 65,
    lastServiceDate: "20/04/2025"
  },
  {
    id: "5",
    name: "Roberto Fernández",
    email: "roberto.fernandez@example.com",
    phone: "+54 11 9876-2222",
    preferredContactMethod: "email",
    vehicles: [
      {
        id: "v6",
        make: "Chevrolet",
        model: "Cruze",
        year: "2020",
        licensePlate: "OP 555 QR",
        type: "medium",
        color: "Gris Oscuro"
      }
    ],
    notes: "Pide siempre protector de tablero extra",
    loyaltyPoints: 110,
    lastServiceDate: "10/04/2025"
  }
];

// Obtener todos los clientes
export const getClients = (): Client[] => {
  return sampleClients;
};

// Obtener un cliente por ID
export const getClientById = (id: string): Client | undefined => {
  return sampleClients.find(client => client.id === id);
};

// Buscar clientes por nombre
export const searchClientsByName = (query: string): Client[] => {
  if (!query) return sampleClients;
  const lowercaseQuery = query.toLowerCase();
  return sampleClients.filter(client => 
    client.name.toLowerCase().includes(lowercaseQuery)
  );
};

// Agregar un nuevo cliente
export const addClient = (client: Omit<Client, "id">): Client => {
  const newClient: Client = {
    ...client,
    id: Date.now().toString() + Math.floor(Math.random() * 1000).toString(),
  };
  
  sampleClients = [...sampleClients, newClient];
  return newClient;
};

// Actualizar puntos de fidelización
export const updateLoyaltyPoints = (clientId: string, points: number): Client | undefined => {
  const clientIndex = sampleClients.findIndex(client => client.id === clientId);
  
  if (clientIndex !== -1) {
    const updatedClient = {
      ...sampleClients[clientIndex],
      loyaltyPoints: sampleClients[clientIndex].loyaltyPoints + points
    };
    
    sampleClients = [
      ...sampleClients.slice(0, clientIndex),
      updatedClient,
      ...sampleClients.slice(clientIndex + 1)
    ];
    
    return updatedClient;
  }
  
  return undefined;
};

// Agregar un nuevo vehículo a un cliente
export const addVehicleToClient = (clientId: string, vehicle: Omit<Vehicle, "id">): Client | undefined => {
  const clientIndex = sampleClients.findIndex(client => client.id === clientId);
  
  if (clientIndex !== -1) {
    const newVehicle: Vehicle = {
      ...vehicle,
      id: Date.now().toString() + Math.floor(Math.random() * 1000).toString(),
    };
    
    const updatedClient = {
      ...sampleClients[clientIndex],
      vehicles: [...sampleClients[clientIndex].vehicles, newVehicle]
    };
    
    sampleClients = [
      ...sampleClients.slice(0, clientIndex),
      updatedClient,
      ...sampleClients.slice(clientIndex + 1)
    ];
    
    return updatedClient;
  }
  
  return undefined;
};

// Actualizar la fecha del último servicio
export const updateLastServiceDate = (clientId: string, date: string): Client | undefined => {
  const clientIndex = sampleClients.findIndex(client => client.id === clientId);
  
  if (clientIndex !== -1) {
    const updatedClient = {
      ...sampleClients[clientIndex],
      lastServiceDate: date
    };
    
    sampleClients = [
      ...sampleClients.slice(0, clientIndex),
      updatedClient,
      ...sampleClients.slice(clientIndex + 1)
    ];
    
    return updatedClient;
  }
  
  return undefined;
};
