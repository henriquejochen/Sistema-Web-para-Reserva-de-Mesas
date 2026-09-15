import type { RestaurantTable } from "../types/table";
import type { AreaPreference } from "../types/reservation";

export const restaurantTables: RestaurantTable[] = [
  { number: 1, capacity: 2, area: "interna", column: "1", row: "1" },
  { number: 2, capacity: 2, area: "interna", column: "1", row: "2" },
  { number: 3, capacity: 4, area: "interna", column: "1 / span 2", row: "3" },
  { number: 4, capacity: 4, area: "interna", column: "1 / span 2", row: "4" },
  { number: 5, capacity: 4, area: "interna", column: "1 / span 2", row: "5" },
  { number: 6, capacity: 4, area: "interna", column: "1 / span 2", row: "6" },
  { number: 15, capacity: 4, area: "interna", column: "4", row: "3" },
  { number: 16, capacity: 4, area: "interna", column: "4", row: "4" },
  { number: 7, capacity: 2, area: "interna", column: "3", row: "5" },
  { number: 8, capacity: 2, area: "interna", column: "4", row: "5" },
  { number: 9, capacity: 2, area: "interna", column: "3", row: "6" },
  { number: 10, capacity: 2, area: "interna", column: "4", row: "6" },
  { number: 11, capacity: 2, area: "interna", column: "3", row: "7" },
  { number: 12, capacity: 2, area: "interna", column: "4", row: "7" },
  { number: 13, capacity: 4, area: "externa", column: "1 / span 2", row: "9" },
  { number: 14, capacity: 4, area: "externa", column: "3 / span 2", row: "9" },
];

export const areaOptions: { value: AreaPreference; label: string; icon: string; desc: string }[] = [
  { value: "interna", label: "Interno", icon: "🏠", desc: "Salão interno, climatizado" },
  { value: "externa", label: "Rua", icon: "🌿", desc: "Área externa, ao ar livre" },
  { value: "any", label: "Sem preferência", icon: "✨", desc: "O restaurante escolhe" },
];

export const allSlots = [
  "18:00", "18:30", "19:00", "19:30", "20:00",
  "20:30", "21:00", "21:30", "22:00", "22:30",
];

export const fullSlots = new Set(["19:30", "18:00"]);
