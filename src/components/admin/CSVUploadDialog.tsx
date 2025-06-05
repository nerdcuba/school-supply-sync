
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Upload } from 'lucide-react';
import { SupplyItem } from '@/services/adminSupplyPackService';

interface CSVUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onItemsUploaded: (items: SupplyItem[]) => void;
  packName: string;
}

const CSVUploadDialog = ({ open, onOpenChange, onItemsUploaded, packName }: CSVUploadDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
    } else {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo CSV válido",
        variant: "destructive"
      });
    }
  };

  const parseCSV = (text: string): SupplyItem[] => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const items: SupplyItem[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Formato simple: cada línea es un artículo
      const name = line;
      
      if (name) {
        items.push({
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${i}`,
          name,
          quantity: 1, // Cantidad por defecto
          category: 'General' // Categoría por defecto
        });
      }
    }
    
    return items;
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo CSV",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const text = await file.text();
      const items = parseCSV(text);
      
      if (items.length === 0) {
        toast({
          title: "Error",
          description: "No se encontraron artículos válidos en el archivo CSV",
          variant: "destructive"
        });
        return;
      }
      
      onItemsUploaded(items);
      onOpenChange(false);
      setFile(null);
      
      toast({
        title: "Archivo CSV cargado",
        description: `Se cargaron ${items.length} artículos correctamente`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al procesar el archivo CSV",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Subir CSV de Artículos</DialogTitle>
          <p className="text-sm text-gray-600">
            Sube un archivo CSV para agregar artículos al paquete "{packName}"
          </p>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="csv-file">Archivo CSV</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
            />
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg text-sm">
            <p className="font-medium mb-2">Formato esperado del CSV:</p>
            <code className="block bg-white p-2 rounded text-xs">
              Lápices #2<br/>
              Cuadernos<br/>
              Borradores<br/>
              Tijeras<br/>
              Pegamento
            </code>
            <p className="mt-2 text-xs text-gray-600">
              • Cada línea debe contener un artículo<br/>
              • La cantidad será 1 por defecto<br/>
              • La categoría será "General" por defecto
            </p>
          </div>
          
          {file && (
            <div className="text-sm text-green-600">
              ✓ Archivo seleccionado: {file.name}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleUpload} disabled={!file || loading}>
            <Upload size={16} className="mr-2" />
            {loading ? "Cargando..." : "Subir CSV"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CSVUploadDialog;
