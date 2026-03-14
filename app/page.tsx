"use client";

import React, { useMemo, useState } from "react";

type AccountType = "checking" | "credit_builder";
type Frequency = "monthly" | "every_2_months";
type PayStatus = "planned" | "paid_half" | "paid_full" | "skip";

type Bill = {
  id: string;
  name: string;
  amount: number;
  frequency: Frequency;
  accountType: AccountType;
  dueHint?: string;
  variable?: boolean;
  perPaycheckMode: "half" | "quarter" | "custom";
  customPerPaycheck?: number;
  note?: string;
  lastPaid?: string;
  status?: PayStatus;
};

const currency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value || 0);

const round2 = (value: number) => Math.round((value || 0) * 100) / 100;

const starterBills: Bill[] = [
  {
    id: "rent",
    name: "Rent",
    amount: 1142,
    frequency: "monthly",
    accountType: "checking",
    perPaycheckMode: "half",
    lastPaid: "Paid half 3/13",
    status: "paid_half",
  },
  {
    id: "electric",
    name: "Electric",
    amount: 353.71,
    frequency: "monthly",
    accountType: "checking",
    variable: true,
    perPaycheckMode: "half",
    note: "Current credit $742.61",
    lastPaid: "Paid full 3/13",
    status: "paid_full",
  },
  {
    id: "phone",
    name: "Phone",
    amount: 222.02,
    frequency: "monthly",
    accountType: "credit_builder",
    perPaycheckMode: "half",
    lastPaid: "Paid full 3/3",
    status: "paid_full",
  },
  {
    id: "water",
    name: "Water",
    amount: 154.97,
    frequency: "every_2_months",
    accountType: "checking",
    variable: true,
    perPaycheckMode: "quarter",
    note: "Skip 3/13 due to $46 credit. Pay $40 on 3/27.",
    lastPaid: "Paid full 2/27",
    status: "skip",
  },
  {
    id: "internet",
    name: "Internet",
    amount: 55.87,
    frequency: "monthly",
    accountType: "credit_builder",
    perPaycheckMode: "half",
    lastPaid: "Paid full 2/19",
    status: "paid_full",
  },
  {
    id: "insurance",
    name: "Insurance",
    amount: 75.92,
    frequency: "monthly",
    accountType: "credit_builder",
    dueHint: "Due 21st of each month",
    perPaycheckMode: "half",
    lastPaid: "Paid full 2/5",
    status: "planned",
  },
  {
    id: "child-support",
    name: "Child Support",
    amount: 109,
    frequency: "monthly",
    accountType: "checking",
    perPaycheckMode: "half",
    lastPaid: "Paid full 3/13",
    status: "paid_full",
  },
  {
    id: "school",
    name: "Kids’ School",
    amount: 76,
    frequency: "monthly",
    accountType: "credit_builder",
    perPaycheckMode: "half",
    lastPaid: "Paid full 3/10",
    status: "paid_full",
  },
];

function getPerPaycheckAmount(bill: Bill) {
  if (bill.perPaycheckMode === "custom") return round2(bill.customPerPaycheck || 0);
  if (bill.perPaycheckMode === "half") return round2(bill.amount / 2);
  if (bill.perPaycheckMode === "quarter") return round2(bill.amount / 4);
  return 0;
}

function badgeClasses(status?: PayStatus) {
  switch (status) {
    case "paid_full":
      return "bg-green-100 text-green-800";
    case "paid_half":
      return "bg-amber-100 text-amber-800";
    case "skip":
      return "bg-slate-200 text-slate-700";
    default:
      return "bg-blue-100 text-blue-800";
  }
}

function statusLabel(status?: PayStatus) {
  switch (status) {
    case "paid_full":
      return "Paid full";
    case "paid_half":
      return "Paid half";
    case "skip":
      return "Skip";
    default:
      return "Planned";
  }
}

function todayString() {
  const now = new Date();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const y = now.getFullYear();
  return `${m}/${d}/${y}`;
}

