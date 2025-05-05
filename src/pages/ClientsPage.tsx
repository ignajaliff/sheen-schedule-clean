
import { useState, useEffect } from "react";
import { PlusIcon, Search, UserRound, Car, Gift, Calendar, Phone, Mail, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { getClients, searchClientsByName, Client } from "@/services/clientService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const ClientsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  useEffect(() => {
    if (searchTerm) {
      setClients(searchClientsByName(searchTerm));
    } else {
      setClients(getClients());
    }
  }, [searchTerm]);
  
  const openClientDetails = (client: Client) => {
    setSelectedClient(client);
  };

  const getContactMethodIcon = (method: string) => {
    switch (method) {
      case 'email':
        return <Mail size={16} className="text-blue-500" />;
      case 'phone':
        return <Phone size={16} className="text-green-500" />;
      case 'whatsapp':
        return <MessageSquare size={16} className="text-green-600" />;
      default:
        return <Mail size={16} />;
    }
  };

  return (
    <div className="pb-20 md:pb-5 md:pl-20">
      <Header title="Clientes" />
      
      <main className="pt-20 px-4 max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Buscar cliente..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          {clients.length > 0 ? (
            clients.map((client) => (
              <Card 
                key={client.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => openClientDetails(client)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <UserRound className="text-cleanly-blue" size={20} />
                      <CardTitle className="text-lg">{client.name}</CardTitle>
                    </div>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                      {client.loyaltyPoints} pts
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      {getContactMethodIcon(client.preferredContactMethod)}
                      <span>
                        {client.preferredContactMethod === 'email' 
                          ? client.email 
                          : client.phone}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {client.vehicles.map((vehicle) => (
                        <div key={vehicle.id} className="flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1 text-xs">
                          <Car size={14} />
                          <span>{vehicle.make} {vehicle.model}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} className="text-gray-500" />
                        <span>Último servicio: {client.lastServiceDate || 'Ninguno'}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-10 text-gray-500 col-span-2">
              <p className="text-lg">No se encontraron clientes</p>
              <p className="text-sm">Intenta con otra búsqueda o agrega un nuevo cliente</p>
            </div>
          )}
        </div>
        
        <Button 
          className="fixed right-4 bottom-20 md:bottom-4 bg-cleanly-blue hover:bg-blue-700 shadow-lg rounded-full w-14 h-14 p-0"
          onClick={() => setIsFormOpen(true)}
        >
          <PlusIcon size={24} />
        </Button>
        
        {/* Modal para ver detalles del cliente */}
        <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
          {selectedClient && (
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center gap-2">
                  <UserRound size={20} />
                  {selectedClient.name}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-5 mt-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="gap-1 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100">
                      <Gift size={14} />
                      <span>{selectedClient.loyaltyPoints} puntos de fidelidad</span>
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    <span>Cliente desde: Enero 2023</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Información de contacto</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-gray-400" />
                        <span>{selectedClient.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={16} className="text-gray-400" />
                        <span>{selectedClient.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Método preferido:</span>
                        <div className="flex items-center gap-1">
                          {getContactMethodIcon(selectedClient.preferredContactMethod)}
                          <span className="capitalize">{selectedClient.preferredContactMethod}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Último servicio</h3>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" />
                      <span>{selectedClient.lastServiceDate || 'Sin servicios previos'}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Vehículos</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {selectedClient.vehicles.map((vehicle) => (
                      <div key={vehicle.id} className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
                        <div>
                          <div className="font-medium">{vehicle.make} {vehicle.model} ({vehicle.year})</div>
                          <div className="text-sm text-gray-500 flex items-center gap-2">
                            <span>{vehicle.licensePlate}</span>
                            <span>•</span>
                            <span className="capitalize">{vehicle.type}</span>
                            <span>•</span>
                            <span>{vehicle.color}</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Editar</Button>
                      </div>
                    ))}
                  </div>
                </div>
                
                {selectedClient.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Notas</h3>
                    <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 text-sm">
                      {selectedClient.notes}
                    </div>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Historial de servicios</h3>
                  <div className="text-center py-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Próximamente: Historial completo de servicios</p>
                  </div>
                </div>
              </div>
              
              <DialogFooter className="gap-2 sm:gap-0">
                <Button 
                  variant="outline" 
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                  onClick={() => {}}
                >
                  Agregar vehículo
                </Button>
                <Button 
                  className="bg-cleanly-blue hover:bg-blue-700"
                  onClick={() => {}}
                >
                  Nuevo turno
                </Button>
              </DialogFooter>
            </DialogContent>
          )}
        </Dialog>
        
        {/* TODO: Formulario para nuevo cliente */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Nuevo Cliente</DialogTitle>
            </DialogHeader>
            
            <div className="py-4 text-center">
              <p className="text-gray-500">Próximamente: Formulario de creación de clientes</p>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
              <Button onClick={() => setIsFormOpen(false)}>Crear Cliente</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default ClientsPage;
