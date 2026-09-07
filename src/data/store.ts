/**
 * In-memory mock store. Used while `NEXT_PUBLIC_API_URL` is empty so the
 * portals can be exercised end-to-end. Mutations persist for the lifetime of
 * the tab. Swap every service to `apiRequest` when the shared backend is ready.
 */

import { appConfig } from "@/config/app";
import type {
  AuthSession,
  Bus,
  Conductor,
  Fare,
  Passenger,
  PassengerDetail,
  PassengerIdentity,
  QRAccount,
  QueryParams,
  Transaction,
  TransportAccount,
  TransportRoute,
  Trip,
  User,
} from "@/types";

const NOW = "2026-09-03T13:40:00.000Z";

function iso(daysAgo: number, hour = 9, minute = 0) {
  const date = new Date("2026-09-03T00:00:00.000Z");
  date.setUTCDate(date.getUTCDate() - daysAgo);
  date.setUTCHours(hour, minute, 0, 0);
  return date.toISOString();
}

export const users: User[] = [
  {
    id: "usr_super",
    name: "Dr Fatmata Koroma",
    email: "super@health.gov.sl",
    phone: "+232 76 100 001",
    role: "super_admin",
    status: "active",
    createdAt: iso(500),
  },
  {
    id: "usr_admin",
    name: "Ibrahim Koroma",
    email: "admin@health.gov.sl",
    phone: "+232 76 110 001",
    role: "admin",
    status: "active",
    createdAt: iso(420),
  },
  {
    id: "usr_officer",
    name: "Kadiatu Turay",
    email: "office@health.gov.sl",
    phone: "+232 76 220 018",
    role: "officer",
    status: "active",
    createdAt: iso(200),
  },
  {
    id: "usr_staff",
    name: "Aminata Sesay",
    email: "staff@health.gov.sl",
    phone: "+232 76 441 208",
    role: "passenger",
    status: "active",
    createdAt: iso(210),
  },
];

export const passengers: Passenger[] = [
  {
    id: "psg_001",
    userId: "usr_staff",
    accountId: "acc_001",
    qrId: "qr_001",
    name: "Aminata Sesay",
    email: "staff@health.gov.sl",
    phone: "+232 76 441 208",
    staffNumber: "MOH-SL-004182",
    designation: "Community Health Officer",
    facility: "Connaught Hospital",
    status: "active",
    createdAt: iso(210),
  },
  {
    id: "psg_002",
    userId: "usr_002",
    accountId: "acc_002",
    qrId: "qr_002",
    name: "Mohamed Bangura",
    email: "m.bangura@health.gov.sl",
    phone: "+232 78 220 114",
    staffNumber: "MOH-SL-003901",
    designation: "Registered Nurse",
    facility: "Princess Christian Maternity Hospital",
    status: "active",
    createdAt: iso(180),
  },
  {
    id: "psg_003",
    userId: "usr_003",
    accountId: "acc_003",
    qrId: "qr_003",
    name: "Fatmata Kamara",
    email: "f.kamara@health.gov.sl",
    phone: "+232 77 903 441",
    staffNumber: "MOH-SL-005017",
    designation: "Medical Laboratory Scientist",
    facility: "Ola During Children's Hospital",
    status: "active",
    createdAt: iso(140),
  },
  {
    id: "psg_004",
    userId: "usr_004",
    accountId: "acc_004",
    qrId: "qr_004",
    name: "Sahr Lamin",
    email: "s.lamin@health.gov.sl",
    phone: "+232 76 118 902",
    staffNumber: "MOH-SL-002774",
    designation: "Driver / Logistics",
    facility: "Bo Government Hospital",
    status: "suspended",
    createdAt: iso(300),
  },
  {
    id: "psg_005",
    userId: "usr_005",
    accountId: "acc_005",
    qrId: "qr_005",
    name: "Isatu Conteh",
    email: "i.conteh@health.gov.sl",
    phone: "+232 79 554 018",
    staffNumber: "MOH-SL-006221",
    designation: "Midwife",
    facility: "Kenema Government Hospital",
    status: "active",
    createdAt: iso(90),
  },
  {
    id: "psg_006",
    userId: "usr_006",
    accountId: "acc_006",
    qrId: "qr_006",
    name: "Abu Bakarr Turay",
    email: "a.turay@health.gov.sl",
    phone: "+232 76 330 771",
    staffNumber: "MOH-SL-001448",
    designation: "Pharmacist",
    facility: "Makeni Regional Hospital",
    status: "active",
    createdAt: iso(60),
  },
  {
    id: "psg_007",
    userId: "usr_007",
    accountId: "acc_007",
    qrId: "qr_007",
    name: "Zainab Jalloh",
    email: "z.jalloh@health.gov.sl",
    phone: "+232 78 441 009",
    staffNumber: "MOH-SL-007104",
    designation: "Public Health Sister",
    facility: "Lumley Government Hospital",
    status: "pending",
    createdAt: iso(4),
  },
  {
    id: "psg_008",
    userId: "usr_008",
    accountId: "acc_008",
    qrId: "qr_008",
    name: "Joseph Kargbo",
    email: "j.kargbo@health.gov.sl",
    phone: "+232 77 210 663",
    staffNumber: "MOH-SL-003355",
    designation: "Environmental Health Officer",
    facility: "Youyi Building Headquarters",
    status: "active",
    createdAt: iso(250),
  },
];

