
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/services/orderService';
import { useToast } from '@/hooks/use-toast';

interface UseRealtimeOrdersProps {
  onOrdersUpdate?: (orders: Order[]) => void;
  isAdmin?: boolean;
}

export const useRealtimeOrders = ({ onOrdersUpdate, isAdmin = false }: UseRealtimeOrdersProps) => {
  const { toast } = useToast();

  useEffect(() => {
    console.log('🔔 Configurando subscripción realtime para órdenes...');
    
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Escuchar todos los eventos (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('🔄 Cambio detectado en órdenes:', payload);
          
          // Notificar al usuario sobre el cambio
          if (payload.eventType === 'UPDATE' && !isAdmin) {
            toast({
              title: "Orden actualizada",
              description: "El estado de una de tus órdenes ha sido actualizado",
            });
          }
          
          // Disparar callback para actualizar datos
          if (onOrdersUpdate) {
            // Esperar un poco para que la base de datos se actualice completamente
            setTimeout(() => {
              onOrdersUpdate([]);
            }, 500);
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Estado de subscripción realtime:', status);
      });

    return () => {
      console.log('🔌 Desconectando subscripción realtime de órdenes');
      supabase.removeChannel(channel);
    };
  }, [onOrdersUpdate, isAdmin, toast]);
};
