"use client";

import { useState } from "react";

const colours = [["Pink","#ef3f82"],["Biru","#1749c9"],["Ungu","#5732bd"],["Merah","#db2424"],["Kuning","#f6bd24"],["Tiffany","#40c3ba"],["Hitam","#171717"],["Oatmilk","#d8b486"],["Biru Langit","#42a8e5"],["Bambu Green","#58ae2c"],["Putih","#f7f7f3"],["Maroon","#8e1633"],["Orange","#f2761a"]] as const;
const retail:Record<number,number>={1:8,2:10,3:12,4:15,5:17,6:20,7:22};
const agent:Record<number,number>={1:7,2:9,3:11,4:13,5:15,6:16};
const orders=[
 {id:"CJ-1042",customer:"Aina",item:"Clicker · 3 slot",total:12,status:"Belum dibuat",tone:"new"},
 {id:"CJ-1041",customer:"Mia",item:"Clicker · 5 slot",total:17,status:"Sedang dibuat",tone:"making"},
 {id:"CJ-1040",customer:"SK Seri Damai",item:"Nametag · 24 unit",total:144,status:"Siap",tone:"done"},
 {id:"CJ-1039",customer:"Hani (Ejen)",item:"Clicker · 6 slot",total:16,status:"Siap",tone:"done"},
];

function ColourPicker({label,value,onChange}:{label:string;value:string;onChange:(v:string)=>void}){
 return <fieldset className="field colour-field"><legend>{label}</legend><div className="swatches">{colours.map(([name,hex])=><button type="button" key={name} className={`swatch ${value===name?"selected":""}`} onClick={()=>onChange(name)} aria-label={`${label}: ${name}`} title={name}><span style={{background:hex}}/></button>)}</div><small>{value}</small></fieldset>;
}

