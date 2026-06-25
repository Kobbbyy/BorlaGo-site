import type { Booking, Job, WasteType } from "@/types";

export const wasteTypeMeta: Record<
  WasteType,
  { label: string; price: number; desc: string }
> = {
  general: { label: "General waste", price: 15, desc: "Household & mixed rubbish" },
  recycling: { label: "Recycling", price: 8, desc: "Paper, plastic, glass, metal" },
  organic: { label: "Organic / green", price: 10, desc: "Garden & food waste" },
  bulky: { label: "Bulky items", price: 35, desc: "Furniture & appliances" },
  hazardous: { label: "Hazardous", price: 45, desc: "Chemicals, batteries, e-waste" },
  construction: { label: "Construction", price: 60, desc: "Rubble & renovation debris" },
};

export const bookings: Booking[] = [
  {
    id: "1",
    reference: "BG-7741",
    wasteType: "general",
    address: "12 Independence Ave, Accra",
    date: "2026-06-22",
    window: "08:00 – 10:00",
    status: "en-route",
    price: 15,
    collector: "Kojo Asante",
    bags: 4,
  },
  {
    id: "2",
    reference: "BG-7702",
    wasteType: "recycling",
    address: "12 Independence Ave, Accra",
    date: "2026-06-24",
    window: "13:00 – 15:00",
    status: "scheduled",
    price: 8,
    collector: "Ama Owusu",
    bags: 2,
  },
  {
    id: "3",
    reference: "BG-7688",
    wasteType: "bulky",
    address: "8 Cantonments Rd, Accra",
    date: "2026-06-26",
    window: "10:00 – 12:00",
    status: "pending",
    price: 35,
    bags: 1,
  },
  {
    id: "4",
    reference: "BG-7610",
    wasteType: "organic",
    address: "12 Independence Ave, Accra",
    date: "2026-06-18",
    window: "08:00 – 10:00",
    status: "completed",
    price: 10,
    collector: "Kojo Asante",
    bags: 3,
  },
  {
    id: "5",
    reference: "BG-7588",
    wasteType: "general",
    address: "12 Independence Ave, Accra",
    date: "2026-06-15",
    window: "15:00 – 17:00",
    status: "completed",
    price: 15,
    collector: "Yaw Boateng",
    bags: 5,
  },
];

export const jobs: Job[] = [
  {
    id: "j1",
    reference: "BG-7741",
    customer: "Alex Mensah",
    address: "12 Independence Ave, Accra",
    distanceKm: 2.4,
    wasteType: "general",
    window: "08:00 – 10:00",
    status: "en-route",
    payout: 9,
    bags: 4,
  },
  {
    id: "j2",
    reference: "BG-7755",
    customer: "Nana Adjei",
    address: "5 Oxford St, Osu",
    distanceKm: 4.1,
    wasteType: "recycling",
    window: "10:00 – 12:00",
    status: "scheduled",
    payout: 6,
    bags: 2,
  },
  {
    id: "j3",
    reference: "BG-7760",
    customer: "Efua Sarpong",
    address: "21 Spintex Rd, Accra",
    distanceKm: 6.7,
    wasteType: "bulky",
    window: "13:00 – 15:00",
    status: "pending",
    payout: 22,
    bags: 1,
  },
];

export const statusMeta: Record<
  Booking["status"],
  { label: string; tone: "muted" | "info" | "warning" | "success" | "destructive" }
> = {
  pending: { label: "Pending", tone: "muted" },
  scheduled: { label: "Scheduled", tone: "info" },
  "en-route": { label: "En route", tone: "warning" },
  "in-progress": { label: "In progress", tone: "warning" },
  completed: { label: "Completed", tone: "success" },
  cancelled: { label: "Cancelled", tone: "destructive" },
};

export const revenueSeries = [
  { name: "Mon", value: 2400 },
  { name: "Tue", value: 3100 },
  { name: "Wed", value: 2800 },
  { name: "Thu", value: 3600 },
  { name: "Fri", value: 4200 },
  { name: "Sat", value: 5100 },
  { name: "Sun", value: 3400 },
];

export const wasteSplit = [
  { name: "General", value: 42 },
  { name: "Recycling", value: 28 },
  { name: "Organic", value: 18 },
  { name: "Bulky", value: 12 },
];
