import type { ID, ISODateString } from "./common";

export type TripStatus = "completed" | "in_progress" | "failed" | "cancelled";

export interface Trip {
  id: ID;
  reference: string;
  passengerId: ID;
  passengerName: string;
  accountId: ID;
  qrId: ID;
  busId: ID;
  busNumber: string;
  conductorId: ID;
  conductorName: string;
  routeId: ID;
  routeName: string;
  boardingStop: string;
  destinationStop: string;
  fare: number;
  status: TripStatus;
  /** Reason returned by the backend when a scan is rejected. */
  failureReason?: string;
  createdAt: ISODateString;
}
