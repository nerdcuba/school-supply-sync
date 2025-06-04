
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, Filter, X } from 'lucide-react';
import { format, isAfter, isBefore, isEqual } from 'date-fns';

interface DateRangeFilterProps {
  onDateRangeChange: (startDate: Date | null, endDate: Date | null) => void;
  startDate: Date | null;
  endDate: Date | null;
}

const DateRangeFilter = ({ onDateRangeChange, startDate, endDate }: DateRangeFilterProps) => {
  const [isStartDateOpen, setIsStartDateOpen] = useState(false);
  const [isEndDateOpen, setIsEndDateOpen] = useState(false);

  const handleStartDateChange = (date: Date | undefined) => {
    onDateRangeChange(date || null, endDate);
    setIsStartDateOpen(false);
  };

  const handleEndDateChange = (date: Date | undefined) => {
    onDateRangeChange(startDate, date || null);
    setIsEndDateOpen(false);
  };

  const clearFilters = () => {
    onDateRangeChange(null, null);
  };

  const hasActiveFilters = startDate || endDate;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter size={20} />
          Filtrar por Fechas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Fecha Inicio</label>
            <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'dd/MM/yyyy') : 'Seleccionar fecha'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate || undefined}
                  onSelect={handleStartDateChange}
                  disabled={(date) => endDate ? isAfter(date, endDate) : false}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Fecha Fin</label>
            <Popover open={isEndDateOpen} onOpenChange={setIsEndDateOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, 'dd/MM/yyyy') : 'Seleccionar fecha'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate || undefined}
                  onSelect={handleEndDateChange}
                  disabled={(date) => startDate ? isBefore(date, startDate) : false}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {hasActiveFilters && (
            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2">
                <X size={16} />
                Limpiar
              </Button>
            </div>
          )}
        </div>

        {hasActiveFilters && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              Filtros activos: 
              {startDate && ` Desde ${format(startDate, 'dd/MM/yyyy')}`}
              {endDate && ` Hasta ${format(endDate, 'dd/MM/yyyy')}`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DateRangeFilter;
