import { useState } from "react";
import { useDeliveryStore } from "@/store/deliveryStore";
import { Plus, Repeat } from "lucide-react";

export default function AddOrderForm() {
  const addOrder = useDeliveryStore((s) => s.addOrder);
  const repeatLastOrder = useDeliveryStore((s) => s.repeatLastOrder);
  const getLastOrder = useDeliveryStore((s) => s.getLastOrder);
  const [name, setName] = useState("");
  const [minutes, setMinutes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const parsedMinutes = parseInt(minutes, 10);
    if (!trimmedName || isNaN(parsedMinutes) || parsedMinutes <= 0) return;
    addOrder(trimmedName, parsedMinutes);
    setName("");
    setMinutes("");
  };

  const handleRepeat = () => {
    repeatLastOrder();
  };

  const hasLastOrder = getLastOrder() !== null;
  const lastOrder = getLastOrder();

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="外卖名称"
            className="
              flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10
              text-white placeholder-white/30 text-xs
              focus:outline-none focus:border-blue-500/50 focus:bg-white/8
              transition-all duration-200
            "
          />
          <input
            type="number"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            placeholder="分钟"
            min="1"
            className="
              w-16 px-2 py-2 rounded-lg bg-white/5 border border-white/10
              text-white placeholder-white/30 text-xs text-center
              focus:outline-none focus:border-blue-500/50 focus:bg-white/8
              transition-all duration-200
              [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
            "
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="
              flex-1 flex items-center justify-center gap-1.5 px-3 py-2
              rounded-lg bg-blue-600 hover:bg-blue-500
              text-white text-xs font-semibold
              transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25
              active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed
            "
            disabled={!name.trim() || !minutes || parseInt(minutes, 10) <= 0}
          >
            <Plus className="w-3.5 h-3.5" />
            添加
          </button>
          <button
            type="button"
            onClick={handleRepeat}
            disabled={!hasLastOrder}
            title={lastOrder ? `重复「${lastOrder.name}」${lastOrder.estimatedMinutes}分钟` : "暂无历史订单"}
            className="
              flex items-center justify-center gap-1.5 px-3 py-2
              rounded-lg bg-white/5 border border-white/10
              text-white/70 hover:text-white hover:bg-white/10
              text-xs font-medium
              transition-all duration-200
              active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed
            "
          >
            <Repeat className="w-3.5 h-3.5" />
            重复
          </button>
        </div>
      </div>
    </form>
  );
}
