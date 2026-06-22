import { useDeliveryStore } from "@/store/deliveryStore";
import DeliveryBar from "@/components/DeliveryBar";
import AddOrderForm from "@/components/AddOrderForm";
import { Truck, ChefHat, Clock } from "lucide-react";

export default function Home() {
  const orders = useDeliveryStore((s) => s.orders);
  const activeOrders = orders.filter((o) => !o.received);
  const receivedOrders = orders.filter((o) => o.received);

  return (
    <div className="min-h-screen bg-[#0F172A] flex">
      <div className="flex-1 flex flex-col items-center justify-center px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-blue-500 blur-3xl" />
          <div className="absolute bottom-20 right-40 w-80 h-80 rounded-full bg-orange-500 blur-3xl" />
        </div>

        <div className="relative z-10 text-center max-w-md">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-orange-500/20 border border-white/10">
              <ChefHat className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-3">
            外卖追踪
          </h1>
          <p className="text-white/40 text-lg mb-8">
            不用反复解锁手机，一眼看到还有多久到
          </p>

          <div className="flex items-center justify-center gap-6 text-white/30 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>实时倒计时</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              <span>多单并行追踪</span>
            </div>
          </div>
        </div>
      </div>

      <aside className="w-80 min-h-screen bg-[#0B1120] border-l border-white/5 flex flex-col">
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <Truck className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-semibold text-white/70">
              追踪面板
            </h2>
          </div>
          <AddOrderForm />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activeOrders.length === 0 && receivedOrders.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-white/15">
              <Truck className="w-10 h-10 mb-3" />
              <p className="text-sm">还没有外卖订单</p>
              <p className="text-xs mt-1">在上方添加一单吧</p>
            </div>
          )}

          {activeOrders.length > 0 && (
            <div className="flex flex-col gap-2.5 mb-4">
              {activeOrders.map((order) => (
                <DeliveryBar key={order.id} order={order} />
              ))}
            </div>
          )}

          {receivedOrders.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="text-xs text-white/25 font-medium px-1 mb-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                已签收
              </div>
              {receivedOrders.map((order) => (
                <DeliveryBar key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
