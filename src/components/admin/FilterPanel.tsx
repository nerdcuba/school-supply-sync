
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { CalendarIcon, Filter, X } from 'lucide-react';
import { format } from 'date-fns';

interface FilterPanelProps {
  onFiltersChange: (filters: {
    startDate: Date | null;
    endDate: Date | null;
    school: string;
    status: string;
    orderId: string;
  }) => void;
  filters: {
    startDate: Date | null;
    endDate: Date | null;
    school: string;
    status: string;
    orderId: string;
  };
  schools: string[];
}

const FilterPanel = ({ onFiltersChange, filters, schools }: FilterPanelProps) => {
  const [isStartDateOpen, setIsStartDateOpen] = useState(false);
  const [isEndDateOpen, setIsEndDateOpen] = useState(false);

  const handleFilterChange = (key: string, value: any) => {
    // Convert "all" values back to empty strings for the filter logic
    const processedValue = value === "all" ? "" : value;
    onFiltersChange({
      ...filters,
      [key]: processedValue
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      startDate: null,
      endDate: null,
      school: '',
      status: '',
      orderId: ''
    });
  };

  const hasActiveFilters = filters.startDate || filters.endDate || filters.school || filters.status || filters.orderId;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter size={20} />
          Filtrado
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Fecha Inicio */}
          <div>
            <label className="text-sm font-medium mb-2 block">Fecha Inicio</label>
            <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.startDate ? format(filters.startDate, 'dd/MM/yyyy') : 'Seleccionar fecha'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.startDate || undefined}
                  onSelect={(date) => {
                    handleFilterChange('startDate', date || null);
                    setIsStartDateOpen(false);
                  }}
                  disabled={(date) => filters.endDate ? date > filters.endDate : false}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Fecha Fin */}
          <div>
            <label className="text-sm font-medium mb-2 block">Fecha Fin</label>
            <Popover open={isEndDateOpen} onOpenChange={setIsEndDateOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.endDate ? format(filters.endDate, 'dd/MM/yyyy') : 'Seleccionar fecha'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.endDate || undefined}
                  onSelect={(date) => {
                    handleFilterChange('endDate', date || null);
                    setIsEndDateOpen(false);
                  }}
                  disabled={(date) => filters.startDate ? date < filters.startDate : false}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Escuela */}
          <div>
            <label className="text-sm font-medium mb-2 block">Escuela</label>
            <Select value={filters.school || "all"} onValueChange={(value) => handleFilterChange('school', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todas las escuelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las escuelas</SelectItem>
                {schools.map((school) => (
                  <SelectItem key={school} value={school}>
                    {school}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Estado */}
          <div>
            <label className="text-sm font-medium mb-2 block">Estado</label>
            <Select value={filters.status || "all"} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="processing">Procesando</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ID de Orden */}
          <div>
            <label className="text-sm font-medium mb-2 block">ID de Orden</label>
            <Input
              placeholder="Buscar por ID..."
              value={filters.orderId}
              onChange={(e) => handleFilterChange('orderId', e.target.value)}
            />
          </div>
        </div>

        {/* Botón para limpiar filtros */}
        {hasActiveFilters && (
          <div className="mt-4 flex justify-between items-center">
            <Button variant="outline" onClick={clearAllFilters} className="flex items-center gap-2">
              <X size={16} />
              Limpiar Filtros
            </Button>
            <div className="text-sm text-muted-foreground">
              Filtros activos aplicados
            </div>
          </div>
        )}

        {/* Resumen de filtros activos */}
        {hasActiveFilters && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 font-medium mb-1">Filtros activos:</p>
            <div className="flex flex-wrap gap-2 text-xs text-blue-700">
              {filters.startDate && (
                <span className="bg-blue-100 px-2 py-1 rounded">
                  Desde: {format(filters.startDate, 'dd/MM/yyyy')}
                </span>
              )}
              {filters.endDate && (
                <span className="bg-blue-100 px-2 py-1 rounded">
                  Hasta: {format(filters.endDate, 'dd/MM/yyyy')}
                </span>
              )}
              {filters.school && (
                <span className="bg-blue-100 px-2 py-1 rounded">
                  Escuela: {filters.school}
                </span>
              )}
              {filters.status && (
                <span className="bg-blue-100 px-2 py-1 rounded">
                  Estado: {filters.status}
                </span>
              )}
              {filters.orderId && (
                <span className="bg-blue-100 px-2 py-1 rounded">
                  ID: {filters.orderId}
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FilterPanel;
