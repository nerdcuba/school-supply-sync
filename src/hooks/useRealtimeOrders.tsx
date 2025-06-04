
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/services/orderService';
import { useToast } from '@/hooks/use-toast';

interface UseRealtimeOrdersProps {
  onOrdersUpdate?: () => void;
  isAdmin?: boolean;
}

export const useRealtimeOrders = ({ onOrdersUpdate, isAdmin = false }: UseRealtimeOrdersProps) => {
  const { toast } = useToast();
  const channelRef = useRef<any>(null);

  useEffect(() => {
    // Cleanup existing channel first
    if (channelRef.current) {
      console.log('🧹 Limpiando canal existente');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    console.log(`🔔 Configurando subscripción realtime para órdenes (${isAdmin ? 'admin' : 'user'})...`);
    
    // Create unique channel name to avoid conflicts
    const channelName = `orders-changes-${isAdmin ? 'admin' : 'user'}-${Date.now()}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*', // Escuchar todos los eventos (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log(`🔄 Cambio detectado en órdenes (${isAdmin ? 'admin' : 'user'}):`, payload);
          
          // Notificar al usuario sobre el cambio solo si no es admin
          if (payload.eventType === 'UPDATE' && !isAdmin) {
            toast({
              title: "Orden actualizada",
              description: "El estado de una de tus órdenes ha sido actualizado",
            });
          }
          
          // Disparar callback para actualizar datos con un pequeño delay
          if (onOrdersUpdate) {
            setTimeout(() => {
              onOrdersUpdate();
            }, 100);
          }
        }
      )
      .subscribe((status) => {
        console.log(`📡 Estado de subscripción realtime (${isAdmin ? 'admin' : 'user'}):`, status);
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        console.log(`🔌 Desconectando subscripción realtime de órdenes (${isAdmin ? 'admin' : 'user'})`);
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [onOrdersUpdate, isAdmin, toast]);
};
