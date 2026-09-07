"use client";

import { WalletRechargeDesk } from "@/components/office/wallet-recharge-desk";

export default function AdminRechargePage() {
  return (
    <WalletRechargeDesk
      title="Recharge a staff wallet"
      description="Look up the staff member, enter the amount they paid, and credit their transit account. The same QR stays active."
    />
  );
}