export const identities: Record<string, PassengerIdentity> = {
  psg_001: { ninMasked: "••••••••4182", city: "Freetown", address: "Wilberforce, Freetown" },
  psg_002: { ninMasked: "••••••••3901", city: "Freetown", address: "Congo Cross, Freetown" },
  psg_003: { ninMasked: "••••••••5017", city: "Freetown", address: "Kissy, Freetown" },
  psg_004: { ninMasked: "••••••••2774", city: "Bo", address: "Bo Town" },
  psg_005: { ninMasked: "••••••••6221", city: "Kenema", address: "Kenema Town" },
  psg_006: { ninMasked: "••••••••1448", city: "Makeni", address: "Makeni Town" },
  psg_007: { ninMasked: "••••••••7104", city: "Freetown", address: "Lumley, Freetown" },
  psg_008: { ninMasked: "••••••••3355", city: "Freetown", address: "New England, Freetown" },
};

export const accounts: TransportAccount[] = [
  { id: "acc_001", passengerId: "psg_001", accountNumber: "ACC-SL-004182", balance: 48.5, status: "active", createdAt: iso(210), updatedAt: NOW },
  { id: "acc_002", passengerId: "psg_002", accountNumber: "ACC-SL-003901", balance: 12.0, status: "active", createdAt: iso(180), updatedAt: iso(1, 8, 20) },
  { id: "acc_003", passengerId: "psg_003", accountNumber: "ACC-SL-005017", balance: 86.25, status: "active", createdAt: iso(140), updatedAt: iso(0, 7, 10) },
  { id: "acc_004", passengerId: "psg_004", accountNumber: "ACC-SL-002774", balance: 3.5, status: "suspended", createdAt: iso(300), updatedAt: iso(12) },
  { id: "acc_005", passengerId: "psg_005", accountNumber: "ACC-SL-006221", balance: 2.0, status: "active", createdAt: iso(90), updatedAt: iso(0, 6, 40) },
  { id: "acc_006", passengerId: "psg_006", accountNumber: "ACC-SL-001448", balance: 9.75, status: "active", createdAt: iso(60), updatedAt: iso(2, 17, 5) },
  { id: "acc_007", passengerId: "psg_007", accountNumber: "ACC-SL-007104", balance: 0, status: "pending", createdAt: iso(4), updatedAt: iso(4) },
  { id: "acc_008", passengerId: "psg_008", accountNumber: "ACC-SL-003355", balance: 140.0, status: "active", createdAt: iso(250), updatedAt: iso(0, 11, 15) },
];

