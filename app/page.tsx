"use client";

import React, { useEffect, useMemo, useState } from "react";

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
  note?: string;
  perPaycheckMode: "half" | "quarter" | "custom";
  customPerPaycheck?: number;
  lastPaid?: string;
  status: PayStatus;
};

const STARTER_BILLS: Bill[] = [
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
    perPaycheckMode: "custom",
    customPerPaycheck: 40,
    note: "Skip 3/13 payment due to $46 credit. Pay $40 on 3/27.",
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
    perPaycheckMode: "half",
    dueHint: "Due 21st of each month",
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
    lastPaid: "Paid in full 3/10",
    status: "paid_full",
  },
];

const currency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value || 0);

const round2 = (value: number) => Math.round((value || 0) * 100) / 100;

function getPerPaycheckAmount(bill: Bill) {
  if (bill.perPaycheckMode === "custom") return round2(bill.customPerPaycheck || 0);
  if (bill.perPaycheckMode === "quarter") return round2(bill.amount / 4);
  return round2(bill.amount / 2);
}

function todayShort() {
  const d = new Date();
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function makePaidLabel(status: PayStatus) {
  if (status === "paid_half") return `Paid half ${todayShort()}`;
  if (status === "paid_full") return `Paid full ${todayShort()}`;
  if (status === "skip") return `Skip ${todayShort()}`;
  return "";
}

export default function Page() {
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState<"monthly" | "manager" | "summary">("monthly");
  const [paycheckNet, setPaycheckNet] = useState(1367.15);
  const [creditBuilderSplit, setCreditBuilderSplit] = useState(238);
  const [snapAmount, setSnapAmount] = useState(1300);
  const [bills, setBills] = useState<Bill[]>(STARTER_BILLS);
  const [newBill, setNewBill] = useState<Bill>({
    id: "",
    name: "",
    amount: 0,
    frequency: "monthly",
    accountType: "checking",
    perPaycheckMode: "half",
    customPerPaycheck: 0,
    note: "",
    dueHint: "",
    lastPaid: "",
    status: "planned",
  });

  useEffect(() => {
    try {
      const savedBills = localStorage.getItem("billflow_bills_v2");
      const savedNet = localStorage.getItem("billflow_net_v2");
      const savedSplit = localStorage.getItem("billflow_split_v2");
      const savedSnap = localStorage.getItem("billflow_snap_v2");
      if (savedBills) setBills(JSON.parse(savedBills));
      if (savedNet) setPaycheckNet(Number(savedNet));
      if (savedSplit) setCreditBuilderSplit(Number(savedSplit));
      if (savedSnap) setSnapAmount(Number(savedSnap));
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("billflow_bills_v2", JSON.stringify(bills));
  }, [bills, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("billflow_net_v2", String(paycheckNet));
  }, [paycheckNet, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("billflow_split_v2", String(creditBuilderSplit));
  }, [creditBuilderSplit, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("billflow_snap_v2", String(snapAmount));
  }, [snapAmount, loaded]);

  const checkingBills = useMemo(() => bills.filter((b) => b.accountType === "checking"), [bills]);
  const cbBills = useMemo(() => bills.filter((b) => b.accountType === "credit_builder"), [bills]);
  const checkingPerCheck = useMemo(
    () => round2(checkingBills.reduce((sum, bill) => sum + getPerPaycheckAmount(bill), 0)),
    [checkingBills]
  );
  const checkingAfterSplit = useMemo(() => round2(paycheckNet - creditBuilderSplit), [paycheckNet, creditBuilderSplit]);
  const checkingAfterPlanned = useMemo(() => round2(checkingAfterSplit - checkingPerCheck), [checkingAfterSplit, checkingPerCheck]);
  const cbMonthly = useMemo(() => round2(cbBills.reduce((sum, bill) => sum + bill.amount, 0)), [cbBills]);
  const cbFunding = round2(creditBuilderSplit * 2);

  const updateBill = (id: string, patch: Partial<Bill>) => {
    setBills((current) => current.map((bill) => (bill.id === id ? { ...bill, ...patch } : bill)));
  };

  const setBillStatus = (id: string, status: PayStatus) => {
    setBills((current) =>
      current.map((bill) =>
        bill.id === id
          ? {
              ...bill,
              status,
              lastPaid: status === "planned" ? bill.lastPaid : makePaidLabel(status),
            }
          : bill
      )
    );
  };

  const addBill = () => {
    if (!newBill.name.trim()) return;
    const id = `${newBill.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
    setBills((current) => [...current, { ...newBill, id }]);
    setNewBill({
      id: "",
      name: "",
      amount: 0,
      frequency: "monthly",
      accountType: "checking",
      perPaycheckMode: "half",
      customPerPaycheck: 0,
      note: "",
      dueHint: "",
      lastPaid: "",
      status: "planned",
    });
  };

  const removeBill = (id: string) => setBills((current) => current.filter((b) => b.id !== id));

  const resetDevice = () => {
    if (!window.confirm("Reset saved Bill Flow data on this device?")) return;
    localStorage.removeItem("billflow_bills_v2");
    localStorage.removeItem("billflow_net_v2");
    localStorage.removeItem("billflow_split_v2");
    localStorage.removeItem("billflow_snap_v2");
    setBills(STARTER_BILLS);
    setPaycheckNet(1367.15);
    setCreditBuilderSplit(238);
    setSnapAmount(1300);
  };

  if (!loaded) {
    return <main className="min-h-screen bg-slate-50 p-6">Loading…</main>;
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl p-4 md:p-8 space-y-6">
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Bill Flow</h1>
              <p className="mt-2 text-sm text-slate-600">
                Monthly-bills style view. See everything at once, edit amount and paid date, and use checkboxes after each paycheck.
              </p>
            </div>
            <button onClick={resetDevice} className="rounded-2xl border border-red-300 px-4 py-2 text-sm font-medium text-red-700">
              Reset device data
            </button>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-4">
          <InputCard label="Bi-weekly net" value={paycheckNet} onChange={setPaycheckNet} />
          <InputCard label="Credit Builder split" value={creditBuilderSplit} onChange={setCreditBuilderSplit} />
          <ReadCard label="Checking after split" value={currency(checkingAfterSplit)} />
          <InputCard label="SNAP monthly" value={snapAmount} onChange={setSnapAmount} />
        </section>

        <div className="flex flex-wrap gap-2">
          {[
            ["monthly", "Monthly Bills"],
            ["manager", "Bills Manager"],
            ["summary", "Summary"],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setTab(value as typeof tab)}
              className={`rounded-2xl px-4 py-2 text-sm font-medium ${tab === value ? "bg-slate-900 text-white" : "bg-white ring-1 ring-slate-200 text-slate-700"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "monthly" && (
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold">Monthly Bills</h2>
            <p className="mt-1 text-sm text-slate-500">Edit after each paycheck and keep the whole list visible in one place.</p>
            <div className="mt-5 space-y-5">
              {bills.map((bill) => (
                <MonthlyBillCard key={bill.id} bill={bill} onUpdate={updateBill} onSetStatus={setBillStatus} />
              ))}
            </div>
          </section>
        )}

        {tab === "manager" && (
          <div className="space-y-6">
            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-xl font-semibold">Add a bill</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <TextField label="Bill name" value={newBill.name} onChange={(v) => setNewBill({ ...newBill, name: v })} />
                <NumberField label="Amount" value={newBill.amount} onChange={(v) => setNewBill({ ...newBill, amount: v })} />
                <SelectField
                  label="Frequency"
                  value={newBill.frequency}
                  onChange={(v) => setNewBill({ ...newBill, frequency: v as Frequency })}
                  options={[ ["monthly", "Monthly"], ["every_2_months", "Every 2 months"] ]}
                />
                <SelectField
                  label="Account"
                  value={newBill.accountType}
                  onChange={(v) => setNewBill({ ...newBill, accountType: v as AccountType })}
                  options={[ ["checking", "Checking"], ["credit_builder", "Credit Builder"] ]}
                />
                <SelectField
                  label="Per paycheck mode"
                  value={newBill.perPaycheckMode}
                  onChange={(v) => setNewBill({ ...newBill, perPaycheckMode: v as Bill["perPaycheckMode"] })}
                  options={[ ["half", "Half"], ["quarter", "Quarter"], ["custom", "Custom"] ]}
                />
                <NumberField
                  label="Custom per-check"
                  value={newBill.customPerPaycheck || 0}
                  onChange={(v) => setNewBill({ ...newBill, customPerPaycheck: v })}
                />
                <TextField label="Due hint" value={newBill.dueHint || ""} onChange={(v) => setNewBill({ ...newBill, dueHint: v })} />
                <TextField label="Note" value={newBill.note || ""} onChange={(v) => setNewBill({ ...newBill, note: v })} />
              </div>
              <button onClick={addBill} className="mt-4 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white">
                Add bill
              </button>
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <ManagerColumn title="Checking bills" bills={checkingBills} onUpdate={updateBill} onRemove={removeBill} onSetStatus={setBillStatus} />
              <ManagerColumn title="Credit Builder bills" bills={cbBills} onUpdate={updateBill} onRemove={removeBill} onSetStatus={setBillStatus} />
            </section>
          </div>
        )}

        {tab === "summary" && (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <ReadCard label="Checking per paycheck" value={currency(checkingPerCheck)} />
            <ReadCard label="Checking after planned" value={currency(checkingAfterPlanned)} />
            <ReadCard label="Credit Builder monthly" value={currency(cbMonthly)} />
            <ReadCard label="Credit Builder funding" value={currency(cbFunding)} />
          </section>
        )}
      </div>
    </main>
  );
}

function MonthlyBillCard({
  bill,
  onUpdate,
  onSetStatus,
}: {
  bill: Bill;
  onUpdate: (id: string, patch: Partial<Bill>) => void;
  onSetStatus: (id: string, status: PayStatus) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2 text-sm text-slate-500">
          {bill.accountType === "credit_builder" ? <span>(Credit Builder & Auto Pay)</span> : null}
          {bill.frequency === "every_2_months" ? <span>(Every 2 months)</span> : <span>(Every month)</span>}
          {bill.dueHint ? <span>({bill.dueHint})</span> : null}
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.2fr_0.7fr_0.7fr_0.8fr]">
          <div>
            <label className="text-xs font-medium text-slate-500">Bill name</label>
            <input
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-lg font-medium"
              value={bill.name}
              onChange={(e) => onUpdate(bill.id, { name: e.target.value })}
            />
            <textarea
              className="mt-3 min-h-[72px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              placeholder="Extra note"
              value={bill.note || ""}
              onChange={(e) => onUpdate(bill.id, { note: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500">Full amount</label>
            <input
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
              type="number"
              step="0.01"
              value={bill.amount}
              onChange={(e) => onUpdate(bill.id, { amount: Number(e.target.value) || 0 })}
            />
            <p className="mt-3 text-sm font-medium">{currency(bill.amount)}</p>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500">Per-check amount</label>
            <input
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
              type="number"
              step="0.01"
              value={bill.perPaycheckMode === "custom" ? bill.customPerPaycheck || 0 : getPerPaycheckAmount(bill)}
              onChange={(e) => onUpdate(bill.id, { perPaycheckMode: "custom", customPerPaycheck: Number(e.target.value) || 0 })}
            />
            <p className="mt-3 text-sm font-medium">{currency(getPerPaycheckAmount(bill))}</p>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500">Date paid / confirmed</label>
            <input
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
              value={bill.lastPaid || ""}
              onChange={(e) => onUpdate(bill.id, { lastPaid: e.target.value })}
              placeholder="Paid full 3/13"
            />
            <span className={`mt-3 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(bill.status)}`}>
              {labelForStatus(bill.status)}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 text-base leading-relaxed">
          <span className="font-medium">{bill.name}:</span> {currency(bill.amount)}
          <span className="mx-2">→</span>
          <span>per check: {currency(getPerPaycheckAmount(bill))}</span>
          <span className="mx-2">→</span>
          <span>{bill.lastPaid || labelForStatus(bill.status)}</span>
        </div>

        <div className="grid gap-2 md:grid-cols-4">
          <CheckLine label="Paid half" checked={bill.status === "paid_half"} onChange={() => onSetStatus(bill.id, "paid_half")} />
          <CheckLine label="Paid full" checked={bill.status === "paid_full"} onChange={() => onSetStatus(bill.id, "paid_full")} />
          <CheckLine label="Skip" checked={bill.status === "skip"} onChange={() => onSetStatus(bill.id, "skip")} />
          <CheckLine label="Planned" checked={bill.status === "planned"} onChange={() => onSetStatus(bill.id, "planned")} />
        </div>
      </div>
    </div>
  );
}

function ManagerColumn({
  title,
  bills,
  onUpdate,
  onRemove,
  onSetStatus,
}: {
  title: string;
  bills: Bill[];
  onUpdate: (id: string, patch: Partial<Bill>) => void;
  onRemove: (id: string) => void;
  onSetStatus: (id: string, status: PayStatus) => void;
}) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-4 space-y-3">
        {bills.map((bill) => (
          <div key={bill.id} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <input
                className="rounded-lg border border-slate-300 px-3 py-2 font-medium"
                value={bill.name}
                onChange={(e) => onUpdate(bill.id, { name: e.target.value })}
              />
              <button onClick={() => onRemove(bill.id)} className="rounded-xl border border-red-300 px-3 py-2 text-sm text-red-700">
                Remove
              </button>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <NumberField label="Amount" value={bill.amount} onChange={(v) => onUpdate(bill.id, { amount: v })} />
              <TextField label="Date paid" value={bill.lastPaid || ""} onChange={(v) => onUpdate(bill.id, { lastPaid: v })} />
              <TextField label="Note" value={bill.note || ""} onChange={(v) => onUpdate(bill.id, { note: v })} />
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => onSetStatus(bill.id, "paid_half")} className="rounded-xl bg-amber-100 px-3 py-2 text-sm font-medium text-amber-800">Paid half</button>
              <button onClick={() => onSetStatus(bill.id, "paid_full")} className="rounded-xl bg-green-100 px-3 py-2 text-sm font-medium text-green-800">Paid full</button>
              <button onClick={() => onSetStatus(bill.id, "skip")} className="rounded-xl bg-slate-200 px-3 py-2 text-sm font-medium text-slate-700">Skip</button>
              <button onClick={() => onSetStatus(bill.id, "planned")} className="rounded-xl bg-blue-100 px-3 py-2 text-sm font-medium text-blue-800">Planned</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function statusClass(status: PayStatus) {
  if (status === "paid_full") return "bg-green-100 text-green-800";
  if (status === "paid_half") return "bg-amber-100 text-amber-800";
  if (status === "skip") return "bg-slate-200 text-slate-700";
  return "bg-blue-100 text-blue-800";
}

function labelForStatus(status: PayStatus) {
  if (status === "paid_full") return "Paid full";
  if (status === "paid_half") return "Paid half";
  if (status === "skip") return "Skip";
  return "Planned";
}

function CheckLine({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4" />
      <span>{label}</span>
    </label>
  );
}

function InputCard({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm text-slate-500">{label}</p>
      <input className="mt-3 w-full rounded-xl border border-slate-300 px-3 py-2" type="number" step="0.01" value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} />
      <p className="mt-3 text-2xl font-semibold">{currency(value)}</p>
    </div>
  );
}

function ReadCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-8 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <input className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <input className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2" type="number" step="0.01" value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} />
    </label>
  );
}

function SelectField({
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
      <select className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
}
