export interface DeliveryOrder {
  id: string;
  name: string;
  estimatedMinutes: number;
  createdAt: number;
  received: boolean;
  receivedAt: number | null;
}
