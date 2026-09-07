import type { AccountStatus, EntityStatus, ID, ISODateString } from "./common";

export type BusStatus = "active" | "maintenance" | "inactive";

export interface Bus {
  id: ID;
  busNumber: string;
  registrationNumber: string;
  routeId?: ID;
  routeName?: string;
  conductorId?: ID;
  conductorName?: string;
  capacity: number;
  status: BusStatus;
  createdAt: ISODateString;
}

export interface RouteStop {
  name: string;
  /** Zero-based order along the route. */
  order: number;
}

export interface TransportRoute {
  id: ID;
  code: string;
  name: string;
  origin: string;
  destination: string;
  stops: RouteStop[];
  distanceKm: number;
  /** Currently active base fare, resolved from fare management. */
  fare: number;
  status: EntityStatus;
  createdAt: ISODateString;
}

export interface Conductor {
  id: ID;
  staffNumber: string;
  name: string;
  contact: string;
  email?: string;
  busId?: ID;
  busNumber?: string;
  status: AccountStatus;
  tripsProcessed: number;
  lastActiveAt?: ISODateString;
  createdAt: ISODateString;
}

export type FareCategory = "staff";

/**
 * Fares are owned by the backend. The Flutter conductor app must always
 * resolve the fare from the API — never from a local constant.
 */
export interface Fare {
  id: ID;
  name: string;
  routeId: ID;
  routeName: string;
  category: FareCategory;
  amount: number;
  status: EntityStatus;
  effectiveFrom: ISODateString;
  effectiveTo?: ISODateString;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}
