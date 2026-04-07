import { useState, useEffect, useRef } from "react";
import { jsPDF } from "jspdf";

const NICHOS = [
  { id: "beleza", emoji: "💇", label: "Beleza & Estética", vendas: "atendimentos", cliente: "clientes", ticketRef: 120, margemRef: 45 },
  { id: "saude", emoji: "🏋️", label: "Saúde & Bem-estar", vendas: "sessões", cliente: "pacientes", ticketRef: 180, margemRef: 50 },
  { id: "educacao", emoji: "📚", label: "Educação & Aulas", vendas: "aulas", cliente: "alunos", ticketRef: 100, margemRef: 60 },
  { id: "consultoria", emoji: "💼", label: "Consultoria & Coaching", vendas: "projetos", cliente: "clientes", ticketRef: 500, margemRef: 65 },
  { id: "alimentacao", emoji: "🍔", label: "Alimentação & Food", vendas: "pedidos", cliente: "clientes", ticketRef: 45, margemRef: 30 },
  { id: "varejo", emoji: "🛍️", label: "Varejo & Comércio", vendas: "vendas", cliente: "clientes", ticketRef: 90, margemRef: 35 },
  { id: "servicos", emoji: "🔧", label: "Serviços Gerais", vendas: "serviços", cliente: "clientes", ticketRef: 200, margemRef: 40 },
  { id: "outros", emoji: "✨", label: "Outro segmento", vendas: "vendas", cliente: "clientes", ticketRef: 150, margemRef: 40 },
];

const PRO_CODE = "BUSPRO2025";
const fmt = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v || 0);
const fmtN = (v) => new Intl.NumberFormat("pt-BR").format(Math.round(v || 0));

function useCurrencyInput(initial = 0) {
  const [value, setValue] = useState(initial);
  const [display, setDisplay] = useState("");
  const handleChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    const num = parseFloat(raw) / 100 || 0;
    setValue(num);
    setDisplay(raw === "" ? "" : num.toLocaleString("pt-BR", { minimumFractionDigits: 2 }));
  };
  const reset = () => { setValue(0); setDisplay(""); };
  return { value, display, handleChange, reset };
}

const Progress = ({ step, total }) => (
  <div style={{ display: "flex", gap: "6px", justifyContent: "center", marginBottom: "28px" }}>
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} style={{ height: "4px", flex: 1, maxWidth: "40px", borderRadius: "2px", background: i < step ? "#FF6B35" : "#e8e8e8", transition: "background 0.3s" }} />
    ))}
  </div>
);

const Tag = ({ children, active, onClick }) => (
  <button onClick={onClick} style={{
    padding: "10px 14px", borderRadius: "12px", border: `2px solid ${active ? "#FF6B35" : "#e8e8e8"}`,
    background: active ? "#fff5f1" : "#fafafa", color: active ? "#FF6B35" : "#555",
    fontWeight: "700", fontSize: "13px", cursor: "pointer", fontFamily: "'Sora', sans-serif",
    transition: "all 0.2s", display: "flex", alignItems: "center", gap: "6px"
  }}>{children}</button>
);

