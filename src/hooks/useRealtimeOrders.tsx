
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
    
    // Create unique channel name
    const channelName = `orders-realtime-${isAdmin ? 'admin' : 'user'}-${Math.random().toString(36).substr(2, 9)}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log(`🔄 Cambio detectado en órdenes:`, payload);
          
          // Mostrar notificación para usuarios (no admin)
          if (payload.eventType === 'UPDATE' && !isAdmin) {
            const newRecord = payload.new as any;
            if (newRecord?.status) {
              toast({
                title: "Estado de orden actualizado",
                description: `Tu orden ha sido actualizada a: ${newRecord.status}`,
              });
            }
          }
          
          // Trigger update callback
          if (onOrdersUpdate) {
            console.log('📞 Llamando callback de actualización');
            onOrdersUpdate();
          }
        }
      )
      .subscribe((status) => {
        console.log(`📡 Estado de subscripción realtime:`, status);
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        console.log(`🔌 Desconectando subscripción realtime`);
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [onOrdersUpdate, isAdmin, toast]);
};
