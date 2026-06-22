import { useState, useEffect, useCallback } from "react";
import type { DeliveryOrder } from "@/types";
import {
  getRemainingMs,
  getRemainingRatio,
  getOverdueMs,
  isOverdue,
  getBarColor,
  getBarGlow,
} from "@/utils/delivery";
import { useDeliveryStore } from "@/store/deliveryStore";
import { Check, X, AlertTriangle } from "lucide-react";

interface DeliveryBarProps {
  order: DeliveryOrder;
}

function formatOverdueText(overdueMs: number): string {
  const totalSeconds = Math.floor(overdueMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `已超时 ${hours} 小时 ${minutes} 分`;
  }
  if (minutes > 0) {
    return `已超时 ${minutes} 分 ${seconds} 秒`;
  }
  return `已超时 ${seconds} 秒`;
}

function formatTimeText(
  remainingMs: number,
  overdueMs: number,
  name: string,
  received: boolean
): { main: string; sub: string } {
  if (received) {
    return {
      main: `${name} 已送达`,
      sub: "点击删除",
    };
  }
  if (overdueMs > 0) {
    return {
      main: `${name} 已超时`,
      sub: formatOverdueText(overdueMs),
    };
  }
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes > 0) {
    return {
      main: `${name} 正在路上`,
      sub: `预计还剩 ${minutes} 分 ${seconds} 秒`,
    };
  }
  return {
    main: `${name} 正在路上`,
    sub: `预计还剩 ${seconds} 秒`,
  };
}

export default function DeliveryBar({ order }: DeliveryBarProps) {
  const receiveOrder = useDeliveryStore((s) => s.receiveOrder);
  const removeOrder = useDeliveryStore((s) => s.removeOrder);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const updateNow = () => setNow(Date.now());
    const timer = setInterval(updateNow, 1000);
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        updateNow();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", updateNow);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", updateNow);
    };
  }, []);

  const remaining = getRemainingMs(
    { ...order, received: order.received, receivedAt: order.receivedAt },
    now
  );
  const overdue = getOverdueMs(order, now);
  const isOverdueOrder = isOverdue(order, now);
  const ratio = getRemainingRatio(order, now);
  const safeRatio = Math.max(0, ratio);
  const bgColor = getBarColor(safeRatio, order.received, isOverdueOrder);
  const glow = getBarGlow(safeRatio, order.received, isOverdueOrder);
  const { main: mainText, sub: subText } = formatTimeText(
    remaining,
    overdue,
    order.name,
    order.received
  );

  const handleClick = useCallback(() => {
    if (!order.received) {
      receiveOrder(order.id);
    }
  }, [order.received, order.id, receiveOrder]);

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      removeOrder(order.id);
    },
    [order.id, removeOrder]
  );

  const isUrgent = !order.received && (safeRatio < 0.25 || isOverdueOrder);

  return (
    <div
      onClick={handleClick}
      className={`
        group relative pl-4 pr-3 py-3 rounded-lg
        cursor-pointer select-none transition-all duration-500 ease-out
        ${order.received ? "opacity-60 hover:opacity-80" : "hover:translate-x-[-2px] active:translate-x-0"}
      `}
      style={{
        backgroundColor: bgColor,
        boxShadow: glow,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div
            className={`
              text-xs font-semibold tracking-wide truncate
              ${order.received ? "line-through text-white/50" : "text-white/95"}
              ${isUrgent && !order.received ? "animate-pulse" : ""}
            `}
          >
            {mainText}
          </div>
          <div
            className={`
              text-[11px] mt-0.5 truncate
              ${order.received ? "line-through text-white/30" : "text-white/70"}
              ${isUrgent && !order.received ? "animate-pulse font-medium" : ""}
            `}
          >
            {subText}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {order.received ? (
            <Check className="w-3.5 h-3.5 text-white/40" />
          ) : isOverdueOrder ? (
            <AlertTriangle className="w-3.5 h-3.5 text-white animate-pulse" />
          ) : (
            <div
              className={`
                w-1.5 h-1.5 rounded-full
                ${isUrgent ? "bg-white animate-pulse" : "bg-white/50"}
              `}
            />
          )}
          <button
            onClick={handleRemove}
            className="
              opacity-0 group-hover:opacity-100 transition-opacity duration-200
              flex items-center justify-center w-5 h-5 rounded
              bg-black/15 hover:bg-black/30 text-white/60 hover:text-white
            "
            aria-label="删除订单"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {!order.received && !isOverdueOrder && safeRatio > 0 && (
        <div
          className="absolute bottom-0 left-0 h-0.5 rounded-full bg-white/25 transition-all duration-1000 ease-linear"
          style={{ width: `${safeRatio * 100}%` }}
        />
      )}

      {isOverdueOrder && !order.received && (
        <div className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-white/40 animate-pulse" />
      )}
    </div>
  );
}