const ScoreBar = ({ label, value, max, color, suffix = "" }) => {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ marginBottom: "14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
        <span style={{ fontSize: "12px", fontWeight: "700", color: "#777", fontFamily: "'Sora', sans-serif", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
        <span style={{ fontSize: "13px", fontWeight: "800", color, fontFamily: "'Space Grotesk', sans-serif" }}>{value}{suffix}</span>
      </div>
      <div style={{ height: "8px", background: "#f0f0f0", borderRadius: "4px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: "4px", transition: "width 1s ease" }} />
      </div>
    </div>
  );
};

const Insight = ({ icon, text, type = "info" }) => {
  const colors = { info: ["#eff6ff", "#3b82f6"], warning: ["#fffbeb", "#f59e0b"], danger: ["#fef2f2", "#ef4444"], success: ["#f0fdf4", "#22c55e"] };
  const [bg, accent] = colors[type];
  return (
    <div style={{ background: bg, borderLeft: `4px solid ${accent}`, borderRadius: "0 12px 12px 0", padding: "12px 14px", marginBottom: "10px", display: "flex", gap: "10px", alignItems: "flex-start" }}>
      <span style={{ fontSize: "18px" }}>{icon}</span>
      <p style={{ margin: 0, fontSize: "13px", color: "#333", lineHeight: 1.6, fontFamily: "'Sora', sans-serif" }} dangerouslySetInnerHTML={{ __html: text }} />
    </div>
  );
};

const ProBadge = () => (
  <span style={{ background: "linear-gradient(135deg, #FF6B35, #ff8c42)", color: "#fff", fontSize: "10px", fontWeight: "800", padding: "3px 8px", borderRadius: "6px", marginLeft: "8px", letterSpacing: "0.05em" }}>PRO</span>
);

const BigNumber = ({ label, value, color = "#1a1a1a", sub }) => (
  <div style={{ textAlign: "center", background: "#f8f8f8", borderRadius: "16px", padding: "20px", marginBottom: "12px" }}>
    <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: "700", color: "#999", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
    <p style={{ margin: "0 0 2px", fontSize: "32px", fontWeight: "800", color, fontFamily: "'Space Grotesk', sans-serif" }}>{value}</p>
    {sub && <p style={{ margin: 0, fontSize: "13px", color: "#888" }}>{sub}</p>}
  </div>
);

export default function App() {
  const [step, setStep] = useState(0);
  const [nicho, setNicho] = useState(null);
  const [nome, setNome] = useState("");
  const despesas = useCurrencyInput(0);
  const ticket = useCurrencyInput(0);
  const [margem, setMargem] = useState(null);
  const [diasUteis, setDiasUteis] = useState(22);
  const [result, setResult] = useState(null);
  const [proUnlocked, setProUnlocked] = useState(false);
  const [proCode, setProCode] = useState("");
  const [proCodeError, setProCodeError] = useState(false);
  const [proTab, setProTab] = useState("plano");
  const [cenarios, setCenarios] = useState([]);
  const [reajuste, setReajuste] = useState(10);
  const [horasSemana, setHorasSemana] = useState(44);
  const [diasFerias, setDiasFerias] = useState(15);
  const [salarioDesejado, setSalarioDesejado] = useState(8000);
  const [custoNovoFunc, setCustoNovoFunc] = useState(2000);
  const topRef = useRef(null);

  useEffect(() => { topRef.current?.scrollIntoView({ behavior: "smooth" }); }, [step]);
  useEffect(() => { const s = localStorage.getItem("buspro"); if (s === "true") setProUnlocked(true); }, []);

  const nichoData = NICHOS.find(n => n.id === nicho) || NICHOS[7];

  const calcular = () => {
    const m = margem / 100;
    const faturamentoNecessario = despesas.value / (1 - m);
    const vendasMes = Math.ceil(faturamentoNecessario / ticket.value);
    const vendasDia = Math.ceil(vendasMes / diasUteis);
    const metaDiaria = vendasDia * ticket.value;
    const metaSemanal = metaDiaria * 5;
    const metaMensal = faturamentoNecessario;
    const lucroMensal = metaMensal - despesas.value;
    const ticketVsRef = ((ticket.value - nichoData.ticketRef) / nichoData.ticketRef) * 100;
    const margemVsRef = margem - nichoData.margemRef;
    const scoreTicket = Math.min((ticket.value / nichoData.ticketRef) * 30, 40);
    const scoreMargem = Math.min((margem / nichoData.margemRef) * 30, 35);
    const scoreCarga = Math.max(0, 25 - (vendasDia > 5 ? (vendasDia - 5) * 5 : 0));
    const score = Math.round(scoreTicket + scoreMargem + scoreCarga);
    const ticketPlus20 = ticket.value * 1.2;
    const vendasComTicketMaior = Math.ceil(faturamentoNecessario / ticketPlus20);
    const economiaVendas = vendasMes - vendasComTicketMaior;
    const diasPlus5 = diasUteis + 5;
    const vendasComMaisDias = Math.ceil(faturamentoNecessario / ticket.value / diasPlus5);
    const r = {
      faturamentoNecessario, vendasMes, vendasDia, metaDiaria, metaSemanal,
      metaMensal, lucroMensal, ticketVsRef, margemVsRef, score,
      ticketPlus20, vendasComTicketMaior, economiaVendas,
      diasPlus5, vendasComMaisDias, dificuldade: Math.min((vendasDia / 8) * 100, 100),
    };
    setResult(r);
    setCenarios([{ nome: "Cenário Atual", ticket: ticket.value, margem, diasUteis, ...r }]);
    setStep(6);
  };

  const addCenario = (nomeC, ticketC, margemC, diasC) => {
    if (cenarios.length >= 3) return;
    const mc = margemC / 100;
    const fat = despesas.value / (1 - mc);
    const vm = Math.ceil(fat / ticketC);
    const vd = Math.ceil(vm / diasC);
    const md = vd * ticketC;
    const ms = md * 5;
    const lm = fat - despesas.value;
    const sc = Math.round(Math.min((ticketC / nichoData.ticketRef) * 30, 40) + Math.min((margemC / nichoData.margemRef) * 30, 35) + Math.max(0, 25 - (vd > 5 ? (vd - 5) * 5 : 0)));
    setCenarios(prev => [...prev, { nome: nomeC, ticket: ticketC, margem: margemC, diasUteis: diasC, faturamentoNecessario: fat, vendasMes: vm, vendasDia: vd, metaDiaria: md, metaSemanal: ms, metaMensal: fat, lucroMensal: lm, score: sc }]);
  };

  const removeCenario = (idx) => { if (idx === 0) return; setCenarios(prev => prev.filter((_, i) => i !== idx)); };

  const handleProCode = () => {
    if (proCode.trim().toUpperCase() === PRO_CODE) { setProUnlocked(true); setProCodeError(false); localStorage.setItem("buspro", "true"); }
    else setProCodeError(true);
  };

  // ===== CÁLCULOS PRO =====
  const getHoraReal = () => {
    const horasMes = horasSemana * 4.33;
    const lucro = result ? result.lucroMensal : 0;
    const fat = result ? result.faturamentoNecessario : 0;
    const valorHoraLucro = lucro / horasMes;
    const valorHoraFat = fat / horasMes;
    return { horasMes: Math.round(horasMes), valorHoraLucro, valorHoraFat };
  };

  const getCLT = () => {
    const lucro = result ? result.lucroMensal : 0;
    const salBruto = lucro;
    const ferias = salBruto / 12;
    const terco = ferias / 3;
    const decimo = salBruto / 12;
    const fgts = salBruto * 0.08;
    const inss = Math.min(salBruto * 0.14, 908.85);
    const totalCLT = salBruto + ferias + terco + decimo + fgts;
    const custoInvisivel = ferias + terco + decimo + fgts + inss;
    return { salBruto, ferias, terco, decimo, fgts, inss, totalCLT, custoInvisivel };
  };

  const getFerias = () => {
    const custoDiario = despesas.value / 30;
    const custoFerias = custoDiario * diasFerias;
    const lucroPerdia = result ? result.lucroMensal / 30 : 0;
    const ganhoPerdia = lucroPerdia * diasFerias;
    const totalNecessario = custoFerias + ganhoPerdia;
    const guardarPorMes = totalNecessario / 12;
    return { custoDiario, custoFerias, ganhoPerdia, totalNecessario, guardarPorMes };
  };

  const getPrecificacaoReversa = () => {
    const fat = (salarioDesejado + despesas.value);
    const ticketIdeal = fat / (result ? result.vendasMes : 1);
    const vendasDia = result ? Math.ceil(result.vendasMes / diasUteis) : 1;
    const ticketPorDia = fat / diasUteis / vendasDia;
    return { faturamentoNecessario: fat, ticketIdeal, vendasDia, ticketPorDia };
  };

  const getContratacao = () => {
    const novasDespesas = despesas.value + custoNovoFunc;
    const m = margem / 100;
    const novoFat = novasDespesas / (1 - m);
    const novasVendasMes = Math.ceil(novoFat / ticket.value);
    const novasVendasDia = Math.ceil(novasVendasMes / diasUteis);
    const vendasExtra = novasVendasMes - result.vendasMes;
    const novoLucro = novoFat - novasDespesas;
    const compensa = novoLucro >= result.lucroMensal;
    return { novasDespesas, novoFat, novasVendasMes, novasVendasDia, vendasExtra, novoLucro, compensa };
  };

  const getPlanoAcao = () => {
    const acoes = [];
    // Semana 1
    const s1 = [];
    if (result.ticketVsRef < -10) s1.push(`Reajuste seus preços em pelo menos ${Math.min(15, Math.abs(Math.round(result.ticketVsRef)))}%. Seu ticket está abaixo da média do mercado (${fmt(nichoData.ticketRef)}).`);
    else s1.push("Revise sua tabela de preços. Identifique os 3 serviços/produtos mais vendidos e avalie se há espaço pra reajuste.");
    s1.push("Liste todas as suas despesas fixas e variáveis numa planilha. Saiba exatamente pra onde vai cada real.");
    s1.push(`Defina sua meta diária de ${result.vendasDia} ${nichoData.vendas} e cole num lugar visível.`);
    acoes.push({ semana: 1, titulo: "Diagnóstico & Precificação", acoes: s1 });
    // Semana 2
    const s2 = [];
    if (margem < nichoData.margemRef) s2.push(`Sua margem (${margem}%) está abaixo da referência (${nichoData.margemRef}%). Identifique 2 despesas que pode reduzir ou eliminar.`);
    else s2.push("Sua margem está boa. Foque em manter e busque fornecedores alternativos pra reduzir custos sem perder qualidade.");
    s2.push(`Crie um pacote ou combo dos seus serviços mais populares com ticket acima de ${fmt(ticket.value * 1.3)}. Pacotes aumentam o ticket médio.`);
    s2.push("Peça depoimentos pra 5 clientes satisfeitos. Use nas redes sociais e no WhatsApp Business.");
    acoes.push({ semana: 2, titulo: "Otimização & Pacotes", acoes: s2 });
    // Semana 3
    const s3 = [];
    s3.push("Crie uma oferta especial para novos clientes indicados pelos atuais. Programa de indicação simples: quem indicar ganha um desconto.");
    if (result.vendasDia > 5) s3.push(`Você precisa de ${result.vendasDia} ${nichoData.vendas}/dia — carga alta. Considere delegar tarefas operacionais pra focar no que gera receita.`);
    else s3.push(`Meta de ${result.vendasDia} ${nichoData.vendas}/dia é alcançável. Foque em garantir essa consistência todo dia.`);
    s3.push("Revise seu perfil no Google Meu Negócio e Instagram. Atualize fotos, horários e adicione seus serviços com preços.");
    acoes.push({ semana: 3, titulo: "Captação & Marketing", acoes: s3 });
    // Semana 4
    const s4 = [];
    s4.push("Analise os resultados do mês: bateu a meta? Quantos dias ficou acima/abaixo? Identifique padrões.");
    s4.push(`Calcule seu lucro real do mês e compare com a meta de ${fmt(result.lucroMensal)}. Se ficou abaixo, identifique o gargalo.`);
    s4.push("Planeje o próximo mês: defina uma meta 10% maior e repita as ações que funcionaram.");
    s4.push("Separe pelo menos 10% do lucro como reserva. Isso te dá segurança pra investir no crescimento.");
    acoes.push({ semana: 4, titulo: "Análise & Planejamento", acoes: s4 });
    return acoes;
  };

  const getPontoEquilibrio = () => {
    const custoFixo = despesas.value;
    const margemContribuicao = ticket.value * (margem / 100);
    const pe = Math.ceil(custoFixo / margemContribuicao);
    const faturamentoPE = pe * ticket.value;
    return { vendas: pe, faturamento: faturamentoPE, porDia: Math.ceil(pe / diasUteis) };
  };

  const getProjecao6Meses = () => {
    const meses = [];
    for (let i = 0; i < 6; i++) {
      const crescimento = 1 + (reajuste / 100) * (i / 5);
      const ticketProjetado = ticket.value * crescimento;
      const fat = despesas.value / (1 - margem / 100);
      const vm = Math.ceil(fat / ticketProjetado);
      const vd = Math.ceil(vm / diasUteis);
      const lucro = fat - despesas.value;
      meses.push({ mes: i + 1, ticket: ticketProjetado, vendasMes: vm, vendasDia: vd, faturamento: fat, lucro });
    }
    return meses;
  };

  const gerarPDF = () => {
    const doc = new jsPDF();
    const w = doc.internal.pageSize.getWidth();
    let y = 20;
    doc.setFontSize(22); doc.setTextColor(255, 107, 53);
    doc.text("BusinessOne - Relatório Financeiro", w / 2, y, { align: "center" });
    y += 12;
    doc.setFontSize(12); doc.setTextColor(100);
    doc.text(nome || "Seu negócio", w / 2, y, { align: "center" });
    y += 6;
    doc.text(`Segmento: ${nichoData.label}`, w / 2, y, { align: "center" });
    y += 16;
    doc.setDrawColor(230); doc.line(20, y, w - 20, y); y += 12;
    doc.setFontSize(14); doc.setTextColor(30);
    doc.text("Score Financeiro: " + result.score + "/100", 20, y); y += 12;
    const items = [
      ["Despesas mensais", fmt(despesas.value)], ["Ticket médio", fmt(ticket.value)],
      ["Margem de lucro", margem + "%"], ["Dias úteis/mês", diasUteis + " dias"], ["", ""],
      ["META DIÁRIA", fmt(result.metaDiaria)], ["META SEMANAL", fmt(result.metaSemanal)],
      ["META MENSAL", fmt(result.metaMensal)], ["", ""],
      ["Vendas/dia necessárias", result.vendasDia + " " + nichoData.vendas],
      ["Vendas/mês necessárias", result.vendasMes + " " + nichoData.vendas],
      ["Lucro mensal estimado", fmt(result.lucroMensal)],
      ["Faturamento necessário", fmt(result.faturamentoNecessario)],
    ];
    doc.setFontSize(11);
    items.forEach(([label, val]) => {
      if (label === "") { y += 4; return; }
      doc.setTextColor(100); doc.text(label, 20, y);
      doc.setTextColor(30); doc.setFont(undefined, "bold");
      doc.text(val, w - 20, y, { align: "right" });
      doc.setFont(undefined, "normal"); y += 8;
    });
    // Hora real
    const hr = getHoraReal();
    y += 8; doc.setFontSize(14); doc.setTextColor(255, 107, 53);
    doc.text("Valor da Sua Hora", 20, y); y += 10;
    doc.setFontSize(11); doc.setTextColor(80);
    doc.text(`Valor/hora (lucro): ${fmt(hr.valorHoraLucro)}`, 20, y); y += 7;
    doc.text(`Valor/hora (faturamento): ${fmt(hr.valorHoraFat)}`, 20, y); y += 7;
    doc.text(`Horas trabalhadas/mês: ${hr.horasMes}h`, 20, y); y += 12;
    // Plano
    doc.setFontSize(14); doc.setTextColor(255, 107, 53);
    doc.text("Plano de Ação - 30 Dias", 20, y); y += 10;
    doc.setFontSize(10);
    getPlanoAcao().forEach(s => {
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setTextColor(255, 107, 53); doc.setFont(undefined, "bold");
      doc.text(`Semana ${s.semana}: ${s.titulo}`, 20, y); y += 7;
      doc.setTextColor(80); doc.setFont(undefined, "normal");
      s.acoes.forEach(a => {
        const lines = doc.splitTextToSize(`• ${a}`, w - 40);
        if (y + lines.length * 5 > 280) { doc.addPage(); y = 20; }
        doc.text(lines, 24, y); y += lines.length * 5 + 3;
      });
      y += 4;
    });
    y += 6; doc.setFontSize(9); doc.setTextColor(180);
    doc.text("Relatório gerado por BusinessOne · " + new Date().toLocaleDateString("pt-BR"), w / 2, y, { align: "center" });
    doc.save("BusinessOne-Relatorio-Completo.pdf");
  };

  const scoreLabel = result ? result.score >= 70 ? ["Saudável 💚", "#22c55e"] : result.score >= 45 ? ["Atenção ⚠️", "#f59e0b"] : ["Crítico 🔴", "#ef4444"] : ["—", "#999"];

  const S = {
    wrap: { minHeight: "100vh", background: "linear-gradient(160deg, #0f0f0f 0%, #1a1205 100%)", padding: "0 0 60px", fontFamily: "'Sora', sans-serif" },
    header: { padding: "24px 20px 0", marginBottom: "8px" },
    inner: { padding: "0 16px", maxWidth: "440px", margin: "0 auto" },
    card: { background: "#fff", borderRadius: "24px", padding: "24px", marginBottom: "16px", boxShadow: "0 8px 40px rgba(0,0,0,0.2)" },
    label: { fontSize: "11px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "#999", marginBottom: "8px", display: "block" },
    input: { width: "100%", padding: "14px 14px 14px 42px", border: "2px solid #eee", borderRadius: "14px", fontSize: "18px", fontFamily: "'Space Grotesk', sans-serif", fontWeight: "700", color: "#1a1a1a", background: "#fafafa", outline: "none", boxSizing: "border-box" },
    btn: { width: "100%", padding: "17px", background: "linear-gradient(135deg, #FF6B35, #ff8c42)", color: "#fff", border: "none", borderRadius: "16px", fontSize: "16px", fontWeight: "800", cursor: "pointer", fontFamily: "'Sora', sans-serif", letterSpacing: "0.02em", boxShadow: "0 4px 20px rgba(255,107,53,0.4)" },
    btnOff: { opacity: 0.35, pointerEvents: "none" },
    btnGhost: { width: "100%", padding: "14px", background: "transparent", color: "#aaa", border: "2px solid #e8e8e8", borderRadius: "14px", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "'Sora', sans-serif", marginTop: "10px" },
    btnSm: { padding: "10px 16px", background: "linear-gradient(135deg, #FF6B35, #ff8c42)", color: "#fff", border: "none", borderRadius: "12px", fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "'Sora', sans-serif" },
    proTab: (active) => ({ padding: "8px 12px", background: active ? "#FF6B35" : "#f0f0f0", color: active ? "#fff" : "#666", border: "none", borderRadius: "10px", fontSize: "11px", fontWeight: "700", cursor: "pointer", fontFamily: "'Sora', sans-serif", whiteSpace: "nowrap" }),
    row: { display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "8px" },
  };

  const CenarioForm = () => {
    const ct = useCurrencyInput(ticket.value);
    const [cm, setCm] = useState(margem);
    const [cd, setCd] = useState(diasUteis);
    const [cn, setCn] = useState("Cenário " + (cenarios.length + 1));
    return (
      <div style={{ background: "#f8f8f8", borderRadius: "14px", padding: "16px", marginTop: "12px" }}>
        <div style={{ marginBottom: "10px" }}>
          <label style={S.label}>Nome do cenário</label>
          <input value={cn} onChange={e => setCn(e.target.value)} style={{ ...S.input, paddingLeft: "14px", fontSize: "14px" }} />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label style={S.label}>Ticket médio</label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontWeight: "700", color: "#888" }}>R$</span>
            <input type="text" inputMode="numeric" value={ct.display} onChange={ct.handleChange} style={S.input} />
          </div>
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label style={S.label}>Margem: {cm}%</label>
          <input type="range" min="5" max="70" value={cm} onChange={e => setCm(+e.target.value)} style={{ width: "100%", accentColor: "#FF6B35" }} />
        </div>
        <div style={{ marginBottom: "12px" }}>
          <label style={S.label}>Dias úteis: {cd}</label>
          <input type="range" min="10" max="30" value={cd} onChange={e => setCd(+e.target.value)} style={{ width: "100%", accentColor: "#FF6B35" }} />
        </div>
        <button style={S.btnSm} onClick={() => { if (ct.value > 0) addCenario(cn, ct.value, cm, cd); }}>+ Adicionar cenário</button>
      </div>
    );
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Space+Grotesk:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <div style={S.wrap} ref={topRef}>
        <div style={S.header}>
          <div style={S.inner}>
            <p style={{ margin: 0, fontSize: "11px", fontWeight: "700", color: "#FF6B35", letterSpacing: "0.12em", textTransform: "uppercase" }}>Consultor Financeiro</p>
            <h1 style={{ margin: "4px 0 20px", fontSize: "26px", fontWeight: "800", color: "#fff", lineHeight: 1.2 }}>Quanto preciso<br />vender? 💰</h1>
            {step > 0 && step < 6 && <Progress step={step} total={5} />}
          </div>
        </div>

        <div style={S.inner}>

          {/* STEP 0 */}
          {step === 0 && (
            <div style={S.card}>
              <div style={{ textAlign: "center", padding: "8px 0 20px" }}>
                <div style={{ fontSize: "64px", marginBottom: "16px" }}>🎯</div>
                <h2 style={{ margin: "0 0 12px", fontSize: "22px", fontWeight: "800", color: "#1a1a1a" }}>Descubra sua meta real em 2 minutos</h2>
                <p style={{ margin: "0 0 24px", color: "#666", fontSize: "15px", lineHeight: 1.7 }}>Não é uma calculadora genérica. É um diagnóstico personalizado pro seu tipo de negócio — com insights, benchmarks e sugestões práticas.</p>
              </div>
              {[["🎯", "Meta diária, semanal e mensal personalizada"], ["📊", "Diagnóstico comparado ao seu segmento"], ["💡", "Sugestões para melhorar seu resultado"], ["🔄", "Simulação de cenários alternativos"]].map(([icon, text]) => (
                <div key={text} style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ fontSize: "20px" }}>{icon}</span>
                  <span style={{ fontSize: "14px", fontWeight: "600", color: "#333" }}>{text}</span>
                </div>
              ))}
              <button style={{ ...S.btn, marginTop: "24px" }} onClick={() => setStep(1)}>Começar diagnóstico →</button>
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <div style={S.card}>
              <h2 style={{ margin: "0 0 6px", fontSize: "20px", fontWeight: "800", color: "#1a1a1a" }}>Qual é o seu negócio?</h2>
              <p style={{ margin: "0 0 20px", color: "#888", fontSize: "14px" }}>Isso personaliza os benchmarks e a linguagem do resultado.</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" }}>
                {NICHOS.map(n => (<Tag key={n.id} active={nicho === n.id} onClick={() => setNicho(n.id)}>{n.emoji} {n.label}</Tag>))}
              </div>
              <div style={{ marginBottom: "20px" }}>
                <label style={S.label}>Seu nome ou do negócio (opcional)</label>
                <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Studio da Ana" style={{ ...S.input, paddingLeft: "14px" }} />
              </div>
              <button style={{ ...S.btn, ...(nicho ? {} : S.btnOff) }} onClick={() => nicho && setStep(2)}>Continuar →</button>
              <button style={S.btnGhost} onClick={() => setStep(0)}>← Voltar</button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div style={S.card}>
              <h2 style={{ margin: "0 0 6px", fontSize: "20px", fontWeight: "800", color: "#1a1a1a" }}>Quanto você gasta por mês? 🏠</h2>
              <p style={{ margin: "0 0 20px", color: "#888", fontSize: "14px" }}>Some tudo: aluguel, salários, fornecedores, apps, contas fixas.</p>
              <div style={{ position: "relative", marginBottom: "12px" }}>
                <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontWeight: "700", color: "#888", fontFamily: "'Space Grotesk', sans-serif" }}>R$</span>
                <input type="text" inputMode="numeric" value={despesas.display} onChange={despesas.handleChange} placeholder="0,00" style={S.input} onFocus={e => e.target.style.borderColor = "#FF6B35"} onBlur={e => e.target.style.borderColor = "#eee"} />
              </div>
              <div style={{ background: "#fffbeb", borderRadius: "12px", padding: "12px 14px", marginBottom: "20px" }}>
                <p style={{ margin: 0, fontSize: "12px", color: "#92400e", fontWeight: "600" }}>💡 Inclua todas as despesas fixas — aluguel, energia, internet, pró-labore, fornecedores mensais.</p>
              </div>
              <button style={{ ...S.btn, ...(despesas.value > 0 ? {} : S.btnOff) }} onClick={() => despesas.value > 0 && setStep(3)}>Continuar →</button>
              <button style={S.btnGhost} onClick={() => setStep(1)}>← Voltar</button>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div style={S.card}>
              <h2 style={{ margin: "0 0 6px", fontSize: "20px", fontWeight: "800", color: "#1a1a1a" }}>Quanto você cobra por {nichoData.vendas === "vendas" ? "venda" : nichoData.vendas.slice(0, -1)}? 🛍️</h2>
              <p style={{ margin: "0 0 20px", color: "#888", fontSize: "14px" }}>O valor médio que você recebe por {nichoData.vendas === "atendimentos" ? "atendimento" : nichoData.vendas === "sessões" ? "sessão" : nichoData.vendas === "aulas" ? "aula" : "venda/serviço"}.</p>
              <div style={{ position: "relative", marginBottom: "12px" }}>
                <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontWeight: "700", color: "#888", fontFamily: "'Space Grotesk', sans-serif" }}>R$</span>
                <input type="text" inputMode="numeric" value={ticket.display} onChange={ticket.handleChange} placeholder="0,00" style={S.input} onFocus={e => e.target.style.borderColor = "#FF6B35"} onBlur={e => e.target.style.borderColor = "#eee"} />
              </div>
              <div style={{ background: "#f0f9ff", borderRadius: "12px", padding: "12px 14px", marginBottom: "20px" }}>
                <p style={{ margin: 0, fontSize: "12px", color: "#0369a1", fontWeight: "600" }}>📊 Referência para {nichoData.label}: ticket médio de <strong>{fmt(nichoData.ticketRef)}</strong> no mercado.</p>
              </div>
              <button style={{ ...S.btn, ...(ticket.value > 0 ? {} : S.btnOff) }} onClick={() => ticket.value > 0 && setStep(4)}>Continuar →</button>
              <button style={S.btnGhost} onClick={() => setStep(2)}>← Voltar</button>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div style={S.card}>
              <h2 style={{ margin: "0 0 6px", fontSize: "20px", fontWeight: "800", color: "#1a1a1a" }}>Qual lucro você quer ter? 📈</h2>
              <p style={{ margin: "0 0 20px", color: "#888", fontSize: "14px" }}>A margem que quer guardar depois de pagar tudo.</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
                {[10, 20, 30, 40, 50].map(m => (<Tag key={m} active={margem === m} onClick={() => setMargem(m)}>{m}%</Tag>))}
              </div>
              {margem && (
                <div style={{ background: "#f0fdf4", borderRadius: "12px", padding: "12px 14px", marginBottom: "16px" }}>
                  <p style={{ margin: 0, fontSize: "12px", color: "#166534", fontWeight: "600" }}>
                    ✅ Com {margem}% de margem sobre {fmt(despesas.value)} em despesas, você vai guardar <strong>{fmt(despesas.value * (margem / (100 - margem)))}</strong> por mês.
                    {margem < nichoData.margemRef ? ` Sua referência de mercado é ${nichoData.margemRef}% — você pode buscar mais.` : " Excelente! Acima da média do seu segmento."}
                  </p>
                </div>
              )}
              <div style={{ marginBottom: "20px" }}>
                <label style={S.label}>⚙️ Dias úteis por mês: <span style={{ color: "#FF6B35" }}>{diasUteis} dias</span></label>
                <input type="range" min="10" max="30" value={diasUteis} onChange={e => setDiasUteis(+e.target.value)} style={{ width: "100%", accentColor: "#FF6B35" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#bbb" }}><span>10 dias</span><span>30 dias</span></div>
              </div>
              <button style={{ ...S.btn, ...(margem ? {} : S.btnOff) }} onClick={() => margem && calcular()}>Ver meu diagnóstico →</button>
              <button style={S.btnGhost} onClick={() => setStep(3)}>← Voltar</button>
            </div>
          )}

          {/* STEP 6 — RESULTADO */}
          {step === 6 && result && (
            <>
              {/* Score */}
              <div style={{ ...S.card, background: "linear-gradient(135deg, #1a1a1a, #2d1a0a)", color: "#fff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div>
                    <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: "700", color: "#FF6B35", letterSpacing: "0.1em", textTransform: "uppercase" }}>Score Financeiro</p>
                    <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#fff" }}>{nome || "Seu negócio"}</h2>
                  </div>
                  <div style={{ textAlign: "center", background: "rgba(255,255,255,0.08)", borderRadius: "16px", padding: "12px 18px" }}>
                    <p style={{ margin: 0, fontSize: "32px", fontWeight: "800", color: scoreLabel[1], fontFamily: "'Space Grotesk', sans-serif" }}>{result.score}</p>
                    <p style={{ margin: 0, fontSize: "11px", fontWeight: "700", color: scoreLabel[1] }}>{scoreLabel[0]}</p>
                  </div>
                </div>
                <ScoreBar label="Ticket vs mercado" value={Math.min(ticket.value, nichoData.ticketRef * 1.5)} max={nichoData.ticketRef * 1.5} color="#FF6B35" />
                <ScoreBar label="Margem de lucro" value={margem} max={70} color="#22c55e" suffix="%" />
                <ScoreBar label="Carga de trabalho" value={Math.max(0, 8 - result.vendasDia)} max={8} color="#3b82f6" />
              </div>

              {/* Meta */}
              <div style={{ ...S.card, background: "#FF6B35" }}>
                <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: "700", color: "rgba(255,255,255,0.7)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Sua meta diária</p>
                <p style={{ margin: "0 0 4px", fontSize: "42px", fontWeight: "800", color: "#fff", fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1 }}>{fmt(result.metaDiaria)}</p>
                <p style={{ margin: 0, fontSize: "15px", color: "rgba(255,255,255,0.8)", fontWeight: "600" }}>{result.vendasDia} {nichoData.vendas} por dia · {fmtN(result.vendasMes)} por mês</p>
              </div>

              {/* Cards secundários */}
              <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
                <div style={{ ...S.card, flex: 1, textAlign: "center", padding: "16px", marginBottom: 0 }}>
                  <p style={{ margin: "0 0 4px", fontSize: "10px", fontWeight: "700", color: "#999", textTransform: "uppercase", letterSpacing: "0.08em" }}>Por semana</p>
                  <p style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "#1a1a1a", fontFamily: "'Space Grotesk', sans-serif" }}>{fmt(result.metaSemanal)}</p>
                </div>
                <div style={{ ...S.card, flex: 1, textAlign: "center", padding: "16px", marginBottom: 0 }}>
                  <p style={{ margin: "0 0 4px", fontSize: "10px", fontWeight: "700", color: "#999", textTransform: "uppercase", letterSpacing: "0.08em" }}>Lucro/mês</p>
                  <p style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "#22c55e", fontFamily: "'Space Grotesk', sans-serif" }}>{fmt(result.lucroMensal)}</p>
                </div>
              </div>

              {/* Diagnóstico */}
              <div style={S.card}>
                <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: "800", color: "#1a1a1a" }}>📋 Diagnóstico</h3>
                {result.ticketVsRef < -20 && <Insight icon="⚠️" type="warning" text={`Seu ticket de <strong>${fmt(ticket.value)}</strong> está <strong>${Math.abs(Math.round(result.ticketVsRef))}% abaixo</strong> da média de ${nichoData.label} (${fmt(nichoData.ticketRef)}).`} />}
                {result.ticketVsRef >= 0 && <Insight icon="✅" type="success" text={`Seu ticket está <strong>${Math.round(result.ticketVsRef)}% acima</strong> da média do mercado.`} />}
                {result.margemVsRef < -10 && <Insight icon="📉" type="warning" text={`Margem de <strong>${margem}%</strong> está abaixo da referência de ${nichoData.label} (<strong>${nichoData.margemRef}%</strong>).`} />}
                {result.margemVsRef >= 0 && <Insight icon="💚" type="success" text={`Margem de <strong>${margem}%</strong> está acima da média do segmento.`} />}
                {result.vendasDia > 6 && <Insight icon="🔴" type="danger" text={`<strong>${result.vendasDia} ${nichoData.vendas} por dia</strong> é uma carga muito alta.`} />}
                {result.vendasDia <= 3 && <Insight icon="🎯" type="success" text={`Apenas <strong>${result.vendasDia} ${nichoData.vendas} por dia</strong>. Meta alcançável!`} />}
              </div>

              {/* Cenários gratuitos */}
              <div style={S.card}>
                <h3 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: "800", color: "#1a1a1a" }}>🔄 E se você mudasse algo?</h3>
                <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#888" }}>Veja como pequenas mudanças impactam sua meta:</p>
                <div style={{ background: "#f8f8f8", borderRadius: "14px", padding: "14px", marginBottom: "10px" }}>
                  <p style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: "700", color: "#333" }}>💰 Se aumentar o ticket em 20%</p>
                  <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>Ticket: {fmt(result.ticketPlus20)} → <strong style={{ color: "#FF6B35" }}>{result.vendasComTicketMaior} {nichoData.vendas}/mês</strong> ({result.economiaVendas} a menos)</p>
                </div>
                <div style={{ background: "#f8f8f8", borderRadius: "14px", padding: "14px" }}>
                  <p style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: "700", color: "#333" }}>📅 Se trabalhar +5 dias/mês</p>
                  <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>Com {result.diasPlus5} dias úteis → <strong style={{ color: "#FF6B35" }}>{result.vendasComMaisDias} {nichoData.vendas}/dia</strong> (vs {result.vendasDia} atual)</p>
                </div>
              </div>

              {/* ===== PRO ===== */}
              {!proUnlocked ? (
                <div style={S.card}>
                  <div style={{ textAlign: "center", marginBottom: "16px" }}>
                    <p style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: "700", color: "#888" }}>Quer ir mais fundo?</p>
                    <h3 style={{ margin: "0 0 4px", fontSize: "18px", fontWeight: "800", color: "#1a1a1a" }}>Versão Completa 🚀</h3>
                    <p style={{ margin: 0, fontSize: "28px", fontWeight: "800", color: "#FF6B35", fontFamily: "'Space Grotesk', sans-serif" }}>R$47 <span style={{ fontSize: "14px", color: "#aaa", fontWeight: "500" }}>único</span></p>
                  </div>
                  {["📋 Plano de ação personalizado de 30 dias", "⏰ Calculadora de valor real da sua hora", "💼 Comparador CLT vs Seu Negócio", "🏖️ Calculadora de férias do empreendedor", "🎯 Precificação reversa (quanto cobrar)", "👥 Simulador de contratação", "📊 Comparador de 3 cenários", "📈 Projeção de crescimento 6 meses", "⚖️ Ponto de equilíbrio", "📄 Relatório PDF profissional completo", "📱 Resumo compartilhável", "🔄 Calculadora de reajuste de preço"].map(f => (
                    <div key={f} style={{ fontSize: "13px", fontWeight: "600", color: "#333", marginBottom: "8px" }}>{f}</div>
                  ))}
                  <button style={{ ...S.btn, marginTop: "16px" }} onClick={() => window.open('https://pay.kiwify.com.br/oi816Px', '_blank')}>Quero acesso completo →</button>
                  <div style={{ marginTop: "20px", padding: "16px", background: "#f8f8f8", borderRadius: "14px" }}>
                    <p style={{ margin: "0 0 8px", fontSize: "12px", fontWeight: "700", color: "#666" }}>Já comprou? Digite seu código de acesso:</p>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input value={proCode} onChange={e => { setProCode(e.target.value); setProCodeError(false); }} placeholder="Digite o código" style={{ ...S.input, paddingLeft: "14px", fontSize: "14px", flex: 1 }} />
                      <button style={S.btnSm} onClick={handleProCode}>Ativar</button>
                    </div>
                    {proCodeError && <p style={{ margin: "8px 0 0", fontSize: "12px", color: "#ef4444", fontWeight: "600" }}>❌ Código inválido.</p>}
                  </div>
                  <button style={S.btnGhost} onClick={() => setStep(1)}>Refazer com outros números</button>
                </div>
              ) : (
                <>
                  <div style={{ ...S.card, background: "linear-gradient(135deg, #FF6B35, #ff8c42)", textAlign: "center", padding: "14px" }}>
                    <p style={{ margin: 0, fontSize: "14px", fontWeight: "800", color: "#fff" }}>🔓 Versão Completa Ativada · 12 Ferramentas</p>
                  </div>

                  {/* Tabs */}
                  <div style={{ display: "flex", gap: "5px", marginBottom: "16px", flexWrap: "wrap" }}>
                    {[
                      ["plano", "📋 Plano 30d"],
                      ["hora", "⏰ Hora Real"],
                      ["clt", "💼 CLT vs EU"],
                      ["ferias", "🏖️ Férias"],
                      ["reversa", "🎯 Precificação"],
                      ["contratacao", "👥 Contratação"],
                      ["cenarios", "📊 Cenários"],
                      ["reajuste", "🔄 Reajuste"],
                      ["projecao", "📈 Projeção"],
                      ["equilibrio", "⚖️ Equilíbrio"],
                      ["pdf", "📄 PDF"],
                      ["share", "📱 Compartilhar"],
                    ].map(([id, label]) => (
                      <button key={id} style={S.proTab(proTab === id)} onClick={() => setProTab(id)}>{label}</button>
                    ))}
                  </div>

                  {/* PLANO DE AÇÃO */}
                  {proTab === "plano" && (
                    <div style={S.card}>
                      <h3 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: "800", color: "#1a1a1a" }}>📋 Plano de Ação 30 Dias <ProBadge /></h3>
                      <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#888" }}>Ações semanais personalizadas baseadas no seu diagnóstico.</p>
                      {getPlanoAcao().map((s, i) => (
                        <div key={i} style={{ marginBottom: "16px" }}>
                          <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px" }}>
                            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#FF6B35", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "800", fontSize: "14px", fontFamily: "'Space Grotesk'" }}>S{s.semana}</div>
                            <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "800", color: "#1a1a1a" }}>{s.titulo}</h4>
                          </div>
                          {s.acoes.map((a, j) => (
                            <div key={j} style={{ background: "#f8f8f8", borderRadius: "10px", padding: "12px", marginBottom: "6px", display: "flex", gap: "8px", alignItems: "flex-start" }}>
                              <span style={{ color: "#FF6B35", fontWeight: "800", fontSize: "14px" }}>→</span>
                              <p style={{ margin: 0, fontSize: "13px", color: "#444", lineHeight: 1.6 }}>{a}</p>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* HORA REAL */}
                  {proTab === "hora" && (
                    <div style={S.card}>
                      <h3 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: "800", color: "#1a1a1a" }}>⏰ Valor Real da Sua Hora <ProBadge /></h3>
                      <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#888" }}>Descubra quanto você realmente ganha por hora trabalhada.</p>
                      <label style={S.label}>Horas trabalhadas por semana: <span style={{ color: "#FF6B35" }}>{horasSemana}h</span></label>
                      <input type="range" min="20" max="80" value={horasSemana} onChange={e => setHorasSemana(+e.target.value)} style={{ width: "100%", accentColor: "#FF6B35", marginBottom: "16px" }} />
                      {(() => {
                        const hr = getHoraReal();
                        return (
                          <>
                            <BigNumber label="Seu valor/hora (lucro)" value={fmt(hr.valorHoraLucro)} color={hr.valorHoraLucro < 25 ? "#ef4444" : "#22c55e"} sub={`${hr.horasMes} horas por mês`} />
                            <BigNumber label="Seu valor/hora (faturamento)" value={fmt(hr.valorHoraFat)} color="#3b82f6" />
                            {hr.valorHoraLucro < 25 && <Insight icon="😰" type="danger" text={`Você está ganhando <strong>${fmt(hr.valorHoraLucro)}/hora</strong>. Isso é menos que muitos empregos CLT. Você precisa aumentar o ticket ou reduzir as horas.`} />}
                            {hr.valorHoraLucro >= 25 && hr.valorHoraLucro < 50 && <Insight icon="⚠️" type="warning" text={`<strong>${fmt(hr.valorHoraLucro)}/hora</strong> é razoável, mas há espaço pra melhorar. Cada R$10 no ticket aumenta direto o valor da sua hora.`} />}
                            {hr.valorHoraLucro >= 50 && <Insight icon="🎉" type="success" text={`<strong>${fmt(hr.valorHoraLucro)}/hora</strong> é excelente! Você está valorizando bem seu tempo.`} />}
                            <div style={{ background: "#f8f8f8", borderRadius: "12px", padding: "14px", marginTop: "8px" }}>
                              <p style={{ margin: 0, fontSize: "13px", color: "#666", lineHeight: 1.7 }}>💡 <strong>Dica:</strong> se você reduzir 5h por semana sem perder faturamento, seu valor/hora sobe pra <strong>{fmt(result.lucroMensal / ((horasSemana - 5) * 4.33))}</strong>.</p>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}

                  {/* CLT */}
                  {proTab === "clt" && (
                    <div style={S.card}>
                      <h3 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: "800", color: "#1a1a1a" }}>💼 CLT vs Seu Negócio <ProBadge /></h3>
                      <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#888" }}>Seu lucro equivale a qual salário CLT? Inclui benefícios que você não tem.</p>
                      {(() => {
                        const clt = getCLT();
                        return (
                          <>
                            <BigNumber label="Seu lucro mensal atual" value={fmt(result.lucroMensal)} color="#1a1a1a" />
                            <div style={{ background: "#fff5f1", borderRadius: "16px", padding: "16px", marginBottom: "12px", border: "2px solid #FF6B35" }}>
                              <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: "700", color: "#FF6B35", textTransform: "uppercase" }}>Equivalente CLT total</p>
                              <p style={{ margin: 0, fontSize: "28px", fontWeight: "800", color: "#FF6B35", fontFamily: "'Space Grotesk'" }}>{fmt(clt.totalCLT)}</p>
                              <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#888" }}>É o salário CLT que daria o mesmo que você tira hoje</p>
                            </div>
                            <h4 style={{ margin: "0 0 8px", fontSize: "13px", fontWeight: "800", color: "#1a1a1a" }}>O que a CLT te daria e você não tem:</h4>
                            <div style={S.row}><span style={{ color: "#888" }}>🏖️ Férias + 1/3:</span> <strong>{fmt(clt.ferias + clt.terco)}/mês</strong></div>
                            <div style={S.row}><span style={{ color: "#888" }}>🎄 13º salário:</span> <strong>{fmt(clt.decimo)}/mês</strong></div>
                            <div style={S.row}><span style={{ color: "#888" }}>🏦 FGTS:</span> <strong>{fmt(clt.fgts)}/mês</strong></div>
                            <div style={S.row}><span style={{ color: "#888" }}>🏥 INSS:</span> <strong>{fmt(clt.inss)}/mês</strong></div>
                            <div style={{ ...S.row, borderTop: "2px solid #eee", paddingTop: "8px", marginTop: "4px" }}><span style={{ color: "#ef4444", fontWeight: "700" }}>💸 Custo invisível total:</span> <strong style={{ color: "#ef4444" }}>{fmt(clt.custoInvisivel)}/mês</strong></div>
                            <Insight icon="💡" type="info" text={`Você precisa guardar <strong>${fmt(clt.custoInvisivel)}/mês</strong> por conta própria pra ter a mesma segurança de um CLT. Se não faz isso, seu lucro real é menor do que parece.`} />
                          </>
                        );
                      })()}
                    </div>
                  )}

                  {/* FÉRIAS */}
                  {proTab === "ferias" && (
                    <div style={S.card}>
                      <h3 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: "800", color: "#1a1a1a" }}>🏖️ Calculadora de Férias <ProBadge /></h3>
                      <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#888" }}>Quanto guardar por mês pra tirar férias sem preocupação.</p>
                      <label style={S.label}>Dias de férias desejados: <span style={{ color: "#FF6B35" }}>{diasFerias} dias</span></label>
                      <input type="range" min="5" max="30" value={diasFerias} onChange={e => setDiasFerias(+e.target.value)} style={{ width: "100%", accentColor: "#FF6B35", marginBottom: "16px" }} />
                      {(() => {
                        const f = getFerias();
                        return (
                          <>
                            <BigNumber label="Total necessário para as férias" value={fmt(f.totalNecessario)} color="#FF6B35" sub={`${diasFerias} dias parado`} />
                            <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
                              <div style={{ flex: 1, background: "#fef2f2", borderRadius: "12px", padding: "12px", textAlign: "center" }}>
                                <p style={{ margin: "0 0 2px", fontSize: "10px", fontWeight: "700", color: "#999", textTransform: "uppercase" }}>Contas que não param</p>
                                <p style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#ef4444", fontFamily: "'Space Grotesk'" }}>{fmt(f.custoFerias)}</p>
                              </div>
                              <div style={{ flex: 1, background: "#fffbeb", borderRadius: "12px", padding: "12px", textAlign: "center" }}>
                                <p style={{ margin: "0 0 2px", fontSize: "10px", fontWeight: "700", color: "#999", textTransform: "uppercase" }}>Lucro que deixa de ganhar</p>
                                <p style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#f59e0b", fontFamily: "'Space Grotesk'" }}>{fmt(f.ganhoPerdia)}</p>
                              </div>
                            </div>
                            <div style={{ background: "#f0fdf4", borderRadius: "14px", padding: "16px", textAlign: "center" }}>
                              <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: "700", color: "#22c55e", textTransform: "uppercase" }}>Guarde por mês</p>
                              <p style={{ margin: 0, fontSize: "28px", fontWeight: "800", color: "#22c55e", fontFamily: "'Space Grotesk'" }}>{fmt(f.guardarPorMes)}</p>
                              <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#888" }}>E em 12 meses você tira {diasFerias} dias de férias tranquilo</p>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}

                  {/* PRECIFICAÇÃO REVERSA */}
                  {proTab === "reversa" && (
                    <div style={S.card}>
                      <h3 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: "800", color: "#1a1a1a" }}>🎯 Precificação Reversa <ProBadge /></h3>
                      <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#888" }}>Quanto cobrar pra ganhar o que você quer?</p>
                      <label style={S.label}>Quanto quer ganhar de lucro por mês?</label>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
                        {[3000, 5000, 8000, 10000, 15000].map(v => (
                          <Tag key={v} active={salarioDesejado === v} onClick={() => setSalarioDesejado(v)}>{fmt(v)}</Tag>
                        ))}
                      </div>
                      {(() => {
                        const pr = getPrecificacaoReversa();
                        return (
                          <>
                            <BigNumber label="Ticket ideal" value={fmt(pr.ticketIdeal)} color="#FF6B35" sub={`Para lucrar ${fmt(salarioDesejado)}/mês`} />
                            <div style={S.row}><span style={{ color: "#888" }}>Faturamento necessário:</span> <strong>{fmt(pr.faturamentoNecessario)}</strong></div>
                            <div style={S.row}><span style={{ color: "#888" }}>Seu ticket atual:</span> <strong>{fmt(ticket.value)}</strong></div>
                            <div style={S.row}><span style={{ color: "#888" }}>Ticket ideal:</span> <strong style={{ color: "#FF6B35" }}>{fmt(pr.ticketIdeal)}</strong></div>
                            <div style={S.row}><span style={{ color: "#888" }}>Diferença:</span> <strong style={{ color: pr.ticketIdeal > ticket.value ? "#ef4444" : "#22c55e" }}>{pr.ticketIdeal > ticket.value ? "+" : ""}{fmt(pr.ticketIdeal - ticket.value)}</strong></div>
                            {pr.ticketIdeal > ticket.value && <Insight icon="💡" type="warning" text={`Pra lucrar <strong>${fmt(salarioDesejado)}</strong> com ${result.vendasMes} ${nichoData.vendas}/mês, você precisa cobrar <strong>${fmt(pr.ticketIdeal)}</strong> — um aumento de <strong>${Math.round(((pr.ticketIdeal - ticket.value) / ticket.value) * 100)}%</strong>.`} />}
                            {pr.ticketIdeal <= ticket.value && <Insight icon="✅" type="success" text={`Seu ticket atual já é suficiente pra atingir ${fmt(salarioDesejado)} de lucro! Foque em manter o volume de vendas.`} />}
                          </>
                        );
                      })()}
                    </div>
                  )}

                  {/* CONTRATAÇÃO */}
                  {proTab === "contratacao" && (
                    <div style={S.card}>
                      <h3 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: "800", color: "#1a1a1a" }}>👥 Simulador de Contratação <ProBadge /></h3>
                      <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#888" }}>Vale a pena contratar? Quanto mais precisa vender?</p>
                      <label style={S.label}>Custo total do novo funcionário/mês</label>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
                        {[1500, 2000, 3000, 4000, 5000].map(v => (
                          <Tag key={v} active={custoNovoFunc === v} onClick={() => setCustoNovoFunc(v)}>{fmt(v)}</Tag>
                        ))}
                      </div>
                      {(() => {
                        const ct = getContratacao();
                        return (
                          <>
                            <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
                              <div style={{ flex: 1, background: "#f8f8f8", borderRadius: "12px", padding: "12px", textAlign: "center" }}>
                                <p style={{ margin: "0 0 2px", fontSize: "10px", fontWeight: "700", color: "#999", textTransform: "uppercase" }}>Hoje</p>
                                <p style={{ margin: "0 0 2px", fontSize: "16px", fontWeight: "800", fontFamily: "'Space Grotesk'" }}>{result.vendasDia} {nichoData.vendas}/dia</p>
                                <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>{fmt(despesas.value)} despesas</p>
                              </div>
                              <div style={{ flex: 1, background: "#fff5f1", borderRadius: "12px", padding: "12px", textAlign: "center", border: "2px solid #FF6B35" }}>
                                <p style={{ margin: "0 0 2px", fontSize: "10px", fontWeight: "700", color: "#FF6B35", textTransform: "uppercase" }}>Com contratação</p>
                                <p style={{ margin: "0 0 2px", fontSize: "16px", fontWeight: "800", fontFamily: "'Space Grotesk'", color: "#FF6B35" }}>{ct.novasVendasDia} {nichoData.vendas}/dia</p>
                                <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>{fmt(ct.novasDespesas)} despesas</p>
                              </div>
                            </div>
                            <div style={S.row}><span style={{ color: "#888" }}>Vendas extras/mês:</span> <strong style={{ color: "#ef4444" }}>+{ct.vendasExtra} {nichoData.vendas}</strong></div>
                            <div style={S.row}><span style={{ color: "#888" }}>Novo faturamento:</span> <strong>{fmt(ct.novoFat)}</strong></div>
                            <div style={S.row}><span style={{ color: "#888" }}>Novo lucro:</span> <strong style={{ color: "#22c55e" }}>{fmt(ct.novoLucro)}</strong></div>
                            {ct.compensa ? (
                              <Insight icon="✅" type="success" text={`<strong>Vale a pena!</strong> Com +${ct.vendasExtra} ${nichoData.vendas}/mês, você cobre o custo e mantém o lucro de ${fmt(ct.novoLucro)}.`} />
                            ) : (
                              <Insight icon="⚠️" type="danger" text={`<strong>Atenção!</strong> O lucro cairia pra ${fmt(ct.novoLucro)}. Só compensa se o funcionário gerar mais vendas.`} />
                            )}
                            <Insight icon="💡" type="info" text={`Se o funcionário conseguir gerar <strong>${ct.vendasExtra + 3} ${nichoData.vendas} a mais</strong> por mês, seu lucro sobe pra <strong>${fmt(ct.novoLucro + 3 * ticket.value * margem / 100)}</strong>.`} />
                          </>
                        );
                      })()}
                    </div>
                  )}

                  {/* CENÁRIOS */}
                  {proTab === "cenarios" && (
                    <div style={S.card}>
                      <h3 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: "800", color: "#1a1a1a" }}>📊 Comparar Cenários <ProBadge /></h3>
                      <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#888" }}>Compare até 3 cenários lado a lado.</p>
                      {cenarios.map((c, i) => (
                        <div key={i} style={{ background: i === 0 ? "#fff5f1" : "#f8f8f8", borderRadius: "14px", padding: "14px", marginBottom: "10px", border: i === 0 ? "2px solid #FF6B35" : "2px solid #eee" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                            <p style={{ margin: 0, fontSize: "14px", fontWeight: "800", color: i === 0 ? "#FF6B35" : "#333" }}>{c.nome}</p>
                            {i > 0 && <button onClick={() => removeCenario(i)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "18px" }}>×</button>}
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: "12px" }}>
                            <div><span style={{ color: "#888" }}>Ticket:</span> <strong>{fmt(c.ticket)}</strong></div>
                            <div><span style={{ color: "#888" }}>Margem:</span> <strong>{c.margem}%</strong></div>
                            <div><span style={{ color: "#888" }}>Vendas/dia:</span> <strong style={{ color: c.vendasDia > 6 ? "#ef4444" : "#22c55e" }}>{c.vendasDia}</strong></div>
                            <div><span style={{ color: "#888" }}>Vendas/mês:</span> <strong>{c.vendasMes}</strong></div>
                            <div><span style={{ color: "#888" }}>Meta diária:</span> <strong>{fmt(c.metaDiaria)}</strong></div>
                            <div><span style={{ color: "#888" }}>Lucro/mês:</span> <strong style={{ color: "#22c55e" }}>{fmt(c.lucroMensal)}</strong></div>
                            <div style={{ gridColumn: "1 / -1" }}><span style={{ color: "#888" }}>Score:</span> <strong style={{ color: c.score >= 70 ? "#22c55e" : c.score >= 45 ? "#f59e0b" : "#ef4444" }}>{c.score}/100</strong></div>
                          </div>
                        </div>
                      ))}
                      {cenarios.length < 3 && <CenarioForm />}
                    </div>
                  )}

                  {/* REAJUSTE */}
                  {proTab === "reajuste" && (
                    <div style={S.card}>
                      <h3 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: "800", color: "#1a1a1a" }}>🔄 Calculadora de Reajuste <ProBadge /></h3>
                      <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#888" }}>Veja o impacto de aumentar seu preço.</p>
                      <label style={S.label}>Reajuste: <span style={{ color: "#FF6B35" }}>{reajuste}%</span></label>
                      <input type="range" min="5" max="100" value={reajuste} onChange={e => setReajuste(+e.target.value)} style={{ width: "100%", accentColor: "#FF6B35", marginBottom: "16px" }} />
                      {(() => {
                        const novoTicket = ticket.value * (1 + reajuste / 100);
                        const fat = despesas.value / (1 - margem / 100);
                        const vendasAntes = Math.ceil(fat / ticket.value);
                        const vendasDepois = Math.ceil(fat / novoTicket);
                        const economia = vendasAntes - vendasDepois;
                        const vendasDiaDepois = Math.ceil(vendasDepois / diasUteis);
                        return (
                          <>
                            <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
                              <div style={{ flex: 1, background: "#f8f8f8", borderRadius: "12px", padding: "14px", textAlign: "center" }}>
                                <p style={{ margin: "0 0 4px", fontSize: "10px", fontWeight: "700", color: "#999", textTransform: "uppercase" }}>Antes</p>
                                <p style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#333", fontFamily: "'Space Grotesk'" }}>{fmt(ticket.value)}</p>
                              </div>
                              <div style={{ flex: 1, background: "#fff5f1", borderRadius: "12px", padding: "14px", textAlign: "center", border: "2px solid #FF6B35" }}>
                                <p style={{ margin: "0 0 4px", fontSize: "10px", fontWeight: "700", color: "#FF6B35", textTransform: "uppercase" }}>Depois (+{reajuste}%)</p>
                                <p style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#FF6B35", fontFamily: "'Space Grotesk'" }}>{fmt(novoTicket)}</p>
                              </div>
                            </div>
                            <Insight icon="📉" type="success" text={`<strong>${economia} ${nichoData.vendas} a menos</strong> por mês (de ${vendasAntes} para ${vendasDepois}).`} />
                            <Insight icon="📅" type="info" text={`Nova meta: <strong>${vendasDiaDepois} ${nichoData.vendas}/dia</strong> (antes: ${result.vendasDia}).`} />
                          </>
                        );
                      })()}
                    </div>
                  )}

                  {/* PROJEÇÃO */}
                  {proTab === "projecao" && (
                    <div style={S.card}>
                      <h3 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: "800", color: "#1a1a1a" }}>📈 Projeção 6 Meses <ProBadge /></h3>
                      <label style={{ ...S.label, marginTop: "12px" }}>Meta de reajuste em 6 meses: <span style={{ color: "#FF6B35" }}>{reajuste}%</span></label>
                      <input type="range" min="5" max="100" value={reajuste} onChange={e => setReajuste(+e.target.value)} style={{ width: "100%", accentColor: "#FF6B35", marginBottom: "16px" }} />
                      {getProjecao6Meses().map((m, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: i < 5 ? "1px solid #f0f0f0" : "none" }}>
                          <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: i === 0 ? "#f0f0f0" : "#fff5f1", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "13px", color: i === 0 ? "#888" : "#FF6B35", fontFamily: "'Space Grotesk'" }}>M{m.mes}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                              <span style={{ fontSize: "13px", fontWeight: "700", color: "#333" }}>{fmt(m.ticket)}</span>
                              <span style={{ fontSize: "13px", fontWeight: "800", color: "#22c55e" }}>{fmt(m.lucro)}</span>
                            </div>
                            <span style={{ fontSize: "11px", color: "#888" }}>{m.vendasDia} {nichoData.vendas}/dia</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* EQUILÍBRIO */}
                  {proTab === "equilibrio" && (
                    <div style={S.card}>
                      <h3 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: "800", color: "#1a1a1a" }}>⚖️ Ponto de Equilíbrio <ProBadge /></h3>
                      <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#888" }}>O mínimo pra não ficar no vermelho.</p>
                      {(() => {
                        const pe = getPontoEquilibrio();
                        return (
                          <>
                            <BigNumber label="Ponto de equilíbrio" value={`${pe.vendas} ${nichoData.vendas}`} color="#1a1a1a" sub={`${pe.porDia}/dia · ${fmt(pe.faturamento)} faturamento`} />
                            <Insight icon="📊" type="info" text={`Cada ${nichoData.vendas === "vendas" ? "venda" : nichoData.vendas.slice(0, -1)} acima de <strong>${pe.vendas}</strong> gera <strong>${fmt(ticket.value * margem / 100)}</strong> de lucro puro.`} />
                            <div style={{ background: "#f8f8f8", borderRadius: "14px", padding: "14px" }}>
                              <div style={S.row}><span style={{ color: "#888" }}>Ponto de equilíbrio:</span> <strong>{pe.vendas}/mês</strong></div>
                              <div style={S.row}><span style={{ color: "#888" }}>Sua meta ({margem}% lucro):</span> <strong style={{ color: "#FF6B35" }}>{result.vendasMes}/mês</strong></div>
                              <div style={S.row}><span style={{ color: "#888" }}>Vendas que geram lucro:</span> <strong style={{ color: "#22c55e" }}>{result.vendasMes - pe.vendas}</strong></div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}

                  {/* PDF */}
                  {proTab === "pdf" && (
                    <div style={S.card}>
                      <h3 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: "800", color: "#1a1a1a" }}>📄 Relatório Completo em PDF <ProBadge /></h3>
                      <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#888" }}>Inclui diagnóstico, plano de ação, valor da hora e muito mais.</p>
                      <div style={{ background: "#f8f8f8", borderRadius: "14px", padding: "20px", textAlign: "center", marginBottom: "16px" }}>
                        <div style={{ fontSize: "48px", marginBottom: "12px" }}>📄</div>
                        <p style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: "700", color: "#333" }}>BusinessOne-Relatorio-Completo.pdf</p>
                        <p style={{ margin: "0 0 16px", fontSize: "12px", color: "#888" }}>Metas · Diagnóstico · Plano 30 dias · Valor/hora · Cenários</p>
                        <button style={S.btn} onClick={gerarPDF}>Baixar PDF →</button>
                      </div>
                    </div>
                  )}

                  {/* COMPARTILHAR */}
                  {proTab === "share" && (
                    <div style={S.card}>
                      <h3 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: "800", color: "#1a1a1a" }}>📱 Compartilhar <ProBadge /></h3>
                      <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#888" }}>Envie seu resumo por WhatsApp ou redes sociais.</p>
                      <div style={{ background: "linear-gradient(135deg, #1a1a1a, #2d1a0a)", borderRadius: "16px", padding: "20px", color: "#fff", marginBottom: "16px" }}>
                        <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: "700", color: "#FF6B35", textTransform: "uppercase", letterSpacing: "0.1em" }}>BusinessOne</p>
                        <p style={{ margin: "0 0 12px", fontSize: "18px", fontWeight: "800" }}>{nome || "Meu negócio"}</p>
                        <div style={{ fontSize: "13px", lineHeight: 2, color: "rgba(255,255,255,0.8)" }}>
                          <div>🎯 Meta: <strong style={{ color: "#fff" }}>{fmt(result.metaDiaria)}/dia</strong></div>
                          <div>📊 {result.vendasDia} {nichoData.vendas}/dia</div>
                          <div>💰 Lucro: <strong style={{ color: "#22c55e" }}>{fmt(result.lucroMensal)}/mês</strong></div>
                          <div>⭐ Score: <strong style={{ color: scoreLabel[1] }}>{result.score}/100</strong></div>
                        </div>
                      </div>
                      <button style={S.btn} onClick={() => {
                        const t = `🎯 *BusinessOne*\n\n📌 ${nome || "Meu negócio"} (${nichoData.label})\n\n💰 Meta: ${fmt(result.metaDiaria)}/dia\n📊 ${result.vendasDia} ${nichoData.vendas}/dia · ${result.vendasMes}/mês\n💵 Lucro: ${fmt(result.lucroMensal)}/mês\n⭐ Score: ${result.score}/100\n\n🔗 ${window.location.origin}`;
                        navigator.clipboard.writeText(t).then(() => alert("Copiado!"));
                      }}>Copiar resumo 📋</button>
                      <button style={{ ...S.btnGhost, marginTop: "10px" }} onClick={() => {
                        const t = `🎯 BusinessOne\n\n${nome || "Meu negócio"}\nMeta: ${fmt(result.metaDiaria)}/dia\nLucro: ${fmt(result.lucroMensal)}/mês\nScore: ${result.score}/100\n\n${window.location.origin}`;
                        window.open(`https://wa.me/?text=${encodeURIComponent(t)}`, "_blank");
                      }}>Enviar por WhatsApp 💬</button>
                    </div>
                  )}

                  <button style={S.btnGhost} onClick={() => setStep(1)}>Refazer com outros números</button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