export const qrAccounts: QRAccount[] = [
  { id: "qr_001", accountId: "acc_001", secureToken: "qrt_7f3a9c2e1b8d4f6a9e0c1d2b3a4e5f67", status: "active", createdAt: iso(210), passengerId: "psg_001", passengerName: "Aminata Sesay", lastScannedAt: iso(0, 7, 42), scanCount: 186 },
  { id: "qr_002", accountId: "acc_002", secureToken: "qrt_a91c4e70b2d38f15c6e8a0d4b7f2193e", status: "active", createdAt: iso(180), passengerId: "psg_002", passengerName: "Mohamed Bangura", lastScannedAt: iso(1, 8, 20), scanCount: 94 },
  { id: "qr_003", accountId: "acc_003", secureToken: "qrt_c4d81a0e9f27b6c3d5e1a8f0b2c74916", status: "active", createdAt: iso(140), passengerId: "psg_003", passengerName: "Fatmata Kamara", lastScannedAt: iso(0, 7, 10), scanCount: 61 },
  { id: "qr_004", accountId: "acc_004", secureToken: "qrt_disabled_old_token_004_revokedxx", status: "disabled", createdAt: iso(300), passengerId: "psg_004", passengerName: "Sahr Lamin", lastScannedAt: iso(12, 16, 0), scanCount: 410 },
  { id: "qr_005", accountId: "acc_005", secureToken: "qrt_e8b2c1d0a9f7e6d5c4b3a29180776655", status: "active", createdAt: iso(90), passengerId: "psg_005", passengerName: "Isatu Conteh", lastScannedAt: iso(0, 6, 40), scanCount: 38 },
  { id: "qr_006", accountId: "acc_006", secureToken: "qrt_11223344556677889900aabbccddeeff", status: "active", createdAt: iso(60), passengerId: "psg_006", passengerName: "Abu Bakarr Turay", lastScannedAt: iso(2, 17, 5), scanCount: 22 },
  { id: "qr_007", accountId: "acc_007", secureToken: "qrt_pending_token_007_not_yet_live", status: "disabled", createdAt: iso(4), passengerId: "psg_007", passengerName: "Zainab Jalloh", scanCount: 0 },
  { id: "qr_008", accountId: "acc_008", secureToken: "qrt_99aa88bb77cc66dd55ee44ff33aa2211", status: "active", createdAt: iso(250), passengerId: "psg_008", passengerName: "Joseph Kargbo", lastScannedAt: iso(0, 11, 15), scanCount: 203 },
];

