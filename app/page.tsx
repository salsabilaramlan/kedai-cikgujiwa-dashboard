"use client";
import { useEffect, useMemo, useState } from "react";
type Status = "Belum dibuat" | "Sedang dibuat" | "Siap";
type Order = {
  key: string;
  sheet: string;
  row: number;
  customer: string;
  name: string;
  details: string;
  quantity: number;
  amount: number;
  payment: string;
  date: string;
  phone: string;
  status: Status;
  base: string;
  background: string;
  letter: string;
};
type Job = {
  key: string;
  color: string;
  title: string;
  qty: number;
  unit: string;
  names: string[];
  orderKeys: string[];
  detail?: string;
};
const tabs = [
  "Semua",
  "CLICKER",
  "PHOTO",
  "MAGNET",
  "NAMETAG",
  "KOPI",
  "NFC",
  "KAD PSS",
];
const tabLabel: Record<string, string> = {
  CLICKER: "Clicker",
  PHOTO: "Photo",
  MAGNET: "Fridge Magnet",
  NAMETAG: "Nametag",
  KOPI: "Kopi",
  NFC: "NFC Tag",
  "KAD PSS": "Kad PSS",
};
const tabIcon: Record<string, string> = {
  CLICKER: "C",
  PHOTO: "P",
  MAGNET: "M",
  NAMETAG: "N",
  KOPI: "K",
  NFC: "N",
  "KAD PSS": "K",
};
const colourHex: Record<string, string> = {
  PINK: "#ef3f82",
  BIRU: "#1855cf",
  BLUE: "#1855cf",
  UNGU: "#6337c5",
  PURPLE: "#6337c5",
  MERAH: "#dd2929",
  RED: "#dd2929",
  KUNING: "#f4bd24",
  YELLOW: "#f4bd24",
  TIFFANY: "#43c7bd",
  "TIFFANY BLUE": "#43c7bd",
  HITAM: "#171717",
  BLACK: "#171717",
  OATMILK: "#d9b789",
  "BIRU LANGIT": "#48abe7",
  "BAMBU GREEN": "#5cad30",
  PUTIH: "#f6f5ef",
  WHITE: "#f6f5ef",
  MAROON: "#8b1535",
  ORANGE: "#f1791b",
  HIJAU: "#55a938",
  GREEN: "#55a938",
};
const hex = (c: string) => colourHex[c.trim().toUpperCase()] || "#a4afa9";
const slots = (name: string) =>
  Math.max(1, Math.min(7, [...name.trim()].length));
