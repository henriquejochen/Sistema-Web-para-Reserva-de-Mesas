export type TableStatus = "Disponível" | "Reservada" | "Ocupada";

export type RestaurantTable = {
  number: number;
  capacity: 2 | 4;
  area: "interna" | "externa";
  column: string;
  row: string;
};