export default function Home(){
 const [view,setView]=useState<"shop"|"dashboard">("shop");
 const [type,setType]=useState<"retail"|"agent">("retail");
 const [slots,setSlots]=useState(3); const [name,setName]=useState("AIN");
 const [base,setBase]=useState("Tiffany"),[background,setBackground]=useState("Oatmilk"),[letter,setLetter]=useState("Putih");
 const [step,setStep]=useState<"form"|"pay"|"success">("form");
 const price=type==="agent"?agent[slots]:retail[slots]; const shown=name.trim().toUpperCase()||"NAMA";
 const total=orders.reduce((sum,o)=>sum+o.total,0);
 return <main>
  <header className="topbar"><a className="brand" href="#top"><span>K</span><strong>Kedai Cikgujiwa</strong></a><nav><button className={view==="shop"?"active":""} onClick={()=>setView("shop")}>Kedai</button><button className={view==="dashboard"?"active":""} onClick={()=>setView("dashboard")}>Dashboard</button></nav><a className="whatsapp" href="https://wa.me/" target="_blank">WhatsApp kami</a></header>
  {view==="shop"?<>
   <section className="hero" id="top"><div><p className="eyebrow">Dibuat khas untuk anda</p><h1>Tempah clicker nama<br/><em>semudah pilih warna.</em></h1><p className="lead">Pilih nama, tiga warna kegemaran dan bilangan slot. Kami siapkan dengan teliti dari bengkel kecil Kedai Cikgujiwa.</p><a className="primary" href="#tempah">Mula tempahan <span>→</span></a><div className="trust"><span>✓ Buatan tangan</span><span>✓ Bayaran DuitNow</span><span>✓ Semakan ejaan</span></div></div><div className="hero-card"><img src="/clicker-colours.jpg" alt="Pilihan warna clicker"/><div><b>13 warna tersedia</b><span>Padan ikut gaya anda</span></div></div></section>
   <section className="order-section" id="tempah"><div className="section-heading"><div><p className="eyebrow">Bina clicker anda</p><h2>Satu nama, tiga warna.</h2></div><p>Harga dikira terus mengikut bilangan slot dan jenis pelanggan.</p></div><div className="builder">
    <div className="preview-panel"><div className="preview-head"><span>Pratonton</span><small>Gambaran warna</small></div><div className="clicker-preview">{Array.from({length:slots},(_,i)=>{const bh=colours.find(([n])=>n===base)?.[1],gh=colours.find(([n])=>n===background)?.[1],lh=colours.find(([n])=>n===letter)?.[1];return <div className="slot" style={{background:bh}} key={i}><span style={{background:gh,color:lh}}>{shown[i]||"•"}</span></div>})}</div><div className="preview-label"><b>{shown}</b><span>{base} + {background} + {letter}</span></div><img className="guide" src="/clicker-guide.jpg" alt="Panduan tempahan clicker"/></div>
    <form className="order-form" onSubmit={e=>{e.preventDefault();setStep("pay")}}><div className="segment"><button type="button" className={type==="retail"?"selected":""} onClick={()=>setType("retail")}>Pelanggan biasa</button><button type="button" className={type==="agent"?"selected":""} onClick={()=>{setType("agent");if(slots===7)setSlots(6)}}>Ejen</button></div><label className="field"><span>Nama pada clicker</span><input value={name} maxLength={type==="agent"?6:7} onChange={e=>{setName(e.target.value);setSlots(Math.max(1,Math.min(type==="agent"?6:7,e.target.value.length||1)))}} placeholder="Contoh: AIN"/><small>Maksimum {type==="agent"?6:7} huruf</small></label><fieldset className="field"><legend>Bilangan slot</legend><div className="slot-options">{Object.keys(type==="agent"?agent:retail).map(Number).map(n=><button type="button" key={n} onClick={()=>setSlots(n)} className={slots===n?"selected":""}>{n}</button>)}</div></fieldset><ColourPicker label="Warna base" value={base} onChange={setBase}/><ColourPicker label="Warna background" value={background} onChange={setBackground}/><ColourPicker label="Warna huruf" value={letter} onChange={setLetter}/><div className="checkout"><div><small>Jumlah</small><strong>{price?`RM${price}.00`:"—"}</strong></div><button className="primary" type="submit">Teruskan bayaran →</button></div></form>
   </div></section>
  </>:<section className="dashboard"><div className="dash-heading"><div><p className="eyebrow">Jumaat, 21 Ogos</p><h1>Selamat datang, Cikgujiwa.</h1></div><button className="primary">+ Order WhatsApp</button></div><div className="stats"><article><span>Jualan hari ini</span><b>RM{total}.00</b><small>4 bayaran disahkan</small></article><article><span>Belum dibuat</span><b>1</b><small>Perlu tindakan</small></article><article><span>Sedang dibuat</span><b>1</b><small>Dalam produksi</small></article><article><span>Siap</span><b>2</b><small>Sedia dihantar</small></article></div><div className="order-board"><div className="board-head"><div><h2>Order terkini</h2><p>Kemas kini langsung daripada kedai dan WhatsApp.</p></div><div className="filter"><button className="selected">Semua</button><button>Belum siap</button><button>Siap</button></div></div><div className="table"><div className="tr header"><span>No. order</span><span>Pelanggan</span><span>Produk</span><span>Jumlah</span><span>Status</span></div>{orders.map(o=><div className="tr" key={o.id}><b>{o.id}</b><span>{o.customer}</span><span>{o.item}</span><span>RM{o.total}.00</span><span><i className={o.tone}>{o.status}</i></span></div>)}</div></div></section>}
  {step!=="form"&&<div className="modal-backdrop"><section className="payment-modal" role="dialog" aria-modal="true"><button className="close" onClick={()=>setStep("form")}>×</button>{step==="pay"?<><p className="eyebrow">Langkah terakhir</p><h2>Bayar RM{price}.00</h2><p>Imbas QR DuitNow. Selepas pembayaran, muat naik resit untuk semakan kami.</p><img src="/duitnow-qr.png" alt="QR DuitNow Kedai Cikgujiwa"/><label className="upload"><input type="file" accept="image/*,.pdf"/><span>＋</span><b>Muat naik resit bayaran</b><small>JPG, PNG atau PDF</small></label><button className="primary full" onClick={()=>setStep("success")}>Saya sudah bayar</button></>:<div className="success"><span>✓</span><h2>Tempahan diterima!</h2><p>Nombor order anda ialah <b>CJ-1043</b>. Kami akan semak pembayaran dan hubungi anda melalui WhatsApp.</p><button className="primary full" onClick={()=>setStep("form")}>Selesai</button></div>}</section></div>}
 </main>;
}
