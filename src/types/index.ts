export type Role = "user" | "collector" | "admin";

export interface Account {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  phone?: string;
  address?: string;
}

export type BookingStatus =
  | "pending"
  | "scheduled"
  | "en-route"
  | "in-progress"
  | "completed"
  | "cancelled";

export type WasteType =
  | "general"
  | "recycling"
  | "organic"
  | "bulky"
  | "hazardous"
  | "construction";

export interface Booking {
  id: string;
  reference: string;
  wasteType: WasteType;
  address: string;
  date: string;
  window: string;
  status: BookingStatus;
  price: number;
  collector?: string;
  notes?: string;
  bags?: number;
}

export interface Job {
  id: string;
  reference: string;
  customer: string;
  address: string;
  distanceKm: number;
  wasteType: WasteType;
  window: string;
  status: BookingStatus;
  payout: number;
  bags: number;
}
