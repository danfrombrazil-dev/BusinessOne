import { useState, useEffect, useRef } from "react";
import { jsPDF } from "jspdf";

/* ── DADOS ── */
const NICHOS = [
  { id:"beleza", emoji:"💇", label:"Beleza & Estética", vendas:"atendimentos", cliente:"clientes", ticketRef:120, margemRef:45, custoMedio:35, ociosidadeMedia:25 },
  { id:"saude", emoji:"🏋️", label:"Saúde & Bem-estar", vendas:"sessões", cliente:"pacientes", ticketRef:180, margemRef:50, custoMedio:40, ociosidadeMedia:20 },
  { id:"educacao", emoji:"📚", label:"Educação & Aulas", vendas:"aulas", cliente:"alunos", ticketRef:100, margemRef:60, custoMedio:20, ociosidadeMedia:30 },
  { id:"consultoria", emoji:"💼", label:"Consultoria & Coaching", vendas:"projetos", cliente:"clientes", ticketRef:500, margemRef:65, custoMedio:15, ociosidadeMedia:35 },
  { id:"alimentacao", emoji:"🍔", label:"Alimentação & Food", vendas:"pedidos", cliente:"clientes", ticketRef:45, margemRef:30, custoMedio:45, ociosidadeMedia:15 },
  { id:"varejo", emoji:"🛍️", label:"Varejo & Comércio", vendas:"vendas", cliente:"clientes", ticketRef:90, margemRef:35, custoMedio:50, ociosidadeMedia:20 },
  { id:"servicos", emoji:"🔧", label:"Serviços Gerais", vendas:"serviços", cliente:"clientes", ticketRef:200, margemRef:40, custoMedio:30, ociosidadeMedia:25 },
  { id:"outros", emoji:"✨", label:"Outro segmento", vendas:"vendas", cliente:"clientes", ticketRef:150, margemRef:40, custoMedio:30, ociosidadeMedia:25 }
];

const PRO_CODE = "BUSPRO2025";
const C = { bg:"#0a0a0a", card:"#141414", card2:"#1a1a1a", accent:"#FF6B35", accent2:"#ff8c42", white:"#ffffff", gray:"#a0a0a0", green:"#22c55e", red:"#ef4444", yellow:"#eab308", blue:"#3b82f6" };

/* ── HELPERS ── */
const fmt = v => v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const fmtN = v => Math.round(v).toLocaleString("pt-BR");
const pct = v => `${Math.round(v)}%`;

function useCurrencyInput(initial=0) {
  const [raw,setRaw] = useState(initial);
  const [display,setDisplay] = useState(initial ? fmt(initial) : "");
  const onChange = e => {
    const nums = e.target.value.replace(/\D/g,"");
    const val = parseInt(nums||"0",10)/100;
    setRaw(val);
    setDisplay(val ? fmt(val) : "");
  };
  return { raw, display, onChange, setRaw, setDisplay };
}

/* ── UI COMPONENTS ── */
const S = {
  wrap: { fontFamily:"'Sora',sans-serif", background:C.bg, color:C.white, minHeight:"100vh", padding:"20px 16px 40px" },
  container: { maxWidth:480, margin:"0 auto" },
  title: { fontFamily:"'Space Grotesk',sans-serif", fontSize:24, fontWeight:800, marginBottom:4, textAlign:"center" },
  subtitle: { color:C.gray, fontSize:14, textAlign:"center", marginBottom:28, lineHeight:1.5 },
  label: { display:"block", fontSize:14, fontWeight:600, marginBottom:8, color:C.white },
  input: { width:"100%", padding:"14px 16px", borderRadius:12, border:"1px solid #333", background:C.card, color:C.white, fontSize:16, outline:"none", boxSizing:"border-box" },
  btn: { width:"100%", padding:"16px", borderRadius:14, border:"none", background:`linear-gradient(135deg,${C.accent},${C.accent2})`, color:"#fff", fontSize:16, fontWeight:700, cursor:"pointer", marginTop:16 },
  btnOutline: { width:"100%", padding:"14px", borderRadius:14, border:`2px solid ${C.accent}`, background:"transparent", color:C.accent, fontSize:15, fontWeight:600, cursor:"pointer", marginTop:10 },
  btnSmall: { padding:"10px 20px", borderRadius:10, border:"none", background:C.accent, color:"#fff", fontSize:14, fontWeight:600, cursor:"pointer" },
  card: { background:C.card, borderRadius:16, padding:24, border:"1px solid #222", marginBottom:16 },
  cardAccent: { background:"linear-gradient(135deg,#1a1008,#1a1410)", borderRadius:16, padding:24, border:`1px solid ${C.accent}33`, marginBottom:16 },
  tag: { padding:"12px 18px", borderRadius:12, border:"1px solid #333", background:C.card, color:C.gray, fontSize:14, cursor:"pointer", transition:"all .15s", textAlign:"center" },
  tagActive: { padding:"12px 18px", borderRadius:12, border:`1px solid ${C.accent}`, background:"#1a1008", color:C.accent, fontSize:14, cursor:"pointer", fontWeight:600, textAlign:"center" },
  sectionTitle: { fontFamily:"'Space Grotesk',sans-serif", fontSize:18, fontWeight:700, marginBottom:16, color:C.white },
  semaforo: (color) => ({ width:12, height:12, borderRadius:6, background:color, display:"inline-block", marginRight:8 }),
  tab: (active) => ({ padding:"10px 16px", borderRadius:10, border:"none", background:active ? C.accent : C.card, color:active ? "#fff" : C.gray, fontSize:13, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap" }),
};

function Progress({ step, total }) {
  return (
    <div style={{ display:"flex", gap:6, marginBottom:28 }}>
      {Array.from({length:total},(_,i) => (
        <div key={i} style={{ flex:1, height:4, borderRadius:2, background: i <= step ? C.accent : "#222", transition:"background .3s" }} />
      ))}
    </div>
  );
}

function Tag({ children, active, onClick }) {
  return <div style={active ? S.tagActive : S.tag} onClick={onClick}>{children}</div>;
}

function ScoreBar({ label, value, max=100, color=C.accent }) {
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
        <span style={{ fontSize:13, color:C.gray }}>{label}</span>
        <span style={{ fontSize:13, fontWeight:600, color }}>{Math.round(value)}/{max}</span>
      </div>
      <div style={{ height:8, borderRadius:4, background:"#222" }}>
        <div style={{ height:8, borderRadius:4, background:color, width:`${Math.min(value/max*100,100)}%`, transition:"width .5s" }} />
      </div>
    </div>
  );
}

function Insight({ emoji, title, text, type="info" }) {
  const colors = { good:{ bg:"#0a1a0a", border:"#1a3a1a", color:C.green }, bad:{ bg:"#1a0a0a", border:"#3a1a1a", color:C.red }, warn:{ bg:"#1a1a0a", border:"#3a3a1a", color:C.yellow }, info:{ bg:"#0a0a1a", border:"#1a1a3a", color:C.blue } };
  const c = colors[type];
  return (
    <div style={{ background:c.bg, border:`1px solid ${c.border}`, borderRadius:14, padding:18, marginBottom:12 }}>
      <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
        <span style={{ fontSize:20 }}>{emoji}</span>
        <div>
          <p style={{ fontWeight:600, fontSize:14, color:c.color, margin:"0 0 4px" }}>{title}</p>
          <p style={{ fontSize:13, color:C.gray, margin:0, lineHeight:1.6 }}>{text}</p>
        </div>
      </div>
    </div>
  );
}

function BigNumber({ label, value, sub, color=C.accent }) {
  return (
    <div style={{ textAlign:"center", padding:"16px 0" }}>
      <p style={{ fontSize:13, color:C.gray, margin:"0 0 4px" }}>{label}</p>
      <p style={{ fontSize:36, fontWeight:800, color, margin:"0 0 4px", fontFamily:"'Space Grotesk',sans-serif" }}>{value}</p>
      {sub && <p style={{ fontSize:12, color:C.gray, margin:0 }}>{sub}</p>}
    </div>
  );
}

function Semaforo({ color, label, value }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid #1a1a1a" }}>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <span style={S.semaforo(color)} />
        <span style={{ fontSize:14, color:C.white }}>{label}</span>
      </div>
      <span style={{ fontSize:14, fontWeight:600, color }}>{value}</span>
    </div>
  );
}

