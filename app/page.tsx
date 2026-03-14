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
  }).format(value);

const round2 = (value: number) => Math.round(value * 100) / 100;

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
      return "bg-yellow-100 text-yellow-800";
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

export default function Page() {
  const [paycheckNet, setPaycheckNet] = useState(1367.15);
  const [creditBuilderSplit, setCreditBuilderSplit] = useState(238);
  const [snapAmount, setSnapAmount] = useState(1300);
  const [bills, setBills] = useState<Bill[]>(starterBills);
  const [tab, setTab] = useState<"dashboard" | "paycheck" | "bills" | "credit-builder">("dashboard");

  const checkingDeposit = useMemo(
    () => round2(paycheckNet - creditBuilderSplit),
    [paycheckNet, creditBuilderSplit]
  );

  const checkingBills = useMemo(
    () => bills.filter((b) => b.accountType === "checking"),
    [bills]
  );

  const creditBuilderBills = useMemo(
    () => bills.filter((b) => b.accountType === "credit_builder"),
    [bills]
  );

  const checkingPerPaycheck = useMemo(
    () => round2(checkingBills.reduce((sum, bill) => sum + getPerPaycheckAmount(bill), 0)),
    [checkingBills]
  );

  const creditBuilderMonthly = useMemo(
    () => round2(creditBuilderBills.reduce((sum, bill) => sum + bill.amount, 0)),
    [creditBuilderBills]
  );

  const creditBuilderMonthlyFunding = useMemo(
    () => round2(creditBuilderSplit * 2),
    [creditBuilderSplit]
  );

  const creditBuilderBuffer = useMemo(
    () => round2(creditBuilderMonthlyFunding - creditBuilderMonthly),
    [creditBuilderMonthlyFunding, creditBuilderMonthly]
  );

  const checkingAfterPlanned = useMemo(
    () => round2(checkingDeposit - checkingPerPaycheck),
    [checkingDeposit, checkingPerPaycheck]
  );

  const cbUtilization = useMemo(() => {
    if (creditBuilderMonthlyFunding <= 0) return 0;
    return Math.min(100, Math.round((creditBuilderMonthly / creditBuilderMonthlyFunding) * 100));
  }, [creditBuilderMonthly, creditBuilderMonthlyFunding]);

  const toggleBillStatus = (id: string) => {
    setBills((current) =>
      current.map((bill) => {
        if (bill.id !== id) return bill;
        const cycle: PayStatus[] = ["planned", "paid_half", "paid_full", "skip"];
        const nextIndex = (cycle.indexOf(bill.status || "planned") + 1) % cycle.length;
        return { ...bill, status: cycle[nextIndex] };
      })
    );
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl p-4 md:p-8">
        <div className="mb-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-3xl font-bold">Bill Flow</h1>
          <p className="mt-2 text-sm text-slate-600">
            Starter dashboard for paycheck planning, Credit Builder tracking, and bill notes.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Bi-weekly net</p>
            <input
              className="mt-3 w-full rounded-xl border border-slate-300 px-3 py-2"
              type="number"
              value={paycheckNet}
              onChange={(e) => setPaycheckNet(Number(e.target.value) || 0)}
            />
            <p className="mt-3 text-2xl font-semibold">{currency(paycheckNet)}</p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Credit Builder split</p>
            <input
              className="mt-3 w-full rounded-xl border border-slate-300 px-3 py-2"
              type="number"
              value={creditBuilderSplit}
              onChange={(e) => setCreditBuilderSplit(Number(e.target.value) || 0)}
            />
            <p className="mt-3 text-2xl font-semibold">{currency(creditBuilderSplit)}</p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Checking after split</p>
            <p className="mt-3 text-2xl font-semibold">{currency(checkingDeposit)}</p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">SNAP monthly</p>
            <input
              className="mt-3 w-full rounded-xl border border-slate-300 px-3 py-2"
              type="number"
              value={snapAmount}
              onChange={(e) => setSnapAmount(Number(e.target.value) || 0)}
            />
            <p className="mt-3 text-2xl font-semibold">{currency(snapAmount)}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {[
            ["dashboard", "Dashboard"],
            ["paycheck", "Paycheck"],
            ["bills", "Bills"],
            ["credit-builder", "Credit Builder"],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setTab(value as typeof tab)}
              className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
                tab === value
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-700 ring-1 ring-slate-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "dashboard" && (
          <div className="mt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard label="This paycheck bills + CB split" value={currency(checkingPerPaycheck + creditBuilderSplit)} />
              <StatCard label="CB monthly use" value={currency(creditBuilderMonthly)} />
              <StatCard label="Checking after planned" value={currency(checkingAfterPlanned)} />
              <StatCard label="SNAP reminder" value={currency(snapAmount)} subtext="Use checking as backup in week 4." />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h2 className="text-xl font-semibold">Paycheck summary</h2>
                <div className="mt-4 space-y-3 text-sm">
                  <Row label="Net paycheck" value={currency(paycheckNet)} />
                  <Row label="Credit Builder split" value={currency(creditBuilderSplit)} />
                  <Row label="Checking deposit" value={currency(checkingDeposit)} />
                  <Row label="Checking bills this paycheck" value={currency(checkingPerPaycheck)} />
                  <div className="my-3 border-t border-slate-200" />
                  <Row
                    label="Remaining after planned checking bills"
                    value={currency(checkingAfterPlanned)}
                    bold
                  />
                </div>
              </section>

              <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h2 className="text-xl font-semibold">Credit Builder health</h2>
                <div className="mt-4 space-y-3 text-sm">
                  <Row label="Monthly funding" value={currency(creditBuilderMonthlyFunding)} />
                  <Row label="Monthly bills" value={currency(creditBuilderMonthly)} />
                  <Row label="Funding load" value={`${cbUtilization}%`} />
                  <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-slate-900"
                      style={{ width: `${cbUtilization}%` }}
                    />
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Monthly buffer</p>
                    <p className="mt-1 text-2xl font-bold">{currency(creditBuilderBuffer)}</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {tab === "paycheck" && (
          <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold">What to pay this paycheck</h2>
            <div className="mt-4 space-y-3">
              {bills.map((bill) => (
                <div
                  key={bill.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{bill.name}</p>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            bill.accountType === "credit_builder"
                              ? "bg-indigo-100 text-indigo-800"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {bill.accountType === "credit_builder" ? "Credit Builder" : "Checking"}
                        </span>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badgeClasses(bill.status)}`}>
                          {statusLabel(bill.status)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {bill.frequency === "monthly" ? "Monthly" : "Every 2 months"} • Suggested this paycheck:{" "}
                        {currency(getPerPaycheckAmount(bill))}
                      </p>
                      {bill.lastPaid ? (
                        <p className="mt-1 text-sm text-slate-500">{bill.lastPaid}</p>
                      ) : null}
                      {bill.note ? (
                        <p className="mt-1 text-sm text-slate-700">{bill.note}</p>
                      ) : null}
                    </div>

                    <button
                      onClick={() => toggleBillStatus(bill.id)}
                      className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
                    >
                      Change status
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "bills" && (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-xl font-semibold">Checking bills</h2>
              <div className="mt-4 space-y-3">
                {checkingBills.map((bill) => (
                  <BillCard key={bill.id} bill={bill} />
                ))}
              </div>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-xl font-semibold">Credit Builder bills</h2>
              <div className="mt-4 space-y-3">
                {creditBuilderBills.map((bill) => (
                  <BillCard key={bill.id} bill={bill} />
                ))}
              </div>
            </section>
          </div>
        )}

        {tab === "credit-builder" && (
          <div className="mt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Direct deposit in" value={currency(creditBuilderMonthlyFunding)} />
              <StatCard label="Fixed bills out" value={currency(creditBuilderMonthly)} />
              <StatCard label="Projected buffer" value={currency(creditBuilderBuffer)} />
              <StatCard label="Suggested target" value="$360–$400" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h2 className="text-xl font-semibold">Use Credit Builder for</h2>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  <li>• Predictable fixed bills</li>
                  <li>• Autopay subscriptions you trust</li>
                  <li>• Credit building without random spending</li>
                </ul>
              </section>

              <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h2 className="text-xl font-semibold">Keep in Checking</h2>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  <li>• Rent and utilities</li>
                  <li>• Food backup for week 4</li>
                  <li>• Variable or emergency costs</li>
                </ul>
              </section>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  subtext,
}: {
  label: string;
  value: string;
  subtext?: string;
}) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-bold">{value}</p>
      {subtext ? <p className="mt-1 text-xs text-slate-500">{subtext}</p> : null}
    </div>
  );
}

function Row({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className={bold ? "font-semibold" : "text-slate-600"}>{label}</span>
      <span className={bold ? "text-lg font-bold" : "font-medium"}>{value}</span>
    </div>
  );
}

function BillCard({ bill }: { bill: Bill }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-medium">{bill.name}</p>
          <p className="text-sm text-slate-500">
            {currency(bill.amount)} • {bill.frequency === "monthly" ? "Monthly" : "Every 2 months"}
          </p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${badgeClasses(bill.status)}`}>
          {statusLabel(bill.status)}
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-slate-600">Per paycheck</span>
        <span className="font-medium">{currency(getPerPaycheckAmount(bill))}</span>
      </div>
      {bill.dueHint ? <p className="mt-2 text-sm text-slate-700">{bill.dueHint}</p> : null}
      {bill.note ? <p className="mt-2 text-sm text-slate-700">{bill.note}</p> : null}
    </div>
  );
}