export default function Page() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [paycheckNet, setPaycheckNet] = useState(1367.15);
  const [creditBuilderSplit, setCreditBuilderSplit] = useState(238);
  const [snapAmount, setSnapAmount] = useState(1300);
  const [bills, setBills] = useState<Bill[]>(starterBills);
  const [tab, setTab] = useState<"dashboard" | "paycheck" | "bills">("dashboard");
  const [newBill, setNewBill] = useState<Bill>({
    id: "",
    name: "",
    amount: 0,
    frequency: "monthly",
    accountType: "checking",
    perPaycheckMode: "half",
    note: "",
    dueHint: "",
    status: "planned",
    lastPaid: "",
  });

  React.useEffect(() => {
    try {
      const savedBills = window.localStorage.getItem("billflow_bills");
      const savedPaycheckNet = window.localStorage.getItem("billflow_paycheckNet");
      const savedCreditBuilderSplit = window.localStorage.getItem("billflow_creditBuilderSplit");
      const savedSnapAmount = window.localStorage.getItem("billflow_snapAmount");

      if (savedBills) setBills(JSON.parse(savedBills));
      if (savedPaycheckNet) setPaycheckNet(Number(savedPaycheckNet));
      if (savedCreditBuilderSplit) setCreditBuilderSplit(Number(savedCreditBuilderSplit));
      if (savedSnapAmount) setSnapAmount(Number(savedSnapAmount));
    } catch (error) {
      console.error("Failed to load Bill Flow data from localStorage", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  React.useEffect(() => {
    if (!isLoaded) return;
    window.localStorage.setItem("billflow_bills", JSON.stringify(bills));
  }, [bills, isLoaded]);

  React.useEffect(() => {
    if (!isLoaded) return;
    window.localStorage.setItem("billflow_paycheckNet", String(paycheckNet));
  }, [paycheckNet, isLoaded]);

  React.useEffect(() => {
    if (!isLoaded) return;
    window.localStorage.setItem("billflow_creditBuilderSplit", String(creditBuilderSplit));
  }, [creditBuilderSplit, isLoaded]);

  React.useEffect(() => {
    if (!isLoaded) return;
    window.localStorage.setItem("billflow_snapAmount", String(snapAmount));
  }, [snapAmount, isLoaded]);

  const checkingDeposit = useMemo(
    () => round2(paycheckNet - creditBuilderSplit),
    [paycheckNet, creditBuilderSplit]
  );

  const checkingBills = useMemo(() => bills.filter((b) => b.accountType === "checking"), [bills]);
  const creditBuilderBills = useMemo(() => bills.filter((b) => b.accountType === "credit_builder"), [bills]);

  const checkingPerPaycheck = useMemo(
    () => round2(checkingBills.reduce((sum, bill) => sum + getPerPaycheckAmount(bill), 0)),
    [checkingBills]
  );

  const creditBuilderMonthly = useMemo(
    () => round2(creditBuilderBills.reduce((sum, bill) => sum + bill.amount, 0)),
    [creditBuilderBills]
  );

  const creditBuilderMonthlyFunding = useMemo(() => round2(creditBuilderSplit * 2), [creditBuilderSplit]);
  const creditBuilderBuffer = useMemo(
    () => round2(creditBuilderMonthlyFunding - creditBuilderMonthly),
    [creditBuilderMonthlyFunding, creditBuilderMonthly]
  );

  const checkingAfterPlanned = useMemo(
    () => round2(checkingDeposit - checkingPerPaycheck),
    [checkingDeposit, checkingPerPaycheck]
  );

  const totalThisPaycheck = useMemo(
    () => round2(checkingPerPaycheck + creditBuilderSplit),
    [checkingPerPaycheck, creditBuilderSplit]
  );

  const cbUtilization = useMemo(() => {
    if (creditBuilderMonthlyFunding <= 0) return 0;
    return Math.min(100, Math.round((creditBuilderMonthly / creditBuilderMonthlyFunding) * 100));
  }, [creditBuilderMonthly, creditBuilderMonthlyFunding]);

  function updateBill(id: string, patch: Partial<Bill>) {
    setBills((current) => current.map((bill) => (bill.id === id ? { ...bill, ...patch } : bill)));
  }

  function setBillStatus(id: string, status: PayStatus) {
    setBills((current) =>
      current.map((bill) => {
        if (bill.id !== id) return bill;
        let lastPaid = bill.lastPaid;
        if (status === "paid_half") lastPaid = `Paid half ${todayString()}`;
        if (status === "paid_full") lastPaid = `Paid full ${todayString()}`;
        if (status === "skip") lastPaid = `Skipped ${todayString()}`;
        if (status === "planned") lastPaid = bill.lastPaid;
        return { ...bill, status, lastPaid };
      })
    );
  }

  function addBill() {
    if (!newBill.name.trim()) return;
    const id = `${newBill.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
    setBills((current) => [
      ...current,
      {
        ...newBill,
        id,
        amount: Number(newBill.amount) || 0,
        customPerPaycheck: Number(newBill.customPerPaycheck) || 0,
      },
    ]);
    setNewBill({
      id: "",
      name: "",
      amount: 0,
      frequency: "monthly",
      accountType: "checking",
      perPaycheckMode: "half",
      note: "",
      dueHint: "",
      status: "planned",
      lastPaid: "",
    });
  }

  function removeBill(id: string) {
    setBills((current) => current.filter((bill) => bill.id !== id));
  }

  function resetAllData() {
    const confirmed = window.confirm("Reset all Bill Flow data on this device?");
    if (!confirmed) return;

    window.localStorage.removeItem("billflow_bills");
    window.localStorage.removeItem("billflow_paycheckNet");
    window.localStorage.removeItem("billflow_creditBuilderSplit");
    window.localStorage.removeItem("billflow_snapAmount");

    setBills(starterBills);
    setPaycheckNet(1367.15);
    setCreditBuilderSplit(238);
    setSnapAmount(1300);
    setTab("dashboard");
  }

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto max-w-7xl p-4 md:p-8">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h1 className="text-3xl font-bold">Bill Flow</h1>
            <p className="mt-2 text-sm text-slate-600">Loading your saved data…</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl p-4 md:p-8">
        <div className="mb-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Bill Flow</h1>
              <p className="mt-2 text-sm text-slate-600">
                Paycheck planning first, bill tracking second. Changes now save on this device.
              </p>
            </div>
            <button
              onClick={resetAllData}
              className="rounded-2xl border border-red-300 px-4 py-2 text-sm font-medium text-red-700"
            >
              Reset device data
            </button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          <InputCard label="Bi-weekly net" value={paycheckNet} onChange={setPaycheckNet} display={currency(paycheckNet)} />
          <InputCard
            label="Credit Builder split"
            value={creditBuilderSplit}
            onChange={setCreditBuilderSplit}
            display={currency(creditBuilderSplit)}
          />
          <StaticCard label="Checking after split" value={currency(checkingDeposit)} />
          <InputCard label="SNAP monthly" value={snapAmount} onChange={setSnapAmount} display={currency(snapAmount)} />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {[
            ["dashboard", "Dashboard"],
            ["paycheck", "This Paycheck"],
            ["bills", "Bills"],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setTab(value as typeof tab)}
              className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
                tab === value ? "bg-slate-900 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "dashboard" && (
          <div className="mt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard label="This paycheck total" value={currency(totalThisPaycheck)} />
              <StatCard label="Checking bills this paycheck" value={currency(checkingPerPaycheck)} />
              <StatCard label="Checking after planned" value={currency(checkingAfterPlanned)} />
              <StatCard label="Credit Builder monthly buffer" value={currency(creditBuilderBuffer)} />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h2 className="text-xl font-semibold">This paycheck snapshot</h2>
                <div className="mt-4 space-y-3 text-sm">
                  <Row label="Net paycheck" value={currency(paycheckNet)} />
                  <Row label="Credit Builder split" value={currency(creditBuilderSplit)} />
                  <Row label="Checking deposit" value={currency(checkingDeposit)} />
                  <Row label="Checking bills this paycheck" value={currency(checkingPerPaycheck)} />
                  <div className="my-3 border-t border-slate-200" />
                  <Row label="Left after planned bills" value={currency(checkingAfterPlanned)} bold />
                </div>
              </section>

              <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h2 className="text-xl font-semibold">Credit Builder side panel</h2>
                <div className="mt-4 space-y-3 text-sm">
                  <Row label="Monthly funding" value={currency(creditBuilderMonthlyFunding)} />
                  <Row label="Monthly fixed bills" value={currency(creditBuilderMonthly)} />
                  <Row label="Funding load" value={`${cbUtilization}%`} />
                  <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-slate-900" style={{ width: `${cbUtilization}%` }} />
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {tab === "paycheck" && (
          <div className="mt-6 space-y-6">
            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-xl font-semibold">What to pay this paycheck</h2>
              <p className="mt-1 text-sm text-slate-500">
                Edit amounts directly here. Check off paid half, paid full, or skip.
              </p>
              <div className="mt-4 space-y-4">
                {bills.map((bill) => (
                  <EditableBillRow
                    key={bill.id}
                    bill={bill}
                    onUpdate={updateBill}
                    onSetStatus={setBillStatus}
                  />
                ))}
              </div>
            </section>
          </div>
        )}

        {tab === "bills" && (
          <div className="mt-6 space-y-6">
            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-xl font-semibold">Add a bill</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <TextInput label="Bill name" value={newBill.name} onChange={(v) => setNewBill({ ...newBill, name: v })} />
                <NumberInput label="Amount" value={newBill.amount} onChange={(v) => setNewBill({ ...newBill, amount: v })} />
                <SelectInput
                  label="Frequency"
                  value={newBill.frequency}
                  onChange={(v) => setNewBill({ ...newBill, frequency: v as Frequency })}
                  options={[
                    ["monthly", "Monthly"],
                    ["every_2_months", "Every 2 months"],
                  ]}
                />
                <SelectInput
                  label="Account"
                  value={newBill.accountType}
                  onChange={(v) => setNewBill({ ...newBill, accountType: v as AccountType })}
                  options={[
                    ["checking", "Checking"],
                    ["credit_builder", "Credit Builder"],
                  ]}
                />
                <SelectInput
                  label="Per paycheck mode"
                  value={newBill.perPaycheckMode}
                  onChange={(v) => setNewBill({ ...newBill, perPaycheckMode: v as Bill["perPaycheckMode"] })}
                  options={[
                    ["half", "Half"],
                    ["quarter", "Quarter"],
                    ["custom", "Custom"],
                  ]}
                />
                <NumberInput
                  label="Custom per paycheck"
                  value={newBill.customPerPaycheck || 0}
                  onChange={(v) => setNewBill({ ...newBill, customPerPaycheck: v })}
                />
                <TextInput label="Due hint" value={newBill.dueHint || ""} onChange={(v) => setNewBill({ ...newBill, dueHint: v })} />
                <TextInput label="Note" value={newBill.note || ""} onChange={(v) => setNewBill({ ...newBill, note: v })} />
              </div>
              <button onClick={addBill} className="mt-4 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white">
                Add bill
              </button>
            </section>

            <div className="grid gap-4 lg:grid-cols-2">
              <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h2 className="text-xl font-semibold">Checking bills</h2>
                <div className="mt-4 space-y-3">
                  {checkingBills.map((bill) => (
                    <BillManagerCard key={bill.id} bill={bill} onUpdate={updateBill} onRemove={removeBill} onSetStatus={setBillStatus} />
                  ))}
                </div>
              </section>

              <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h2 className="text-xl font-semibold">Credit Builder bills</h2>
                <div className="mt-4 space-y-3">
                  {creditBuilderBills.map((bill) => (
                    <BillManagerCard key={bill.id} bill={bill} onUpdate={updateBill} onRemove={removeBill} onSetStatus={setBillStatus} />
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function EditableBillRow({
  bill,
  onUpdate,
  onSetStatus,
}: {
  bill: Bill;
  onUpdate: (id: string, patch: Partial<Bill>) => void;
  onSetStatus: (id: string, status: PayStatus) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.7fr_0.7fr_1fr]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 font-medium"
              value={bill.name}
              onChange={(e) => onUpdate(bill.id, { name: e.target.value })}
            />
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badgeClasses(bill.status)}`}>
              {statusLabel(bill.status)}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
            <span>{bill.accountType === "credit_builder" ? "Credit Builder" : "Checking"}</span>
            <span>•</span>
            <span>{bill.frequency === "monthly" ? "Monthly" : "Every 2 months"}</span>
            <span>•</span>
            <span>{bill.perPaycheckMode === "half" ? "Half" : bill.perPaycheckMode === "quarter" ? "Quarter" : "Custom"}</span>
          </div>
          <input
            className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            placeholder="Note"
            value={bill.note || ""}
            onChange={(e) => onUpdate(bill.id, { note: e.target.value })}
          />
          <p className="mt-2 text-sm text-slate-500">{bill.lastPaid || "No payment logged yet"}</p>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-500">Full amount</label>
          <input
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
            type="number"
            step="0.01"
            value={bill.amount}
            onChange={(e) => onUpdate(bill.id, { amount: Number(e.target.value) || 0 })}
          />
          <p className="mt-2 text-sm font-semibold">{currency(bill.amount)}</p>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-500">Per paycheck</label>
          <input
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
            type="number"
            step="0.01"
            value={bill.perPaycheckMode === "custom" ? bill.customPerPaycheck || 0 : getPerPaycheckAmount(bill)}
            onChange={(e) => {
              const val = Number(e.target.value) || 0;
              if (bill.perPaycheckMode === "custom") {
                onUpdate(bill.id, { customPerPaycheck: val });
              }
            }}
            disabled={bill.perPaycheckMode !== "custom"}
          />
          <p className="mt-2 text-sm font-semibold">{currency(getPerPaycheckAmount(bill))}</p>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-500">Check off</label>
          <div className="mt-2 space-y-2">
            <CheckLine label="Paid half" checked={bill.status === "paid_half"} onChange={() => onSetStatus(bill.id, "paid_half")} />
            <CheckLine label="Paid full" checked={bill.status === "paid_full"} onChange={() => onSetStatus(bill.id, "paid_full")} />
            <CheckLine label="Skip" checked={bill.status === "skip"} onChange={() => onSetStatus(bill.id, "skip")} />
            <CheckLine label="Planned" checked={bill.status === "planned"} onChange={() => onSetStatus(bill.id, "planned")} />
          </div>
        </div>
      </div>
    </div>
  );
}

function BillManagerCard({
  bill,
  onUpdate,
  onRemove,
  onSetStatus,
}: {
  bill: Bill;
  onUpdate: (id: string, patch: Partial<Bill>) => void;
  onRemove: (id: string) => void;
  onSetStatus: (id: string, status: PayStatus) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 font-medium"
            value={bill.name}
            onChange={(e) => onUpdate(bill.id, { name: e.target.value })}
          />
          <p className="mt-2 text-sm text-slate-500">{bill.lastPaid || "No payment logged yet"}</p>
        </div>
        <button onClick={() => onRemove(bill.id)} className="rounded-xl border border-red-300 px-3 py-2 text-sm text-red-700">
          Remove
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <NumberInput label="Amount" value={bill.amount} onChange={(v) => onUpdate(bill.id, { amount: v })} />
        <SelectInput
          label="Frequency"
          value={bill.frequency}
          onChange={(v) => onUpdate(bill.id, { frequency: v as Frequency })}
          options={[
            ["monthly", "Monthly"],
            ["every_2_months", "Every 2 months"],
          ]}
        />
        <SelectInput
          label="Per paycheck mode"
          value={bill.perPaycheckMode}
          onChange={(v) => onUpdate(bill.id, { perPaycheckMode: v as Bill["perPaycheckMode"] })}
          options={[
            ["half", "Half"],
            ["quarter", "Quarter"],
            ["custom", "Custom"],
          ]}
        />
        <NumberInput
          label="Custom per paycheck"
          value={bill.customPerPaycheck || 0}
          onChange={(v) => onUpdate(bill.id, { customPerPaycheck: v })}
        />
        <TextInput label="Due hint" value={bill.dueHint || ""} onChange={(v) => onUpdate(bill.id, { dueHint: v })} />
        <TextInput label="Note" value={bill.note || ""} onChange={(v) => onUpdate(bill.id, { note: v })} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button onClick={() => onSetStatus(bill.id, "paid_half")} className="rounded-xl bg-amber-100 px-3 py-2 text-sm font-medium text-amber-800">
          Paid half
        </button>
        <button onClick={() => onSetStatus(bill.id, "paid_full")} className="rounded-xl bg-green-100 px-3 py-2 text-sm font-medium text-green-800">
          Paid full
        </button>
        <button onClick={() => onSetStatus(bill.id, "skip")} className="rounded-xl bg-slate-200 px-3 py-2 text-sm font-medium text-slate-700">
          Skip
        </button>
        <button onClick={() => onSetStatus(bill.id, "planned")} className="rounded-xl bg-blue-100 px-3 py-2 text-sm font-medium text-blue-800">
          Planned
        </button>
        <div className="ml-auto text-sm font-semibold">Per paycheck: {currency(getPerPaycheckAmount(bill))}</div>
      </div>
    </div>
  );
}

function CheckLine({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4" />
      <span>{label}</span>
    </label>
  );
}

function InputCard({
  label,
  value,
  onChange,
  display,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  display: string;
}) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm text-slate-500">{label}</p>
      <input
        className="mt-3 w-full rounded-xl border border-slate-300 px-3 py-2"
        type="number"
        step="0.01"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
      />
      <p className="mt-3 text-2xl font-semibold">{display}</p>
    </div>
  );
}

function StaticCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-8 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-bold">{value}</p>
    </div>
  );
}

function Row({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className={bold ? "font-semibold" : "text-slate-600"}>{label}</span>
      <span className={bold ? "text-lg font-bold" : "font-medium"}>{value}</span>
    </div>
  );
}

function TextInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <input
        className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function NumberInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <input
        className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
        type="number"
        step="0.01"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
      />
    </label>
  );
}

function SelectInput({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <select
        className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
}