function groupJobs(orders: Order[], kind: "base" | "background" | "letter") {
  const map = new Map<string, Job>();
  for (const o of orders) {
    const color = o[kind] || "Tidak dinyatakan",
      s = slots(o.name),
      key =
        kind === "base" ? `${color.toUpperCase()}-${s}` : color.toUpperCase();
    let j = map.get(key);
    if (!j) {
      j = {
        key,
        color,
        title: kind === "base" ? `${color} · ${s} slot` : color,
        qty: 0,
        unit: kind === "base" ? "base" : "keping",
        names: [],
        orderKeys: [],
      };
      map.set(key, j);
    }
    j.qty += kind === "base" ? 1 : s;
    j.names.push(o.name);
    j.orderKeys.push(o.key);
    if (kind === "letter") {
      const count = new Map<string, number>();
      for (const name of j.names)
        for (const c of name.toUpperCase())
          count.set(c, (count.get(c) || 0) + 1);
      j.detail = [...count].map(([c, n]) => `${c}×${n}`).join("  ");
    }
  }
  return [...map.values()].sort((a, b) => b.qty - a.qty);
}
function groupInsertJobs(orders: Order[]) {
  const map = new Map<string, Job>();
  for (const o of orders) {
    const background = o.background || "Tidak dinyatakan";
    const letter = o.letter || "Tidak dinyatakan";
    const key = `${background.toUpperCase()}|${letter.toUpperCase()}`;
    const size = slots(o.name);
    let job = map.get(key);
    if (!job) {
      job = {
        key,
        color: background,
        title: `${background} + ${letter}`,
        qty: 0,
        unit: "item",
        names: [],
        orderKeys: [],
      };
      map.set(key, job);
    }
    job.qty += size;
    job.names.push(o.name);
    job.orderKeys.push(o.key);
    const letters = new Map<string, number>();
    for (const name of job.names)
      for (const character of name.toUpperCase())
        letters.set(character, (letters.get(character) || 0) + 1);
    job.detail = [...letters]
      .map(([character, count]) => `${character}×${count}`)
      .join("  ");
  }
  return [...map.values()].sort((a, b) => b.qty - a.qty);
}
export default function Home() {
  const [orders, setOrders] = useState<Order[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [sync, setSync] = useState(""),
    [view, setView] = useState<"dashboard" | "print">("dashboard");
  const [tab, setTab] = useState("Semua"),
    [status, setStatus] = useState<"Semua" | Status>("Semua"),
    [query, setQuery] = useState("");
  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/orders", { cache: "no-store" });
      const d = await r.json();
      if (!r.ok) throw 0;
      setOrders(d.orders || []);
      setSync(d.syncedAt);
      setError("");
    } catch {
      setError("Google Sheet tidak dapat dibaca sekarang. Cuba semula.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  async function change(o: Order, next: Status) {
    const old = orders;
    setOrders((v) =>
      v.map((x) => (x.key === o.key ? { ...x, status: next } : x)),
    );
    const r = await fetch("/api/orders", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ key: o.key, status: next }),
    });
    if (!r.ok) {
      setOrders(old);
      setError("Status tidak berjaya disimpan.");
    }
  }
  async function bulkStart(keys: string[]) {
    setOrders((v) =>
      v.map((o) =>
        keys.includes(o.key) && o.status === "Belum dibuat"
          ? { ...o, status: "Sedang dibuat" }
          : o,
      ),
    );
    await Promise.all(
      keys.map((key) =>
        fetch("/api/orders", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ key, status: "Sedang dibuat" }),
        }),
      ),
    );
  }
  const filtered = useMemo(
    () =>
      orders.filter(
        (o) =>
          (tab === "Semua" || o.sheet === tab) &&
          (status === "Semua" || o.status === status) &&
          `${o.customer} ${o.name} ${o.details}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [orders, tab, status, query],
  );
  const counts = {
    all: orders.length,
    new: orders.filter((o) => o.status === "Belum dibuat").length,
    making: orders.filter((o) => o.status === "Sedang dibuat").length,
    done: orders.filter((o) => o.status === "Siap").length,
  };
  const sales = orders.reduce((s, o) => s + o.amount, 0),
    paid = orders
      .filter((o) => /paid|bayar/i.test(o.payment))
      .reduce((s, o) => s + o.amount, 0);
  const products = tabs
      .slice(1)
      .map((t) => ({
        tab: t,
        count: orders.filter((o) => o.sheet === t).length,
      }))
      .sort((a, b) => b.count - a.count),
    max = Math.max(...products.map((p) => p.count), 1);
  const printOrders = orders.filter(
      (o) => o.sheet === "CLICKER" && o.status !== "Siap" && o.name,
    ),
    baseJobs = groupJobs(printOrders, "base"),
    insertJobs = groupInsertJobs(printOrders);
  return (
    <main className="sheet-dashboard">
      <aside>
        <div className="brand">
          <span>K</span>
          <div>
            <b>Kedai Cikgujiwa</b>
            <small>Operations</small>
          </div>
        </div>
        <div className="nav-title">Menu utama</div>
        <nav>
          <button
            className={view === "dashboard" ? "active" : ""}
            onClick={() => setView("dashboard")}
          >
            <span>▦</span> Dashboard
          </button>
          <button
            className={view === "print" ? "active" : ""}
            onClick={() => setView("print")}
          >
            <span>◈</span> Pelan Cetakan <i>{printOrders.length}</i>
          </button>
          <a
            href="https://docs.google.com/spreadsheets/d/12pkJMTSPvT6VEgHK9Xkjxrmf7g8kxx96geToszeXbbU/edit"
            target="_blank"
          >
            <span>▤</span> Google Sheet <i>↗</i>
          </a>
        </nav>
        {view === "dashboard" && (
          <>
            <div className="nav-title">Produk</div>
            <div className="product-nav">
              <button
                className={tab === "Semua" ? "active" : ""}
                onClick={() => setTab("Semua")}
              >
                <span>✦</span> Semua produk <i>{orders.length}</i>
              </button>
              {tabs.slice(1).map((t) => (
                <button
                  key={t}
                  className={tab === t ? "active" : ""}
                  onClick={() => setTab(t)}
                >
                  <span>{tabIcon[t]}</span>
                  {tabLabel[t]}
                  <i>{orders.filter((o) => o.sheet === t).length}</i>
                </button>
              ))}
            </div>
          </>
        )}
        <div className="sheet-live">
          <span></span>
          <div>
            <b>Google Sheet Live</b>
            <small>
              {sync
                ? `Diselaraskan ${new Date(sync).toLocaleTimeString("ms-MY", { hour: "2-digit", minute: "2-digit" })}`
                : "Menyambung…"}
            </small>
          </div>
        </div>
      </aside>
      <section className="main-area">
        <header>
          <div>
            <p>
              {view === "dashboard"
                ? "Ringkasan operasi"
                : "Pengurusan produksi"}
            </p>
            <h1>
              {view === "dashboard"
                ? "Selamat datang, Cikgujiwa"
                : "Pelan Cetakan Clicker"}
            </h1>
          </div>
          <button className="refresh" onClick={load} disabled={loading}>
            <span className={loading ? "spin" : ""}>↻</span>
            {loading ? "Menyelaras…" : "Segarkan data"}
          </button>
        </header>
        {view === "dashboard" ? (
          <>
            <section className="metrics">
              <article>
                <div>
                  <small>Jumlah order</small>
                  <strong>{counts.all}</strong>
                  <p>Daripada 7 kategori</p>
                </div>
                <i className="ico dark">▦</i>
              </article>
              <article>
                <div>
                  <small>Belum dibuat</small>
                  <strong>{counts.new}</strong>
                  <p>Perlu tindakan</p>
                </div>
                <i className="ico orange">◷</i>
              </article>
              <article>
                <div>
                  <small>Sedang dibuat</small>
                  <strong>{counts.making}</strong>
                  <p>Dalam produksi</p>
                </div>
                <i className="ico blue">◌</i>
              </article>
              <article>
                <div>
                  <small>Sudah siap</small>
                  <strong>{counts.done}</strong>
                  <p>
                    {counts.all
                      ? Math.round((counts.done / counts.all) * 100)
                      : 0}
                    % keseluruhan
                  </p>
                </div>
                <i className="ico yellow">✓</i>
              </article>
            </section>
            <section className="insights">
              <article className="sales-card">
                <div className="card-title">
                  <div>
                    <span>Nilai tempahan</span>
                    <h2>
                      RM
                      {sales.toLocaleString("en-MY", {
                        minimumFractionDigits: 2,
                      })}
                    </h2>
                  </div>
                  <i>RM</i>
                </div>
                <div className="sales-split">
                  <div>
                    <span>Direkod bayar</span>
                    <b>
                      RM
                      {paid.toLocaleString("en-MY", {
                        minimumFractionDigits: 2,
                      })}
                    </b>
                  </div>
                  <div>
                    <span>Baki / belum ditanda</span>
                    <b>
                      RM
                      {Math.max(0, sales - paid).toLocaleString("en-MY", {
                        minimumFractionDigits: 2,
                      })}
                    </b>
                  </div>
                </div>
              </article>
              <article className="product-card">
                <div className="card-title">
                  <div>
                    <span>Order mengikut produk</span>
                    <h3>Prestasi kategori</h3>
                  </div>
                </div>
                <div className="bars">
                  {products.slice(0, 5).map((p) => (
                    <div key={p.tab}>
                      <span>{tabLabel[p.tab]}</span>
                      <div>
                        <i style={{ width: `${(p.count / max) * 100}%` }}></i>
                      </div>
                      <b>{p.count}</b>
                    </div>
                  ))}
                </div>
              </article>
            </section>
            <section className="orders-panel">
              <div className="orders-head">
                <div>
                  <h2>Senarai tempahan</h2>
                  <p>{filtered.length} order dipaparkan</p>
                </div>
                <div className="tools">
                  <label>
                    ⌕
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Cari pelanggan atau tempahan"
                    />
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as typeof status)}
                  >
                    <option>Semua</option>
                    <option>Belum dibuat</option>
                    <option>Sedang dibuat</option>
                    <option>Siap</option>
                  </select>
                </div>
              </div>
              {error && (
                <div className="error">
                  {error}
                  <button onClick={load}>Cuba lagi</button>
                </div>
              )}
              {loading ? (
                <div className="empty">Menyelaraskan data Google Sheet…</div>
              ) : filtered.length === 0 ? (
                <div className="empty">
                  <b>Tiada order ditemui</b>
                  <span>Cuba tukar carian atau penapis.</span>
                </div>
              ) : (
                <div className="table">
                  <div className="tr table-header">
                    <span>Pelanggan & tempahan</span>
                    <span>Produk</span>
                    <span>Bayaran</span>
                    <span>Jumlah</span>
                    <span>Status kerja</span>
                  </div>
                  {filtered.map((o) => (
                    <div
                      className={`tr ${o.status === "Siap" ? "is-done" : ""}`}
                      key={o.key}
                    >
                      <div className="customer">
                        <i>{o.customer.slice(0, 2).toUpperCase()}</i>
                        <div>
                          <b>{o.customer}</b>
                          <p>
                            {o.name}
                            {o.details && ` · ${o.details}`}
                          </p>
                          <small>Baris {o.row} dalam Google Sheet</small>
                        </div>
                      </div>
                      <span className="pill product">{tabLabel[o.sheet]}</span>
                      <span
                        className={`pay ${/paid|bayar/i.test(o.payment) ? "paid" : ""}`}
                      >
                        {o.payment || "Belum ditanda"}
                      </span>
                      <b className="amount">RM{o.amount.toFixed(2)}</b>
                      <select
                        className={`status ${o.status.replaceAll(" ", "-").toLowerCase()}`}
                        value={o.status}
                        onChange={(e) => change(o, e.target.value as Status)}
                      >
                        <option>Belum dibuat</option>
                        <option>Sedang dibuat</option>
                        <option>Siap</option>
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : (
          <PrintPlan
            orders={printOrders}
            base={baseJobs}
            insert={insertJobs}
            onStart={bulkStart}
            loading={loading}
          />
        )}
        <footer>
          Data order dibaca terus daripada Google Sheet. Status kerja dan
          kumpulan cetakan diuruskan dalam dashboard.
        </footer>
      </section>
    </main>
  );
}
function PrintPlan({
  orders,
  base,
  insert,
  onStart,
  loading,
}: {
  orders: Order[];
  base: Job[];
  insert: Job[];
  onStart: (k: string[]) => void;
  loading: boolean;
}) {
  const active = orders.filter((o) => o.status === "Sedang dibuat").length;
  return (
    <div className="print-plan">
      <section className="print-summary">
        <article>
          <small>Clicker belum siap</small>
          <strong>{orders.length}</strong>
          <span>order untuk dicetak</span>
        </article>
        <article>
          <small>Batch cetakan</small>
          <strong>{base.length + insert.length}</strong>
          <span>base dan item gabungan</span>
        </article>
        <article>
          <small>Sedang diproses</small>
          <strong>{active}</strong>
          <span>order telah dimulakan</span>
        </article>
      </section>
      <div className="print-note">
        <b>◈ Cetak secara batch</b>
        <span>
          Base diasingkan mengikut warna dan slot. Background + huruf dikira
          sebagai satu item dan dikumpulkan mengikut kombinasi warna.
        </span>
      </div>
      {loading ? (
        <div className="empty">Menyediakan pelan cetakan…</div>
      ) : orders.length === 0 ? (
        <div className="empty">
          <b>Semua Clicker sudah siap</b>
          <span>Tiada komponen yang perlu dicetak.</span>
        </div>
      ) : (
        <div className="print-columns two">
          <JobColumn
            title="1. Base"
            subtitle="Satu base bagi setiap nama"
            jobs={base}
            onStart={onStart}
          />
          <JobColumn
            title="2. Background + Huruf"
            subtitle="Satu item gabungan bagi setiap slot"
            jobs={insert}
            onStart={onStart}
          />
        </div>
      )}
    </div>
  );
}
function JobColumn({
  title,
  subtitle,
  jobs,
  onStart,
}: {
  title: string;
  subtitle: string;
  jobs: Job[];
  onStart: (k: string[]) => void;
}) {
  return (
    <section className="job-column">
      <header>
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <span>{jobs.length} batch</span>
      </header>
      <div className="job-stack">
        {jobs.map((j) => (
          <article className="job-card" key={j.key}>
            <div className="job-top">
              <i style={{ background: hex(j.color) }}></i>
              <div>
                <b>{j.title}</b>
                <span>
                  {j.qty} {j.unit}
                </span>
              </div>
              <strong>{j.qty}</strong>
            </div>
            {j.detail && <div className="letters">{j.detail}</div>}
            <p>{j.names.join(" · ")}</p>
            <button onClick={() => onStart(j.orderKeys)}>
              Tanda sedang diproses
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