export const routes: TransportRoute[] = [
  {
    id: "rte_01",
    code: "FT-01",
    name: "Lumley — Congo Cross — Connaught Hospital",
    origin: "Lumley",
    destination: "Connaught Hospital",
    stops: [
      { name: "Lumley", order: 0 },
      { name: "Aberdeen Junction", order: 1 },
      { name: "Congo Cross", order: 2 },
      { name: "Cotton Tree", order: 3 },
      { name: "Connaught Hospital", order: 4 },
    ],
    distanceKm: 12,
    fare: 4,
    status: "active",
    createdAt: iso(500),
  },
  {
    id: "rte_04",
    code: "FT-04",
    name: "Kissy — Fourah Bay — Ola During Children's Hospital",
    origin: "Kissy",
    destination: "Ola During Children's Hospital",
    stops: [
      { name: "Kissy", order: 0 },
      { name: "Fourah Bay", order: 1 },
      { name: "Ola During Children's Hospital", order: 2 },
    ],
    distanceKm: 9,
    fare: 3.5,
    status: "active",
    createdAt: iso(500),
  },
  {
    id: "rte_07",
    code: "FT-07",
    name: "Aberdeen — Lumley — PCMH Freetown",
    origin: "Aberdeen",
    destination: "Princess Christian Maternity Hospital",
    stops: [
      { name: "Aberdeen", order: 0 },
      { name: "Lumley", order: 1 },
      { name: "PCMH Freetown", order: 2 },
    ],
    distanceKm: 14,
    fare: 4.5,
    status: "active",
    createdAt: iso(400),
  },
  {
    id: "rte_02",
    code: "WT-02",
    name: "Waterloo — Hastings — Connaught Hospital",
    origin: "Waterloo",
    destination: "Connaught Hospital",
    stops: [
      { name: "Waterloo", order: 0 },
      { name: "Hastings", order: 1 },
      { name: "Kissy", order: 2 },
      { name: "Connaught Hospital", order: 3 },
    ],
    distanceKm: 31,
    fare: 7.5,
    status: "active",
    createdAt: iso(380),
  },
  {
    id: "rte_11",
    code: "IC-11",
    name: "Freetown — Moyamba — Bo Government Hospital",
    origin: "Freetown",
    destination: "Bo Government Hospital",
    stops: [
      { name: "Freetown", order: 0 },
      { name: "Moyamba", order: 1 },
      { name: "Bo Government Hospital", order: 2 },
    ],
    distanceKm: 246,
    fare: 65,
    status: "active",
    createdAt: iso(360),
  },
  {
    id: "rte_12",
    code: "IC-12",
    name: "Freetown — Makeni Regional Hospital",
    origin: "Freetown",
    destination: "Makeni Regional Hospital",
    stops: [
      { name: "Freetown", order: 0 },
      { name: "Lunsar", order: 1 },
      { name: "Makeni Regional Hospital", order: 2 },
    ],
    distanceKm: 180,
    fare: 55,
    status: "inactive",
    createdAt: iso(200),
  },
];

export const fares: Fare[] = [
  { id: "fare_01", name: "Staff — FT-01", routeId: "rte_01", routeName: "Lumley — Connaught Hospital", category: "staff", amount: 4, status: "active", effectiveFrom: iso(500), createdAt: iso(500), updatedAt: iso(30) },
  { id: "fare_04", name: "Staff — FT-04", routeId: "rte_04", routeName: "Kissy — Ola During", category: "staff", amount: 3.5, status: "active", effectiveFrom: iso(500), createdAt: iso(500), updatedAt: iso(30) },
  { id: "fare_07", name: "Staff — FT-07", routeId: "rte_07", routeName: "Aberdeen — PCMH", category: "staff", amount: 4.5, status: "active", effectiveFrom: iso(400), createdAt: iso(400), updatedAt: iso(20) },
  { id: "fare_02", name: "Staff — WT-02", routeId: "rte_02", routeName: "Waterloo — Connaught", category: "staff", amount: 7.5, status: "active", effectiveFrom: iso(380), createdAt: iso(380), updatedAt: iso(20) },
  { id: "fare_11", name: "Staff — IC-11", routeId: "rte_11", routeName: "Freetown — Bo", category: "staff", amount: 65, status: "active", effectiveFrom: iso(360), createdAt: iso(360), updatedAt: iso(10) },
  { id: "fare_12", name: "Staff — IC-12", routeId: "rte_12", routeName: "Freetown — Makeni", category: "staff", amount: 55, status: "inactive", effectiveFrom: iso(200), createdAt: iso(200), updatedAt: iso(15) },
];

