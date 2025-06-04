
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
  const isSubscribedRef = useRef(false);

  useEffect(() => {
    const setupRealtimeSubscription = async () => {
      // Verificar autenticación antes de configurar realtime
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.log('❌ No hay usuario autenticado, no se configura realtime');
        return;
      }

      // Cleanup existing channel first
      if (channelRef.current && isSubscribedRef.current) {
        console.log('🧹 Limpiando canal existente');
        await supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
      }

      console.log(`🔔 Configurando subscripción realtime para órdenes (${isAdmin ? 'admin' : 'user'})...`);
      
      // Create unique channel name with timestamp to avoid conflicts
      const channelName = `orders-${isAdmin ? 'admin' : 'user'}-${user.id}-${Date.now()}`;
      
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'orders'
          },
          (payload) => {
            console.log(`🔄 Cambio UPDATE detectado en órdenes:`, payload);
            
            // Mostrar notificación para usuarios (no admin)
            if (!isAdmin) {
              const newRecord = payload.new as any;
              if (newRecord?.status && newRecord?.user_id === user.id) {
                toast({
                  title: "Estado de orden actualizado",
                  description: `Tu orden ha sido actualizada a: ${newRecord.status}`,
                });
              }
            }
            
            // Trigger update callback with a small delay to ensure consistency
            if (onOrdersUpdate) {
              console.log('📞 Llamando callback de actualización');
              setTimeout(onOrdersUpdate, 100);
            }
          }
        )
        .subscribe((status) => {
          console.log(`📡 Estado de subscripción realtime:`, status);
          if (status === 'SUBSCRIBED') {
            isSubscribedRef.current = true;
            console.log('✅ Realtime subscripción establecida correctamente');
          }
        });

      channelRef.current = channel;
    };

    setupRealtimeSubscription().catch(error => {
      console.error('Error configurando realtime:', error);
    });

    return () => {
      if (channelRef.current && isSubscribedRef.current) {
        console.log(`🔌 Desconectando subscripción realtime`);
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
      }
    };
  }, [isAdmin, toast]); // Removí onOrdersUpdate de las dependencias para evitar recreaciones constantes
};
