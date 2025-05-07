
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getServices, updateServicePrice, Service } from "@/services/serviceService";
import { toast } from "sonner";
import Header from "@/components/Header";

const ServicesPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<string>("");
  
  useEffect(() => {
    loadServices();
  }, []);
  
  const loadServices = async () => {
    setLoading(true);
    const servicesData = await getServices();
    setServices(servicesData);
    setLoading(false);
  };
  
  const handleEditClick = (service: Service) => {
    setEditingId(service.id);
    setEditPrice(service.price.toString());
  };
  
  const handleSaveClick = async (serviceId: string) => {
    const numericPrice = Number(editPrice.replace(/\D/g, ''));
    
    if (isNaN(numericPrice) || numericPrice <= 0) {
      toast.error("Por favor ingrese un precio válido");
      return;
    }
    
    const updatedService = await updateServicePrice(serviceId, numericPrice);
    
    if (updatedService) {
      toast.success("Precio actualizado correctamente");
      setEditingId(null);
      setEditPrice("");
      loadServices();
    }
  };
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
  };
  
  return (
    <div className="pb-20 md:pb-5 md:pl-20">
      <Header title="Servicios y Valores" />
      
      <main className="pt-20 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Lista de Servicios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              {loading ? (
                <div className="p-8 text-center">Cargando servicios...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Servicio</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead className="w-[100px]">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center h-24">
                          No hay servicios disponibles
                        </TableCell>
                      </TableRow>
                    ) : (
                      services.map((service) => (
                        <TableRow key={service.id}>
                          <TableCell className="font-medium">{service.name}</TableCell>
                          <TableCell>
                            {editingId === service.id ? (
                              <div className="flex gap-2">
                                <Input
                                  value={editPrice}
                                  onChange={(e) => setEditPrice(e.target.value)}
                                  className="w-32"
                                  placeholder="Nuevo precio"
                                />
                              </div>
                            ) : (
                              formatPrice(service.price)
                            )}
                          </TableCell>
                          <TableCell>
                            {editingId === service.id ? (
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setEditingId(null)}
                                >
                                  Cancelar
                                </Button>
                                <Button 
                                  size="sm"
                                  onClick={() => handleSaveClick(service.id)}
                                >
                                  Guardar
                                </Button>
                              </div>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditClick(service)}
                              >
                                Editar
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ServicesPage;