export const conductors: Conductor[] = [
  { id: "cnd_01", staffNumber: "CND-001", name: "Alimamy Sesay", contact: "+232 76 880 101", email: "a.sesay.cnd@health.gov.sl", busId: "bus_01", busNumber: "MOH-001", status: "active", tripsProcessed: 1284, lastActiveAt: iso(0, 12, 10), createdAt: iso(400) },
  { id: "cnd_02", staffNumber: "CND-014", name: "Mariama Koroma", contact: "+232 78 220 441", email: "m.koroma.cnd@health.gov.sl", busId: "bus_02", busNumber: "MOH-014", status: "active", tripsProcessed: 902, lastActiveAt: iso(0, 11, 40), createdAt: iso(360) },
  { id: "cnd_03", staffNumber: "CND-022", name: "Foday Conteh", contact: "+232 77 109 228", busId: "bus_03", busNumber: "MOH-022", status: "active", tripsProcessed: 640, lastActiveAt: iso(0, 8, 5), createdAt: iso(300) },
  { id: "cnd_04", staffNumber: "CND-031", name: "Hawa Bangura", contact: "+232 76 554 773", status: "suspended", tripsProcessed: 210, lastActiveAt: iso(40), createdAt: iso(280) },
];

export const buses: Bus[] = [
  { id: "bus_01", busNumber: "MOH-001", registrationNumber: "AEI 441 SL", routeId: "rte_01", routeName: "Lumley — Connaught Hospital", conductorId: "cnd_01", conductorName: "Alimamy Sesay", capacity: 32, status: "active", createdAt: iso(400) },
  { id: "bus_02", busNumber: "MOH-014", registrationNumber: "AEJ 118 SL", routeId: "rte_04", routeName: "Kissy — Ola During", conductorId: "cnd_02", conductorName: "Mariama Koroma", capacity: 28, status: "active", createdAt: iso(360) },
  { id: "bus_03", busNumber: "MOH-022", registrationNumber: "AEK 902 SL", routeId: "rte_02", routeName: "Waterloo — Connaught", conductorId: "cnd_03", conductorName: "Foday Conteh", capacity: 40, status: "active", createdAt: iso(300) },
  { id: "bus_04", busNumber: "MOH-031", registrationNumber: "AEL 220 SL", routeId: "rte_11", routeName: "Freetown — Bo", capacity: 45, status: "maintenance", createdAt: iso(280) },
  { id: "bus_05", busNumber: "MOH-040", registrationNumber: "AEM 007 SL", routeId: "rte_07", routeName: "Aberdeen — PCMH", capacity: 24, status: "inactive", createdAt: iso(200) },
];