function ProBadge() {
  return <span style={{ background:C.accent, color:"#fff", fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:6, marginLeft:8, verticalAlign:"middle" }}>PRO</span>;
}

/* ── MAIN COMPONENT ── */
export default function Calculadora() {
  const topRef = useRef(null);
  const [step, setStep] = useState(0);
  const [nicho, setNicho] = useState(null);
  const [nome, setNome] = useState("");
  const despesas = useCurrencyInput();
  const ticket = useCurrencyInput();
  const [margem, setMargem] = useState(null);
  const [diasUteis, setDiasUteis] = useState(22);
  const [horasDia, setHorasDia] = useState(8);
  const [result, setResult] = useState(null);
  const [proUnlocked, setProUnlocked] = useState(false);
  const [proCode, setProCode] = useState("");
  const [proCodeError, setProCodeError] = useState(false);
  const [proTab, setProTab] = useState("dashboard");
  const [cenarios, setCenarios] = useState([]);
  const [reajuste, setReajuste] = useState(15);

  // PRO inputs
  const [horasSemana, setHorasSemana] = useState(44);
  const [diasFerias, setDiasFerias] = useState(30);
  const salarioDesejado = useCurrencyInput();
  const custoFunc = useCurrencyInput();
  const [clientesPerdidos, setClientesPerdidos] = useState(5);
  const [horariosVagos, setHorariosVagos] = useState(20);
  const [servicoTop, setServicoTop] = useState("");
  const [precoServico, setPrecoServico] = useState("");
  const [nomeNegocio, setNomeNegocio] = useState("");

  useEffect(() => { topRef.current?.scrollIntoView({ behavior:"smooth" }); }, [step]);
  useEffect(() => {
    const saved = localStorage.getItem("businessone_pro");
    if (saved === "true") setProUnlocked(true);
  }, []);

  const nichoData = NICHOS.find(n => n.id === nicho);

  /* ── CORE CALC ── */
  function calcular() {
    const n = nichoData;
    const d = despesas.raw;
    const t = ticket.raw;
    const m = margem;
    const faturamento = d / (m / 100);
    const vendasMes = Math.ceil(faturamento / t);
    const vendasDia = Math.ceil(vendasMes / diasUteis);
    const vendasSemana = Math.ceil(vendasMes / 4.33);
    const metaDiaria = vendasDia * t;
    const metaSemanal = vendasSemana * t;
    const metaMensal = faturamento;
    const lucroMensal = faturamento - d;

    // benchmarks
    const ticketVsRef = ((t - n.ticketRef) / n.ticketRef * 100);
    const margemVsRef = m - n.margemRef;

    // score
    const scoreTicket = Math.min(40, Math.max(0, 20 + ticketVsRef * 0.4));
    const scoreMargem = Math.min(35, Math.max(0, 17.5 + margemVsRef * 0.7));
    const scoreWorkload = Math.min(25, Math.max(0, vendasDia <= 5 ? 25 : vendasDia <= 10 ? 18 : vendasDia <= 20 ? 10 : 3));
    const score = Math.round(scoreTicket + scoreMargem + scoreWorkload);

    // cenário +20% ticket
    const ticketUp = t * 1.2;
    const vendasMesUp = Math.ceil(faturamento / ticketUp);
    const vendasDiaUp = Math.ceil(vendasMesUp / diasUteis);

    // cenário +5 dias
    const diasUp = diasUteis + 5;
    const vendasDiaDias = Math.ceil(vendasMes / diasUp);

    // quanto deixa na mesa
    const ticketIdeal = Math.max(t, n.ticketRef);
    const margemIdeal = Math.max(m, n.margemRef);
    const perdaTicket = (ticketIdeal - t) * vendasMes;
    const faturamentoIdeal = d / (margemIdeal / 100);
    const lucroIdeal = faturamentoIdeal - d;
    const perdaMargem = lucroIdeal - lucroMensal;
    const perdaOciosidade = (horariosVagos / 100) * vendasMes * t * 0.5;
    const totalNaMesa = perdaTicket + Math.max(0, perdaMargem) + perdaOciosidade;

    // hora real
    const horasMes = horasSemana * 4.33;
    const horaReal = lucroMensal / horasMes;

    setResult({
      faturamento, vendasMes, vendasDia, vendasSemana, metaDiaria, metaSemanal, metaMensal, lucroMensal,
      ticketVsRef, margemVsRef, score, scoreTicket, scoreMargem, scoreWorkload,
      vendasDiaUp, vendasMesUp, ticketUp, vendasDiaDias, diasUp,
      perdaTicket, perdaMargem: Math.max(0, perdaMargem), perdaOciosidade, totalNaMesa,
      horaReal, horasMes, ticketIdeal, margemIdeal
    });
    setStep(6);
  }

  /* ── PRO FUNCTIONS ── */
  function handleProCode() {
    if (proCode.trim().toUpperCase() === PRO_CODE) {
      setProUnlocked(true);
      localStorage.setItem("businessone_pro", "true");
      setProCodeError(false);
    } else {
      setProCodeError(true);
    }
  }

  function addCenario() {
    if (cenarios.length >= 3) return;
    setCenarios([...cenarios, { ticket: ticket.raw, margem, diasUteis }]);
  }

  function removeCenario(i) {
    setCenarios(cenarios.filter((_, idx) => idx !== i));
  }

  function calcCenario(c) {
    const fat = despesas.raw / (c.margem / 100);
    const vMes = Math.ceil(fat / c.ticket);
    const vDia = Math.ceil(vMes / c.diasUteis);
    const lucro = fat - despesas.raw;
    return { fat, vMes, vDia, lucro };
  }

  function getHoraReal() {
    if (!result) return null;
    const horasMes = horasSemana * 4.33;
    const horaReal = result.lucroMensal / horasMes;
    const salarioMinHora = 1412 / 220;
    return { horaReal, horasMes, salarioMinHora, vsMinimo: horaReal / salarioMinHora };
  }

  function getCLTvs() {
    if (!result) return null;
    const lucroAnual = result.lucroMensal * 12;
    const horasAno = horasSemana * 52;
    const valorHoraEmpreendedor = lucroAnual / horasAno;
    const cltEquivalente = result.lucroMensal;
    const cltComBeneficios = cltEquivalente * 1.4;
    return { lucroAnual, horasAno, valorHoraEmpreendedor, cltEquivalente, cltComBeneficios };
  }

  function getFerias() {
    if (!result) return null;
    const ganhosDiarios = result.lucroMensal / 30;
    const custoFerias = ganhosDiarios * diasFerias;
    const mesesPreparo = custoFerias / (result.lucroMensal * 0.15);
    return { custoFerias, ganhosDiarios, mesesPreparo: Math.ceil(mesesPreparo) };
  }

  function getPrecificacaoReversa() {
    if (!result || !salarioDesejado.raw) return null;
    const lucroDesejado = salarioDesejado.raw;
    const fatNecessario = (lucroDesejado + despesas.raw);
    const ticketAtual = ticket.raw;
    const vendasNecessarias = Math.ceil(fatNecessario / ticketAtual);
    const vendasDiaNecessarias = Math.ceil(vendasNecessarias / diasUteis);
    const ticketNecessario = fatNecessario / result.vendasMes;
    const horasNecessarias = vendasNecessarias * 1.2;
    return { lucroDesejado, fatNecessario, vendasNecessarias, vendasDiaNecessarias, ticketNecessario, horasNecessarias };
  }

  function getContratacao() {
    if (!result || !custoFunc.raw) return null;
    const custoTotal = custoFunc.raw * 1.8;
    const vendasExtras = Math.ceil(custoTotal / ticket.raw);
    const vendasExtrasDia = Math.ceil(vendasExtras / diasUteis);
    const aumento = (custoTotal / result.faturamento) * 100;
    const lucroCom = result.lucroMensal - custoTotal + (vendasExtras * ticket.raw * 0.5);
    return { custoTotal, vendasExtras, vendasExtrasDia, aumento, lucroCom, lucroSem: result.lucroMensal };
  }

  function getPlanoAcao() {
    if (!result) return null;
    const n = nichoData;
    const plano = [];

    // Semana 1 - Preço
    if (result.ticketVsRef < 0) {
      plano.push({ semana:1, titulo:"Reajuste estratégico de preço", tarefas:[
        `Identifique seus 3 ${n.vendas} mais baratos`,
        `Reajuste o preço deles em 15% (de ${fmt(ticket.raw)} para ${fmt(ticket.raw*1.15)})`,
        `Crie um combo: serviço principal + complemento com 10% de desconto sobre os dois separados`,
        `Meta: aplicar o novo preço em pelo menos 5 ${n.cliente} esta semana`
      ], impacto: fmt(result.vendasMes * ticket.raw * 0.15) + "/mês" });
    } else {
      plano.push({ semana:1, titulo:"Criar oferta premium", tarefas:[
        `Seu ticket já é bom (${fmt(ticket.raw)}). Hora de criar uma versão premium.`,
        `Adicione um serviço/produto VIP com 50% a mais de preço`,
        `Ofereça exclusividade ou prioridade como diferencial`,
        `Meta: vender a versão premium para 3 ${n.cliente} esta semana`
      ], impacto: fmt(result.vendasMes * ticket.raw * 0.15) + "/mês" });
    }

    // Semana 2 - Despesas
    plano.push({ semana:2, titulo:"Auditoria de despesas", tarefas:[
      `Liste todas as despesas fixas e variáveis do mês`,
      `Identifique 3 despesas que podem ser renegociadas ou cortadas`,
      `Renegocie contratos (internet, aluguel, fornecedores) pedindo 10-15% de desconto`,
      `Meta: reduzir despesas em pelo menos ${fmt(despesas.raw * 0.08)} este mês`
    ], impacto: fmt(despesas.raw * 0.08) + "/mês economizado" });

    // Semana 3 - Volume
    plano.push({ semana:3, titulo:"Aumentar volume de vendas", tarefas:[
      `Mapeie os horários com mais ociosidade na sua agenda`,
      `Crie uma promoção para horários ociosos (ex: 15% off terça de manhã)`,
      `Peça indicação para seus 10 melhores ${n.cliente} — ofereça benefício`,
      `Meta: conseguir ${Math.ceil(result.vendasMes * 0.1)} ${n.vendas} extras este mês`
    ], impacto: fmt(Math.ceil(result.vendasMes * 0.1) * ticket.raw) + "/mês" });

    // Semana 4 - Fidelização
    plano.push({ semana:4, titulo:"Fidelização e recorrência", tarefas:[
      `Crie um pacote mensal/trimestral com desconto de 10% para pagamento antecipado`,
      `Envie mensagem personalizada para ${n.cliente} que não voltam há 30+ dias`,
      `Implemente um programa simples de fidelidade (ex: a cada 10, 1 grátis)`,
      `Meta: converter 5 ${n.cliente} avulsos em recorrentes`
    ], impacto: "Receita previsível e redução de ociosidade" });

    return plano;
  }

  function getProjecao6Meses() {
    if (!result) return null;
    const meses = [];
    let fat = result.faturamento;
    let lucro = result.lucroMensal;
    const crescimento = result.score >= 70 ? 0.05 : result.score >= 40 ? 0.08 : 0.12;
    for (let i = 0; i < 6; i++) {
      fat *= (1 + crescimento);
      lucro = fat - despesas.raw;
      meses.push({ mes: i + 1, fat, lucro, crescimento });
    }
    return { meses, taxaCrescimento: crescimento };
  }

  function getPontoEquilibrio() {
    if (!result) return null;
    const pe = despesas.raw / (ticket.raw * (margem / 100));
    const peDia = pe / diasUteis;
    const folga = result.vendasMes - pe;
    return { pe: Math.ceil(pe), peDia: Math.ceil(peDia), folga: Math.round(folga), folgaPct: ((folga / pe) * 100).toFixed(1) };
  }

  function getDiagnosticoInteligente() {
    if (!result) return null;
    const insights = [];
    const n = nichoData;

    // Ticket
    if (result.ticketVsRef < -20) {
      insights.push({ emoji:"🔴", title:`Seu ticket está ${Math.abs(Math.round(result.ticketVsRef))}% abaixo do mercado`, text:`No segmento ${n.label}, o ticket médio é ${fmt(n.ticketRef)}. Você cobra ${fmt(ticket.raw)}. Isso significa que a cada ${n.vendas.slice(0,-1)}, você deixa ${fmt(n.ticketRef - ticket.raw)} na mesa. Em um mês, são ${fmt((n.ticketRef - ticket.raw) * result.vendasMes)} perdidos. Ação: reajuste 15% agora — a maioria dos ${n.cliente} nem percebe.`, type:"bad", valor: (n.ticketRef - ticket.raw) * result.vendasMes });
    } else if (result.ticketVsRef < 0) {
      insights.push({ emoji:"🟡", title:`Ticket levemente abaixo da média`, text:`Você cobra ${fmt(ticket.raw)}, a referência é ${fmt(n.ticketRef)}. Diferença pequena mas que acumula: ${fmt((n.ticketRef - ticket.raw) * result.vendasMes)}/mês. Considere criar uma versão premium do seu serviço principal.`, type:"warn", valor: (n.ticketRef - ticket.raw) * result.vendasMes });
    } else {
      insights.push({ emoji:"🟢", title:`Ticket acima da média do mercado`, text:`Excelente! Seu ticket de ${fmt(ticket.raw)} está ${Math.round(result.ticketVsRef)}% acima da referência de ${fmt(n.ticketRef)}. Mantenha e explore versões premium.`, type:"good", valor: 0 });
    }

    // Margem
    if (result.margemVsRef < -15) {
      insights.push({ emoji:"🔴", title:`Margem crítica: ${pct(margem)} (referência: ${pct(n.margemRef)})`, text:`Sua margem está ${Math.abs(Math.round(result.margemVsRef))} pontos abaixo do saudável. Isso significa que de cada R$100 que entra, apenas R$${margem} é lucro — deveria ser R$${n.margemRef}. Você está perdendo ${fmt(result.perdaMargem)}/mês. Ação prioritária: revise seus 3 maiores custos variáveis esta semana.`, type:"bad", valor: result.perdaMargem });
    } else if (result.margemVsRef < 0) {
      insights.push({ emoji:"🟡", title:`Margem abaixo do ideal`, text:`Sua margem de ${pct(margem)} está próxima da referência (${pct(n.margemRef)}), mas cada ponto percentual conta. 1 ponto a mais = ${fmt(result.faturamento * 0.01)}/mês.`, type:"warn", valor: result.faturamento * Math.abs(result.margemVsRef) / 100 });
    } else {
      insights.push({ emoji:"🟢", title:`Margem saudável`, text:`Sua margem de ${pct(margem)} está ${Math.round(result.margemVsRef)} pontos acima da referência. Bom controle de custos!`, type:"good", valor: 0 });
    }

    // Carga de trabalho
    if (result.vendasDia > 15) {
      insights.push({ emoji:"🔴", title:`Volume de vendas diário muito alto`, text:`${result.vendasDia} ${n.vendas}/dia é insustentável. Risco de burnout e queda na qualidade. Com ticket mais alto, você precisaria de menos ${n.vendas} pra faturar o mesmo.`, type:"bad", valor: 0 });
    } else if (result.vendasDia > 8) {
      insights.push({ emoji:"🟡", title:`Volume de vendas diário elevado`, text:`${result.vendasDia} ${n.vendas}/dia é viável mas exigente. Considere aumentar ticket em 20% pra reduzir pra ${result.vendasDiaUp} ${n.vendas}/dia.`, type:"warn", valor: 0 });
    } else {
      insights.push({ emoji:"🟢", title:`Volume de vendas sustentável`, text:`${result.vendasDia} ${n.vendas}/dia é um ritmo saudável. Sobra tempo para estratégia e crescimento.`, type:"good", valor: 0 });
    }

    // Ociosidade
    if (horariosVagos > 30) {
      insights.push({ emoji:"🔴", title:`${horariosVagos}% de ociosidade`, text:`Quase um terço da sua capacidade está ociosa. Isso representa ${fmt(result.perdaOciosidade)}/mês em receita potencial não capturada. Ação: crie promoções pra horários vazios e invista em captação.`, type:"bad", valor: result.perdaOciosidade });
    } else if (horariosVagos > 15) {
      insights.push({ emoji:"🟡", title:`${horariosVagos}% de ociosidade`, text:`Há espaço pra crescer sem trabalhar mais horas. Preencher esses horários pode gerar +${fmt(result.perdaOciosidade)}/mês.`, type:"warn", valor: result.perdaOciosidade });
    }

    return insights;
  }

  function gerarPDF() {
    if (!result) return;
    const doc = new jsPDF();
    const n = nichoData;
    let y = 20;
    const line = (text, size=12, bold=false) => {
      doc.setFontSize(size);
      if (bold) doc.setFont(undefined, "bold"); else doc.setFont(undefined, "normal");
      const lines = doc.splitTextToSize(text, 170);
      lines.forEach(l => { if (y > 270) { doc.addPage(); y = 20; } doc.text(l, 20, y); y += size * 0.5 + 2; });
      y += 4;
    };

    line("BUSINESSONE - RELATÓRIO FINANCEIRO", 20, true);
    line(nomeNegocio || nome || "Meu Negócio", 14);
    line(`Segmento: ${n.emoji} ${n.label}`, 12);
    line(`Data: ${new Date().toLocaleDateString("pt-BR")}`, 10);
    y += 8;
    line("DIAGNÓSTICO FINANCEIRO", 16, true);
    line(`Score Financeiro: ${result.score}/100`);
    line(`Faturamento necessário: ${fmt(result.faturamento)}/mês`);
    line(`Lucro mensal estimado: ${fmt(result.lucroMensal)}`);
    line(`Meta diária: ${fmt(result.metaDiaria)} (${result.vendasDia} ${n.vendas})`);
    line(`Meta semanal: ${fmt(result.metaSemanal)}`);
    line(`Ticket médio: ${fmt(ticket.raw)} (ref: ${fmt(n.ticketRef)})`);
    line(`Margem: ${pct(margem)} (ref: ${pct(n.margemRef)})`);
    y += 6;
    line("QUANTO ESTÁ DEIXANDO NA MESA", 16, true);
    line(`Total: ${fmt(result.totalNaMesa)}/mês`);
    line(`- Perda por ticket abaixo do ideal: ${fmt(result.perdaTicket)}`);
    line(`- Perda por margem abaixo do ideal: ${fmt(result.perdaMargem)}`);
    line(`- Perda por ociosidade: ${fmt(result.perdaOciosidade)}`);
    y += 6;
    line("VALOR/HORA REAL", 16, true);
    line(`Lucro mensal ÷ horas trabalhadas = ${fmt(result.horaReal)}/hora`);
    y += 6;

    if (proUnlocked) {
      const pe = getPontoEquilibrio();
      if (pe) {
        line("PONTO DE EQUILÍBRIO", 16, true);
        line(`${pe.pe} ${n.vendas}/mês (${pe.peDia}/dia)`);
        line(`Folga atual: ${pe.folga} ${n.vendas} acima do equilíbrio`);
      }
      const proj = getProjecao6Meses();
      if (proj) {
        line("PROJEÇÃO 6 MESES", 16, true);
        proj.meses.forEach(m => {
          line(`Mês ${m.mes}: Faturamento ${fmt(m.fat)} | Lucro ${fmt(m.lucro)}`);
        });
      }
    }

    doc.save(`businessone-relatorio-${new Date().toISOString().slice(0,10)}.pdf`);
  }

  function gerarPropostaPDF() {
    const doc = new jsPDF();
    let y = 20;
    const line = (text, size=12, bold=false) => {
      doc.setFontSize(size);
      if (bold) doc.setFont(undefined, "bold"); else doc.setFont(undefined, "normal");
      const lines = doc.splitTextToSize(text, 170);
      lines.forEach(l => { if (y > 270) { doc.addPage(); y = 20; } doc.text(l, 20, y); y += size * 0.5 + 2; });
      y += 4;
    };

    line("PROPOSTA COMERCIAL", 22, true);
    line(nomeNegocio || "Meu Negócio", 16, true);
    line(`Data: ${new Date().toLocaleDateString("pt-BR")}`, 11);
    y += 10;
    line("SERVIÇO OFERECIDO", 16, true);
    line(servicoTop || `Serviço principal — ${nichoData.label}`);
    line(`Investimento: ${precoServico || fmt(ticket.raw)}`);
    y += 6;
    line("O QUE ESTÁ INCLUSO", 16, true);
    line("• Atendimento personalizado e exclusivo");
    line("• Acompanhamento completo do início ao fim");
    line("• Suporte durante todo o período contratado");
    line("• Garantia de satisfação");
    y += 6;
    line("DIFERENCIAIS", 16, true);
    line(`• Experiência comprovada no segmento ${nichoData.label}`);
    line("• Metodologia própria focada em resultados");
    line("• Atendimento humanizado e dedicado");
    y += 6;
    line("CONDIÇÕES", 16, true);
    line("• Validade desta proposta: 7 dias");
    line("• Formas de pagamento: Pix, cartão ou transferência");
    y += 10;
    line("Ficou com alguma dúvida? Entre em contato!", 12);

    doc.save(`proposta-${new Date().toISOString().slice(0,10)}.pdf`);
  }

  function compartilharWhatsApp() {
    if (!result) return;
    const n = nichoData;
    const texto = `🎯 *Diagnóstico BusinessOne*%0A%0A📊 Score: ${result.score}/100%0A💰 Meta diária: ${fmt(result.metaDiaria)}%0A📈 ${result.vendasDia} ${n.vendas}/dia%0A💵 Lucro estimado: ${fmt(result.lucroMensal)}/mês%0A%0A🔴 Deixando na mesa: ${fmt(result.totalNaMesa)}/mês%0A%0AFaça seu diagnóstico grátis:%0Ahttps://business-one-ccla.vercel.app/app`;
    window.open(`https://wa.me/?text=${texto}`, "_blank");
  }

  /* ── STEP NAVIGATION ── */
  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => s - 1);

  const canNext = () => {
    if (step === 0) return true;
    if (step === 1) return nicho !== null;
    if (step === 2) return despesas.raw > 0;
    if (step === 3) return ticket.raw > 0;
    if (step === 4) return margem !== null;
    return true;
  };

  /* ── PRO TABS ── */
  const proTabs = [
    { id:"dashboard", label:"📊 Dashboard" },
    { id:"namesa", label:"💸 Na Mesa" },
    { id:"plano", label:"📋 Plano 30d" },
    { id:"reversa", label:"🧮 Precificação" },
    { id:"hora", label:"⏰ Hora Real" },
    { id:"clt", label:"🆚 CLT" },
    { id:"ferias", label:"🏖️ Férias" },
    { id:"contratacao", label:"👥 Contratação" },
    { id:"cenarios", label:"🔄 Cenários" },
    { id:"projecao", label:"📈 Projeção" },
    { id:"equilibrio", label:"⚖️ Equilíbrio" },
    { id:"proposta", label:"📝 Proposta" },
    { id:"pdf", label:"📄 PDF" },
    { id:"share", label:"📲 Compartilhar" },
  ];

  /* ── RENDER ── */
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Space+Grotesk:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <div style={S.wrap}>
        <div ref={topRef} style={S.container}>

          {/* STEP 0 — INTRO */}
          {step === 0 && (
            <div style={{ textAlign:"center", paddingTop:40 }}>
              <div style={{ fontSize:48, marginBottom:16 }}>🎯</div>
              <h1 style={{ ...S.title, fontSize:28 }}>Descubra sua meta real<br/>em 2 minutos</h1>
              <p style={S.subtitle}>Não é uma calculadora genérica. É um diagnóstico personalizado pro seu tipo de negócio — com insights, benchmarks e sugestões práticas.</p>
              <div style={{ display:"flex", flexDirection:"column", gap:10, textAlign:"left", maxWidth:300, margin:"0 auto 28px" }}>
                {["🎯 Meta diária, semanal e mensal personalizada","📊 Diagnóstico comparado ao seu segmento","💡 Sugestões para melhorar seu resultado","🔄 Simulação de cenários alternativos"].map((t,i) => (
                  <div key={i} style={{ fontSize:14, color:C.gray }}>{t}</div>
                ))}
              </div>
              <button style={S.btn} onClick={next}>Começar diagnóstico</button>
            </div>
          )}

          {/* STEP 1 — NICHO */}
          {step === 1 && (
            <div>
              <Progress step={0} total={5} />
              <h2 style={S.title}>Qual é o seu segmento?</h2>
              <p style={S.subtitle}>Isso personaliza benchmarks e sugestões</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
                {NICHOS.map(n => (
                  <Tag key={n.id} active={nicho===n.id} onClick={() => setNicho(n.id)}>{n.emoji} {n.label}</Tag>
                ))}
              </div>
              <div style={{ marginBottom:12 }}>
                <label style={S.label}>Seu nome (opcional)</label>
                <input style={S.input} placeholder="Como quer ser chamado?" value={nome} onChange={e => setNome(e.target.value)} />
              </div>
              <button style={S.btn} onClick={next} disabled={!canNext()}>Continuar</button>
            </div>
          )}

          {/* STEP 2 — DESPESAS */}
          {step === 2 && (
            <div>
              <Progress step={1} total={5} />
              <h2 style={S.title}>Despesas mensais</h2>
              <p style={S.subtitle}>Aluguel, salários, materiais, contas... tudo somado</p>
              <label style={S.label}>Total de despesas/mês</label>
              <input style={S.input} inputMode="numeric" placeholder="R$ 0,00" value={despesas.display} onChange={despesas.onChange} />
              <div style={{ marginTop:16 }}>
                <label style={S.label}>Dias úteis trabalhados/mês</label>
                <input style={S.input} type="number" value={diasUteis} onChange={e => setDiasUteis(Number(e.target.value) || 22)} />
              </div>
              <div style={{ marginTop:16 }}>
                <label style={S.label}>Horas trabalhadas/dia</label>
                <input style={S.input} type="number" value={horasDia} onChange={e => setHorasDia(Number(e.target.value) || 8)} />
              </div>
              <div style={{ marginTop:16 }}>
                <label style={S.label}>% de horários/agenda vagos (estimativa)</label>
                <input style={S.input} type="number" value={horariosVagos} onChange={e => setHorariosVagos(Number(e.target.value) || 0)} min={0} max={100} />
              </div>
              <div style={{ display:"flex", gap:10, marginTop:16 }}>
                <button style={S.btnOutline} onClick={back}>Voltar</button>
                <button style={S.btn} onClick={next} disabled={!canNext()}>Continuar</button>
              </div>
            </div>
          )}

          {/* STEP 3 — TICKET */}
          {step === 3 && (
            <div>
              <Progress step={2} total={5} />
              <h2 style={S.title}>Ticket médio</h2>
              <p style={S.subtitle}>Quanto cada {nichoData?.cliente || "cliente"} paga em média por {nichoData?.vendas?.slice(0,-1) || "compra"}</p>
              <label style={S.label}>Ticket médio</label>
              <input style={S.input} inputMode="numeric" placeholder="R$ 0,00" value={ticket.display} onChange={ticket.onChange} />
              {nichoData && <p style={{ color:C.gray, fontSize:12, marginTop:8 }}>Referência para {nichoData.label}: {fmt(nichoData.ticketRef)}</p>}
              <div style={{ display:"flex", gap:10, marginTop:16 }}>
                <button style={S.btnOutline} onClick={back}>Voltar</button>
                <button style={S.btn} onClick={next} disabled={!canNext()}>Continuar</button>
              </div>
            </div>
          )}

          {/* STEP 4 — MARGEM */}
          {step === 4 && (
            <div>
              <Progress step={3} total={5} />
              <h2 style={S.title}>Margem de lucro</h2>
              <p style={S.subtitle}>De cada R$100 que entra, quanto sobra após pagar tudo?</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:12 }}>
                {[20,25,30,35,40,45,50,55,60].map(v => (
                  <Tag key={v} active={margem===v} onClick={() => setMargem(v)}>{v}%</Tag>
                ))}
              </div>
              {nichoData && <p style={{ color:C.gray, fontSize:12 }}>Referência para {nichoData.label}: {nichoData.margemRef}%</p>}
              <div style={{ display:"flex", gap:10, marginTop:16 }}>
                <button style={S.btnOutline} onClick={back}>Voltar</button>
                <button style={S.btn} onClick={calcular}>Ver meu diagnóstico</button>
              </div>
            </div>
          )}

          {/* STEP 5 — LOADING */}
          {step === 5 && (
            <div style={{ textAlign:"center", paddingTop:80 }}>
              <div style={{ fontSize:48, marginBottom:16, animation:"spin 1s linear infinite" }}>⚙️</div>
              <p style={{ color:C.gray }}>Analisando seu negócio...</p>
            </div>
          )}

          {/* STEP 6 — RESULTS */}
          {step === 6 && result && (
            <div>
              {/* SCORE */}
              <div style={{ textAlign:"center", marginBottom:24 }}>
                <p style={{ color:C.gray, fontSize:14, marginBottom:8 }}>{nome ? `${nome}, seu` : "Seu"} score financeiro</p>
                <div style={{ fontSize:64, fontWeight:800, fontFamily:"'Space Grotesk',sans-serif", color: result.score >= 70 ? C.green : result.score >= 40 ? C.yellow : C.red }}>{result.score}</div>
                <p style={{ fontSize:13, color:C.gray }}>/100 pontos</p>
              </div>

              {/* SCORE BARS */}
              <div style={S.card}>
                <ScoreBar label="Ticket médio" value={result.scoreTicket} max={40} color={result.scoreTicket >= 28 ? C.green : result.scoreTicket >= 16 ? C.yellow : C.red} />
                <ScoreBar label="Margem de lucro" value={result.scoreMargem} max={35} color={result.scoreMargem >= 24 ? C.green : result.scoreMargem >= 14 ? C.yellow : C.red} />
                <ScoreBar label="Carga de trabalho" value={result.scoreWorkload} max={25} color={result.scoreWorkload >= 18 ? C.green : result.scoreWorkload >= 10 ? C.yellow : C.red} />
              </div>

              {/* METAS */}
              <div style={S.card}>
                <h3 style={S.sectionTitle}>🎯 Suas metas</h3>
                <BigNumber label="Meta diária" value={fmt(result.metaDiaria)} sub={`${result.vendasDia} ${nichoData.vendas}/dia`} />
                <div style={{ display:"flex", gap:16 }}>
                  <div style={{ flex:1, textAlign:"center" }}>
                    <p style={{ fontSize:12, color:C.gray, margin:"0 0 4px" }}>Semanal</p>
                    <p style={{ fontSize:18, fontWeight:700, color:C.white, margin:0 }}>{fmt(result.metaSemanal)}</p>
                    <p style={{ fontSize:11, color:C.gray }}>{result.vendasSemana} {nichoData.vendas}</p>
                  </div>
                  <div style={{ flex:1, textAlign:"center" }}>
                    <p style={{ fontSize:12, color:C.gray, margin:"0 0 4px" }}>Mensal</p>
                    <p style={{ fontSize:18, fontWeight:700, color:C.white, margin:0 }}>{fmt(result.metaMensal)}</p>
                    <p style={{ fontSize:11, color:C.gray }}>{result.vendasMes} {nichoData.vendas}</p>
                  </div>
                </div>
              </div>

              {/* LUCRO */}
              <div style={S.cardAccent}>
                <BigNumber label="Lucro mensal estimado" value={fmt(result.lucroMensal)} color={C.green} />
              </div>

              {/* DIAGNÓSTICO INTELIGENTE */}
              <div style={{ marginBottom:20 }}>
                <h3 style={S.sectionTitle}>🔍 Diagnóstico</h3>
                {getDiagnosticoInteligente()?.map((ins, i) => (
                  <Insight key={i} emoji={ins.emoji} title={ins.title} text={ins.text} type={ins.type} />
                ))}
              </div>

              {/* QUANTO DEIXA NA MESA (TEASER) */}
              <div style={{ ...S.cardAccent, textAlign:"center", border:`1px solid ${C.red}33` }}>
                <p style={{ fontSize:14, color:C.red, fontWeight:600, margin:"0 0 4px" }}>💸 Você está deixando na mesa</p>
                <p style={{ fontSize:36, fontWeight:800, color:C.red, fontFamily:"'Space Grotesk',sans-serif", margin:"0 0 8px" }}>{fmt(result.totalNaMesa)}/mês</p>
                <p style={{ fontSize:12, color:C.gray }}>por ticket, margem e ociosidade abaixo do ideal</p>
              </div>

              {/* CENÁRIOS GRATUITOS */}
              <div style={S.card}>
                <h3 style={S.sectionTitle}>🔄 Cenários alternativos</h3>
                <Insight emoji="📈" title={`Ticket +20% (${fmt(result.ticketUp)})`} text={`Precisaria de ${result.vendasDiaUp} ${nichoData.vendas}/dia em vez de ${result.vendasDia}. Trabalha menos, ganha igual.`} type="info" />
                <Insight emoji="📅" title={`+5 dias úteis (${result.diasUp} dias)`} text={`Precisaria de ${result.vendasDiaDias} ${nichoData.vendas}/dia em vez de ${result.vendasDia}. Mais dias = meta diária menor.`} type="info" />
              </div>

              {/* PRO UNLOCK */}
              {!proUnlocked && (
                <div style={{ ...S.cardAccent, textAlign:"center", border:`2px solid ${C.accent}` }}>
                  <p style={{ fontSize:22, fontWeight:800, marginBottom:8, fontFamily:"'Space Grotesk',sans-serif" }}>🔓 Desbloquear versão completa</p>
                  <p style={{ color:C.gray, fontSize:14, lineHeight:1.6, marginBottom:16 }}>18 ferramentas: plano de ação, precificação reversa, hora real, CLT vs negócio, proposta comercial, projeção e muito mais.</p>
                  <button style={S.btn} onClick={() => window.open("https://pay.kiwify.com.br/oi816Px","_blank")}>Quero acesso completo — R$47</button>
                  <div style={{ marginTop:20 }}>
                    <p style={{ fontSize:13, color:C.gray, marginBottom:8 }}>Já comprou? Digite seu código:</p>
                    <div style={{ display:"flex", gap:8 }}>
                      <input style={{ ...S.input, flex:1 }} placeholder="Código de acesso" value={proCode} onChange={e => setProCode(e.target.value)} />
                      <button style={S.btnSmall} onClick={handleProCode}>Ativar</button>
                    </div>
                    {proCodeError && <p style={{ color:C.red, fontSize:12, marginTop:6 }}>Código inválido. Verifique e tente novamente.</p>}
                  </div>
                </div>
              )}

              {/* PRO AREA */}
              {proUnlocked && (
                <div style={{ marginTop:24 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20 }}>
                    <span style={{ fontSize:20 }}>⚡</span>
                    <h3 style={{ ...S.sectionTitle, margin:0 }}>Ferramentas PRO</h3>
                    <ProBadge />
                  </div>

                  {/* TAB NAV */}
                  <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:12, marginBottom:20 }}>
                    {proTabs.map(t => (
                      <button key={t.id} style={S.tab(proTab===t.id)} onClick={() => setProTab(t.id)}>{t.label}</button>
                    ))}
                  </div>

                  {/* DASHBOARD */}
                  {proTab === "dashboard" && (
                    <div>
                      <div style={S.card}>
                        <h4 style={{ ...S.sectionTitle, fontSize:16 }}>🏥 Saúde Financeira</h4>
                        <Semaforo color={result.scoreTicket >= 28 ? C.green : result.scoreTicket >= 16 ? C.yellow : C.red} label="Ticket Médio" value={fmt(ticket.raw)} />
                        <Semaforo color={result.scoreMargem >= 24 ? C.green : result.scoreMargem >= 14 ? C.yellow : C.red} label="Margem de Lucro" value={pct(margem)} />
                        <Semaforo color={result.scoreWorkload >= 18 ? C.green : result.scoreWorkload >= 10 ? C.yellow : C.red} label="Carga de Trabalho" value={`${result.vendasDia}/dia`} />
                        <Semaforo color={result.totalNaMesa < 500 ? C.green : result.totalNaMesa < 2000 ? C.yellow : C.red} label="Dinheiro na Mesa" value={fmt(result.totalNaMesa)} />
                        <Semaforo color={result.horaReal >= 50 ? C.green : result.horaReal >= 25 ? C.yellow : C.red} label="Valor/Hora Real" value={fmt(result.horaReal)} />
                      </div>
                      <Insight emoji="💡" title="O que priorizar?" text={result.totalNaMesa > 1000 ? `Você está perdendo ${fmt(result.totalNaMesa)}/mês. Vá para a aba "Na Mesa" e depois "Plano 30d" para resolver isso.` : `Sua situação é boa! Foque em crescimento — veja a aba "Projeção" e "Cenários".`} type="info" />
                    </div>
                  )}

                  {/* NA MESA */}
                  {proTab === "namesa" && (
                    <div>
                      <div style={{ ...S.card, textAlign:"center", border:`1px solid ${C.red}33` }}>
                        <BigNumber label="Total que você deixa na mesa por mês" value={fmt(result.totalNaMesa)} color={C.red} />
                        <p style={{ color:C.gray, fontSize:13 }}>São {fmt(result.totalNaMesa * 12)}/ano</p>
                      </div>
                      <div style={S.card}>
                        <h4 style={{ ...S.sectionTitle, fontSize:15 }}>Detalhamento</h4>
                        <div style={{ marginBottom:16 }}>
                          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                            <span style={{ fontSize:14, color:C.white }}>Perda por ticket abaixo do ideal</span>
                            <span style={{ fontSize:14, fontWeight:700, color:C.red }}>{fmt(result.perdaTicket)}</span>
                          </div>
                          <p style={{ fontSize:12, color:C.gray, margin:0 }}>Seu ticket: {fmt(ticket.raw)} | Ideal: {fmt(result.ticketIdeal)}</p>
                        </div>
                        <div style={{ marginBottom:16 }}>
                          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                            <span style={{ fontSize:14, color:C.white }}>Perda por margem abaixo do ideal</span>
                            <span style={{ fontSize:14, fontWeight:700, color:C.red }}>{fmt(result.perdaMargem)}</span>
                          </div>
                          <p style={{ fontSize:12, color:C.gray, margin:0 }}>Sua margem: {pct(margem)} | Ideal: {pct(result.margemIdeal)}</p>
                        </div>
                        <div>
                          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                            <span style={{ fontSize:14, color:C.white }}>Perda por ociosidade</span>
                            <span style={{ fontSize:14, fontWeight:700, color:C.red }}>{fmt(result.perdaOciosidade)}</span>
                          </div>
                          <p style={{ fontSize:12, color:C.gray, margin:0 }}>Ociosidade estimada: {horariosVagos}%</p>
                        </div>
                      </div>
                      <Insight emoji="🎯" title="Como recuperar esse dinheiro?" text={`Vá para a aba "Plano 30d" — lá tem um plano de 4 semanas personalizado pro seu nicho pra recuperar até ${fmt(result.totalNaMesa * 0.6)}/mês.`} type="info" />
                    </div>
                  )}

                  {/* PLANO 30 DIAS */}
                  {proTab === "plano" && (
                    <div>
                      {getPlanoAcao()?.map((s, i) => (
                        <div key={i} style={S.card}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                            <h4 style={{ fontSize:15, fontWeight:700, color:C.accent, margin:0 }}>Semana {s.semana}</h4>
                            <span style={{ fontSize:12, color:C.green, fontWeight:600 }}>Impacto: {s.impacto}</span>
                          </div>
                          <p style={{ fontSize:15, fontWeight:600, color:C.white, marginBottom:12 }}>{s.titulo}</p>
                          {s.tarefas.map((t, j) => (
                            <div key={j} style={{ display:"flex", gap:10, marginBottom:8 }}>
                              <span style={{ color:C.accent, fontSize:14, flexShrink:0 }}>→</span>
                              <span style={{ fontSize:13, color:C.gray, lineHeight:1.5 }}>{t}</span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* PRECIFICAÇÃO REVERSA */}
                  {proTab === "reversa" && (
                    <div>
                      <div style={S.card}>
                        <h4 style={{ ...S.sectionTitle, fontSize:15 }}>Quanto você quer ganhar por mês (líquido)?</h4>
                        <input style={S.input} inputMode="numeric" placeholder="R$ 0,00" value={salarioDesejado.display} onChange={salarioDesejado.onChange} />
                      </div>
                      {(() => {
                        const r = getPrecificacaoReversa();
                        if (!r) return <Insight emoji="💡" title="Preencha acima" text="Digite quanto quer ganhar líquido por mês." type="info" />;
                        return (
                          <div style={S.card}>
                            <BigNumber label="Faturamento necessário" value={fmt(r.fatNecessario)} color={C.accent} />
                            <div style={{ display:"flex", gap:16 }}>
                              <div style={{ flex:1, textAlign:"center" }}>
                                <p style={{ fontSize:12, color:C.gray, margin:"0 0 4px" }}>Com ticket atual ({fmt(ticket.raw)})</p>
                                <p style={{ fontSize:20, fontWeight:700, color:C.white, margin:0 }}>{r.vendasNecessarias} {nichoData.vendas}/mês</p>
                                <p style={{ fontSize:12, color:C.gray }}>{r.vendasDiaNecessarias}/dia</p>
                              </div>
                              <div style={{ flex:1, textAlign:"center" }}>
                                <p style={{ fontSize:12, color:C.gray, margin:"0 0 4px" }}>Ticket necessário (com vendas atuais)</p>
                                <p style={{ fontSize:20, fontWeight:700, color:C.accent, margin:0 }}>{fmt(r.ticketNecessario)}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* HORA REAL */}
                  {proTab === "hora" && (
                    <div>
                      <div style={S.card}>
                        <label style={S.label}>Horas trabalhadas por semana</label>
                        <input style={S.input} type="number" value={horasSemana} onChange={e => setHorasSemana(Number(e.target.value) || 44)} />
                      </div>
                      {(() => {
                        const h = getHoraReal();
                        if (!h) return null;
                        return (
                          <>
                            <div style={{ ...S.card, textAlign:"center" }}>
                              <BigNumber label="Seu valor/hora real" value={fmt(h.horaReal)} color={h.horaReal >= 50 ? C.green : h.horaReal >= 25 ? C.yellow : C.red} sub={`${Math.round(h.horasMes)} horas/mês trabalhadas`} />
                            </div>
                            <Insight emoji={h.horaReal >= 50 ? "🟢" : h.horaReal >= 25 ? "🟡" : "🔴"}
                              title={h.horaReal >= 50 ? "Bom valor por hora!" : h.horaReal >= 25 ? "Valor/hora razoável" : "Valor/hora preocupante"}
                              text={`Salário mínimo/hora: ${fmt(h.salarioMinHora)}. Você ganha ${h.vsMinimo.toFixed(1)}x o mínimo por hora. ${h.horaReal < 25 ? "Considere aumentar ticket ou reduzir horas operacionais." : ""}`}
                              type={h.horaReal >= 50 ? "good" : h.horaReal >= 25 ? "warn" : "bad"} />
                          </>
                        );
                      })()}
                    </div>
                  )}

                  {/* CLT VS NEGÓCIO */}
                  {proTab === "clt" && (
                    <div>
                      {(() => {
                        const c = getCLTvs();
                        if (!c) return null;
                        return (
                          <>
                            <div style={{ display:"flex", gap:12, marginBottom:16 }}>
                              <div style={{ ...S.card, flex:1, textAlign:"center" }}>
                                <p style={{ fontSize:12, color:C.gray, margin:"0 0 4px" }}>Seu negócio</p>
                                <p style={{ fontSize:22, fontWeight:700, color:C.accent, margin:0 }}>{fmt(result.lucroMensal)}</p>
                                <p style={{ fontSize:11, color:C.gray }}>líquido/mês</p>
                              </div>
                              <div style={{ ...S.card, flex:1, textAlign:"center" }}>
                                <p style={{ fontSize:12, color:C.gray, margin:"0 0 4px" }}>CLT equivalente</p>
                                <p style={{ fontSize:22, fontWeight:700, color:C.blue, margin:0 }}>{fmt(c.cltComBeneficios)}</p>
                                <p style={{ fontSize:11, color:C.gray }}>com benefícios (1.4x)</p>
                              </div>
                            </div>
                            <Insight emoji={result.lucroMensal > c.cltComBeneficios ? "🟢" : "🟡"}
                              title={result.lucroMensal > c.cltComBeneficios ? "Seu negócio compensa!" : "Atenção: CLT pode estar mais vantajosa"}
                              text={result.lucroMensal > c.cltComBeneficios
                                ? `Você ganha ${fmt(result.lucroMensal - c.cltComBeneficios)} a mais que um CLT equivalente (com benefícios). Além disso, tem liberdade e potencial de crescimento.`
                                : `Um CLT com benefícios equivalentes ganharia ${fmt(c.cltComBeneficios - result.lucroMensal)} a mais. Mas lembre: empreender oferece potencial de escala — foque em aumentar margem e ticket.`}
                              type={result.lucroMensal > c.cltComBeneficios ? "good" : "warn"} />
                          </>
                        );
                      })()}
                    </div>
                  )}

                  {/* FÉRIAS */}
                  {proTab === "ferias" && (
                    <div>
                      <div style={S.card}>
                        <label style={S.label}>Quantos dias de férias quer tirar?</label>
                        <input style={S.input} type="number" value={diasFerias} onChange={e => setDiasFerias(Number(e.target.value) || 30)} />
                      </div>
                      {(() => {
                        const f = getFerias();
                        if (!f) return null;
                        return (
                          <>
                            <div style={{ ...S.card, textAlign:"center" }}>
                              <BigNumber label={`Custo de ${diasFerias} dias de férias`} value={fmt(f.custoFerias)} color={C.yellow} sub={`${fmt(f.ganhosDiarios)}/dia que você deixa de ganhar`} />
                            </div>
                            <Insight emoji="💡" title={`Prepare-se com ${f.mesesPreparo} meses de antecedência`} text={`Guardando 15% do lucro mensal (${fmt(result.lucroMensal * 0.15)}), você junta o suficiente em ${f.mesesPreparo} meses. Comece agora e tire férias sem culpa!`} type="info" />
                          </>
                        );
                      })()}
                    </div>
                  )}

                  {/* CONTRATAÇÃO */}
                  {proTab === "contratacao" && (
                    <div>
                      <div style={S.card}>
                        <label style={S.label}>Salário do funcionário</label>
                        <input style={S.input} inputMode="numeric" placeholder="R$ 0,00" value={custoFunc.display} onChange={custoFunc.onChange} />
                        <p style={{ fontSize:11, color:C.gray, marginTop:6 }}>Custo real ≈ 1.8x o salário (encargos, férias, 13º)</p>
                      </div>
                      {(() => {
                        const ct = getContratacao();
                        if (!ct) return <Insight emoji="💡" title="Preencha acima" text="Informe o salário do possível funcionário." type="info" />;
                        return (
                          <>
                            <div style={S.card}>
                              <BigNumber label="Custo real do funcionário" value={fmt(ct.custoTotal)} color={C.red} sub="salário + encargos (1.8x)" />
                              <div style={{ borderTop:"1px solid #222", paddingTop:16 }}>
                                <p style={{ fontSize:14, color:C.white, margin:"0 0 4px" }}>Para pagar esse funcionário, você precisa de:</p>
                                <p style={{ fontSize:24, fontWeight:700, color:C.accent, margin:"0 0 4px" }}>+{ct.vendasExtras} {nichoData.vendas}/mês</p>
                                <p style={{ fontSize:13, color:C.gray }}>({ct.vendasExtrasDia} extras por dia)</p>
                              </div>
                            </div>
                            <Insight emoji={ct.vendasExtrasDia <= 3 ? "🟢" : ct.vendasExtrasDia <= 6 ? "🟡" : "🔴"}
                              title={ct.vendasExtrasDia <= 3 ? "Contratação viável!" : ct.vendasExtrasDia <= 6 ? "Contratação possível, mas exige atenção" : "Contratação arriscada neste momento"}
                              text={`Você precisaria aumentar seu faturamento em ${pct(ct.aumento)} pra cobrir o custo. ${ct.vendasExtrasDia <= 3 ? "É totalmente viável se o funcionário gerar as vendas extras." : "Considere primeiro aumentar ticket e margem antes de contratar."}`}
                              type={ct.vendasExtrasDia <= 3 ? "good" : ct.vendasExtrasDia <= 6 ? "warn" : "bad"} />
                          </>
                        );
                      })()}
                    </div>
                  )}

                  {/* CENÁRIOS */}
                  {proTab === "cenarios" && (
                    <div>
                      {cenarios.map((c, i) => {
                        const r = calcCenario(c);
                        return (
                          <div key={i} style={S.card}>
                            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                              <h4 style={{ fontSize:15, fontWeight:700, color:C.accent, margin:0 }}>Cenário {i+1}</h4>
                              <button onClick={() => removeCenario(i)} style={{ background:"none", border:"none", color:C.red, cursor:"pointer", fontSize:18 }}>✕</button>
                            </div>
                            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:12 }}>
                              <div><p style={{ fontSize:11, color:C.gray, margin:0 }}>Ticket</p><input style={{ ...S.input, padding:8, fontSize:13 }} type="number" value={c.ticket} onChange={e => { const n=[...cenarios]; n[i].ticket=Number(e.target.value); setCenarios(n); }} /></div>
                              <div><p style={{ fontSize:11, color:C.gray, margin:0 }}>Margem %</p><input style={{ ...S.input, padding:8, fontSize:13 }} type="number" value={c.margem} onChange={e => { const n=[...cenarios]; n[i].margem=Number(e.target.value); setCenarios(n); }} /></div>
                              <div><p style={{ fontSize:11, color:C.gray, margin:0 }}>Dias</p><input style={{ ...S.input, padding:8, fontSize:13 }} type="number" value={c.diasUteis} onChange={e => { const n=[...cenarios]; n[i].diasUteis=Number(e.target.value); setCenarios(n); }} /></div>
                            </div>
                            <div style={{ display:"flex", justifyContent:"space-around", textAlign:"center" }}>
                              <div><p style={{ fontSize:11, color:C.gray, margin:0 }}>Fat.</p><p style={{ fontSize:15, fontWeight:700, color:C.white, margin:0 }}>{fmt(r.fat)}</p></div>
                              <div><p style={{ fontSize:11, color:C.gray, margin:0 }}>Vendas/dia</p><p style={{ fontSize:15, fontWeight:700, color:C.accent, margin:0 }}>{r.vDia}</p></div>
                              <div><p style={{ fontSize:11, color:C.gray, margin:0 }}>Lucro</p><p style={{ fontSize:15, fontWeight:700, color:C.green, margin:0 }}>{fmt(r.lucro)}</p></div>
                            </div>
                          </div>
                        );
                      })}
                      {cenarios.length < 3 && <button style={S.btnOutline} onClick={addCenario}>+ Adicionar cenário</button>}
                    </div>
                  )}

                  {/* PROJEÇÃO */}
                  {proTab === "projecao" && (
                    <div>
                      {(() => {
                        const p = getProjecao6Meses();
                        if (!p) return null;
                        return (
                          <>
                            <Insight emoji="📈" title={`Taxa de crescimento estimada: ${pct(p.taxaCrescimento * 100)}/mês`} text={result.score >= 70 ? "Seu score é alto, então a taxa de crescimento projetada é conservadora (5%/mês)." : result.score >= 40 ? "Com melhorias no plano de ação, estimamos 8%/mês de crescimento." : "Há muito espaço pra crescer — estimamos 12%/mês com as ações corretas."} type="info" />
                            {p.meses.map((m, i) => (
                              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 0", borderBottom:"1px solid #1a1a1a" }}>
                                <span style={{ color:C.white, fontSize:14, fontWeight:600 }}>Mês {m.mes}</span>
                                <div style={{ textAlign:"right" }}>
                                  <p style={{ fontSize:14, color:C.white, margin:0, fontWeight:600 }}>{fmt(m.fat)}</p>
                                  <p style={{ fontSize:12, color:C.green, margin:0 }}>Lucro: {fmt(m.lucro)}</p>
                                </div>
                              </div>
                            ))}
                          </>
                        );
                      })()}
                    </div>
                  )}

                  {/* PONTO DE EQUILÍBRIO */}
                  {proTab === "equilibrio" && (
                    <div>
                      {(() => {
                        const pe = getPontoEquilibrio();
                        if (!pe) return null;
                        return (
                          <>
                            <div style={{ ...S.card, textAlign:"center" }}>
                              <BigNumber label="Ponto de equilíbrio" value={`${pe.pe} ${nichoData.vendas}/mês`} color={C.yellow} sub={`${pe.peDia} por dia`} />
                            </div>
                            <Insight emoji={pe.folga > 0 ? "🟢" : "🔴"}
                              title={pe.folga > 0 ? `Você está ${pe.folga} ${nichoData.vendas} acima do equilíbrio` : `Atenção! Você está ${Math.abs(pe.folga)} ${nichoData.vendas} abaixo do equilíbrio`}
                              text={pe.folga > 0 ? `Boa margem de segurança (${pe.folgaPct}%). Mesmo que as vendas caiam um pouco, você não entra no vermelho.` : `Você está operando no prejuízo ou muito próximo dele. Priorize aumentar volume ou ticket urgentemente.`}
                              type={pe.folga > 0 ? "good" : "bad"} />
                          </>
                        );
                      })()}
                    </div>
                  )}

                  {/* PROPOSTA */}
                  {proTab === "proposta" && (
                    <div>
                      <div style={S.card}>
                        <h4 style={{ ...S.sectionTitle, fontSize:15 }}>Gerar proposta comercial</h4>
                        <div style={{ marginBottom:12 }}>
                          <label style={S.label}>Nome do negócio</label>
                          <input style={S.input} placeholder="Meu Negócio" value={nomeNegocio} onChange={e => setNomeNegocio(e.target.value)} />
                        </div>
                        <div style={{ marginBottom:12 }}>
                          <label style={S.label}>Serviço/produto principal</label>
                          <input style={S.input} placeholder="Ex: Corte + Escova" value={servicoTop} onChange={e => setServicoTop(e.target.value)} />
                        </div>
                        <div style={{ marginBottom:12 }}>
                          <label style={S.label}>Preço do serviço</label>
                          <input style={S.input} placeholder="Ex: R$ 150,00" value={precoServico} onChange={e => setPrecoServico(e.target.value)} />
                        </div>
                        <button style={S.btn} onClick={gerarPropostaPDF}>Gerar Proposta em PDF</button>
                      </div>
                    </div>
                  )}

                  {/* PDF */}
                  {proTab === "pdf" && (
                    <div>
                      <div style={S.card}>
                        <h4 style={{ ...S.sectionTitle, fontSize:15 }}>Relatório completo em PDF</h4>
                        <p style={{ color:C.gray, fontSize:13, lineHeight:1.6 }}>Inclui: diagnóstico, score, metas, quanto deixa na mesa, ponto de equilíbrio e projeção.</p>
                        <div style={{ marginBottom:12 }}>
                          <label style={S.label}>Nome do negócio (aparece no relatório)</label>
                          <input style={S.input} placeholder="Meu Negócio" value={nomeNegocio} onChange={e => setNomeNegocio(e.target.value)} />
                        </div>
                        <button style={S.btn} onClick={gerarPDF}>Baixar Relatório PDF</button>
                      </div>
                    </div>
                  )}

                  {/* SHARE */}
                  {proTab === "share" && (
                    <div>
                      <div style={S.card}>
                        <h4 style={{ ...S.sectionTitle, fontSize:15 }}>Compartilhar diagnóstico</h4>
                        <p style={{ color:C.gray, fontSize:13, lineHeight:1.6, marginBottom:16 }}>Envie seu resumo via WhatsApp — ótimo pra mostrar pro sócio ou consultor.</p>
                        <button style={S.btn} onClick={compartilharWhatsApp}>📲 Enviar via WhatsApp</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* REFAZER */}
              <button style={{ ...S.btnOutline, marginTop:24 }} onClick={() => { setStep(0); setResult(null); }}>🔄 Refazer diagnóstico</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