export const transactions: Transaction[] = [
  { id: "txn_101", reference: "TXN-2A93F1", accountId: "acc_001", passengerId: "psg_001", passengerName: "Aminata Sesay", type: "fare", description: "Staff fare · FT-01 Lumley — Connaught", amount: -4, balanceAfter: 48.5, status: "successful", tripId: "trp_101", createdAt: iso(0, 7, 42) },
  { id: "txn_102", reference: "TXN-2A93E8", accountId: "acc_001", passengerId: "psg_001", passengerName: "Aminata Sesay", type: "recharge", description: "Orange Money top-up", amount: 50, balanceAfter: 52.5, status: "successful", method: "mobile_money", createdAt: iso(1, 19, 12) },
  { id: "txn_103", reference: "TXN-2A92C4", accountId: "acc_001", passengerId: "psg_001", passengerName: "Aminata Sesay", type: "fare", description: "Staff fare · FT-01 Connaught — Lumley", amount: -4, balanceAfter: 2.5, status: "successful", tripId: "trp_090", createdAt: iso(1, 17, 5) },
  { id: "txn_104", reference: "TXN-2A91B0", accountId: "acc_002", passengerId: "psg_002", passengerName: "Mohamed Bangura", type: "fare", description: "Staff fare · FT-07 Aberdeen — PCMH", amount: -4.5, balanceAfter: 12, status: "successful", tripId: "trp_102", createdAt: iso(1, 8, 20) },
  { id: "txn_105", reference: "TXN-2A90A1", accountId: "acc_003", passengerId: "psg_003", passengerName: "Fatmata Kamara", type: "recharge", description: "Afrimoney top-up", amount: 100, balanceAfter: 86.25, status: "successful", method: "mobile_money", createdAt: iso(2, 10, 0) },
  { id: "txn_106", reference: "TXN-2A89F2", accountId: "acc_005", passengerId: "psg_005", passengerName: "Isatu Conteh", type: "fare", description: "Staff fare · IC-11 Freetown — Bo", amount: -65, balanceAfter: 18, status: "failed", failureReason: "Insufficient wallet balance", createdAt: iso(0, 6, 40) },
  { id: "txn_107", reference: "TXN-2A88D3", accountId: "acc_008", passengerId: "psg_008", passengerName: "Joseph Kargbo", type: "adjustment", description: "Finance adjustment — overcharge reversal", amount: 4, balanceAfter: 140, status: "successful", createdAt: iso(3, 14, 22) },
  { id: "txn_108", reference: "TXN-2A87C1", accountId: "acc_006", passengerId: "psg_006", passengerName: "Abu Bakarr Turay", type: "refund", description: "Refund — cancelled inter-district trip", amount: 55, balanceAfter: 9.75, status: "pending", createdAt: iso(2, 16, 40) },
  { id: "txn_109", reference: "TXN-2A86B9", accountId: "acc_001", passengerId: "psg_001", passengerName: "Aminata Sesay", type: "fare", description: "Staff fare · WT-02 Waterloo — Connaught", amount: -7.5, balanceAfter: 6.5, status: "successful", tripId: "trp_080", createdAt: iso(4, 7, 15) },
  { id: "txn_110", reference: "TXN-2A85A0", accountId: "acc_004", passengerId: "psg_004", passengerName: "Sahr Lamin", type: "fare", description: "Staff fare · IC-11 Bo — Freetown", amount: -65, balanceAfter: 3.5, status: "failed", failureReason: "Account suspended", createdAt: iso(12, 16, 0) },
];

export const trips: Trip[] = [
  { id: "trp_101", reference: "TRP-441208", passengerId: "psg_001", passengerName: "Aminata Sesay", accountId: "acc_001", qrId: "qr_001", busId: "bus_01", busNumber: "MOH-001", conductorId: "cnd_01", conductorName: "Alimamy Sesay", routeId: "rte_01", routeName: "Lumley — Connaught Hospital", boardingStop: "Lumley", destinationStop: "Connaught Hospital", fare: 4, status: "completed", createdAt: iso(0, 7, 42) },
  { id: "trp_102", reference: "TRP-220114", passengerId: "psg_002", passengerName: "Mohamed Bangura", accountId: "acc_002", qrId: "qr_002", busId: "bus_02", busNumber: "MOH-014", conductorId: "cnd_02", conductorName: "Mariama Koroma", routeId: "rte_07", routeName: "Aberdeen — PCMH Freetown", boardingStop: "Aberdeen", destinationStop: "PCMH Freetown", fare: 4.5, status: "completed", createdAt: iso(1, 8, 20) },
  { id: "trp_090", reference: "TRP-441190", passengerId: "psg_001", passengerName: "Aminata Sesay", accountId: "acc_001", qrId: "qr_001", busId: "bus_01", busNumber: "MOH-001", conductorId: "cnd_01", conductorName: "Alimamy Sesay", routeId: "rte_01", routeName: "Lumley — Connaught Hospital", boardingStop: "Connaught Hospital", destinationStop: "Lumley", fare: 4, status: "completed", createdAt: iso(1, 17, 5) },
  { id: "trp_080", reference: "TRP-441080", passengerId: "psg_001", passengerName: "Aminata Sesay", accountId: "acc_001", qrId: "qr_001", busId: "bus_03", busNumber: "MOH-022", conductorId: "cnd_03", conductorName: "Foday Conteh", routeId: "rte_02", routeName: "Waterloo — Connaught Hospital", boardingStop: "Waterloo", destinationStop: "Connaught Hospital", fare: 7.5, status: "completed", createdAt: iso(4, 7, 15) },
  { id: "trp_070", reference: "TRP-554018", passengerId: "psg_005", passengerName: "Isatu Conteh", accountId: "acc_005", qrId: "qr_005", busId: "bus_04", busNumber: "MOH-031", conductorId: "cnd_01", conductorName: "Alimamy Sesay", routeId: "rte_11", routeName: "Freetown — Bo Government Hospital", boardingStop: "Freetown", destinationStop: "Bo Government Hospital", fare: 65, status: "failed", failureReason: "Insufficient wallet balance", createdAt: iso(0, 6, 40) },
  { id: "trp_060", reference: "TRP-210663", passengerId: "psg_008", passengerName: "Joseph Kargbo", accountId: "acc_008", qrId: "qr_008", busId: "bus_01", busNumber: "MOH-001", conductorId: "cnd_01", conductorName: "Alimamy Sesay", routeId: "rte_01", routeName: "Lumley — Connaught Hospital", boardingStop: "Congo Cross", destinationStop: "Connaught Hospital", fare: 4, status: "completed", createdAt: iso(0, 11, 15) },
  { id: "trp_050", reference: "TRP-330771", passengerId: "psg_006", passengerName: "Abu Bakarr Turay", accountId: "acc_006", qrId: "qr_006", busId: "bus_03", busNumber: "MOH-022", conductorId: "cnd_03", conductorName: "Foday Conteh", routeId: "rte_12", routeName: "Freetown — Makeni Regional Hospital", boardingStop: "Freetown", destinationStop: "Makeni Regional Hospital", fare: 55, status: "cancelled", createdAt: iso(2, 16, 10) },
];

export { demoCredentials } from "./demo";

export function paginate<T>(items: T[], params: QueryParams) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? appConfig.table.defaultPageSize;
  const start = (page - 1) * pageSize;
  const slice = items.slice(start, start + pageSize);
  return {
    items: slice,
    page,
    pageSize,
    total: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
  };
}

export function matchesSearch(haystack: string, query?: string) {
  if (!query) return true;
  return haystack.toLowerCase().includes(query.trim().toLowerCase());
}

export function inDateRange(value: string, from?: string, to?: string) {
  const day = value.slice(0, 10);
  if (from && day < from) return false;
  if (to && day > to) return false;
  return true;
}

export function newId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function newToken() {
  const bytes = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16));
  return `qrt_${bytes.join("")}`;
}

export function getPassengerDetail(id: string): PassengerDetail | null {
  const passenger = passengers.find((row) => row.id === id);
  if (!passenger) return null;
  const account = accounts.find((row) => row.id === passenger.accountId);
  const qr = qrAccounts.find((row) => row.id === passenger.qrId);
  if (!account || !qr) return null;
  const staffTx = transactions.filter((row) => row.passengerId === id);
  const staffTrips = trips.filter((row) => row.passengerId === id);
  return {
    passenger,
    account,
    qr,
    identity: identities[id] ?? { ninMasked: "••••••••••••" },
    stats: {
      totalTrips: staffTrips.filter((row) => row.status === "completed").length,
      totalSpent: staffTx.filter((row) => row.type === "fare" && row.status === "successful").reduce((sum, row) => sum + Math.abs(row.amount), 0),
      totalRecharged: staffTx.filter((row) => row.type === "recharge" && row.status === "successful").reduce((sum, row) => sum + row.amount, 0),
      lastTripAt: staffTrips[0]?.createdAt,
    },
  };
}

export function issueSession(user: User): AuthSession {
  const expires = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();
  return {
    user,
    accessToken: `mock.${user.id}.${Date.now()}`,
    expiresAt: expires,
  };
}

export function findQrByToken(secureToken: string) {
  return qrAccounts.find((row) => row.secureToken === secureToken);
}
