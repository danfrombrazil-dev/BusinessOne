import { useState, useEffect, useRef } from "react";

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
  return { value, display, handleChange };
}

const Progress = ({ step, total }) => (
  <div style={{ display: "flex", gap: "6px", justifyContent: "center", marginBottom: "28px" }}>
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} style={{
        height: "4px", flex: 1, maxWidth: "40px", borderRadius: "2px",
        background: i < step ? "#FF6B35" : "#e8e8e8",
        transition: "background 0.3s"
      }} />
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

export default function App() {
  const [step, setStep] = useState(0);
  const [nicho, setNicho] = useState(null);
  const [nome, setNome] = useState("");
  const despesas = useCurrencyInput(0);
  const ticket = useCurrencyInput(0);
  const [margem, setMargem] = useState(null);
  const [diasUteis, setDiasUteis] = useState(22);
  const [result, setResult] = useState(null);
  const [showPro, setShowPro] = useState(false);
  const topRef = useRef(null);

  useEffect(() => { topRef.current?.scrollIntoView({ behavior: "smooth" }); }, [step]);

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

    // Comparação com benchmarks do nicho
    const ticketVsRef = ((ticket.value - nichoData.ticketRef) / nichoData.ticketRef) * 100;
    const margemVsRef = margem - nichoData.margemRef;

    // Score de saúde financeira (0-100)
    const scoreTicket = Math.min((ticket.value / nichoData.ticketRef) * 30, 40);
    const scoreMargem = Math.min((margem / nichoData.margemRef) * 30, 35);
    const scoreCarga = Math.max(0, 25 - (vendasDia > 5 ? (vendasDia - 5) * 5 : 0));
    const score = Math.round(scoreTicket + scoreMargem + scoreCarga);

    // Cenários
    const ticketPlus20 = ticket.value * 1.2;
    const vendasComTicketMaior = Math.ceil(faturamentoNecessario / ticketPlus20);
    const economiaVendas = vendasMes - vendasComTicketMaior;

    const diasPlus5 = diasUteis + 5;
    const vendasComMaisDias = Math.ceil(faturamentoNecessario / ticket.value / diasPlus5);

    setResult({
      faturamentoNecessario, vendasMes, vendasDia, metaDiaria, metaSemanal,
      metaMensal, lucroMensal, ticketVsRef, margemVsRef, score,
      ticketPlus20, vendasComTicketMaior, economiaVendas,
      diasPlus5, vendasComMaisDias,
      dificuldade: Math.min((vendasDia / 8) * 100, 100),
    });
    setStep(6);
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
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Space+Grotesk:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <div style={S.wrap} ref={topRef}>

        {/* Header */}
        <div style={S.header}>
          <div style={S.inner}>
            <p style={{ margin: 0, fontSize: "11px", fontWeight: "700", color: "#FF6B35", letterSpacing: "0.12em", textTransform: "uppercase" }}>Consultor Financeiro</p>
            <h1 style={{ margin: "4px 0 20px", fontSize: "26px", fontWeight: "800", color: "#fff", lineHeight: 1.2 }}>Quanto preciso<br />vender? 💰</h1>
            {step > 0 && step < 6 && <Progress step={step} total={5} />}
          </div>
        </div>

        <div style={S.inner}>

          {/* STEP 0 — INTRO */}
          {step === 0 && (
            <div style={S.card}>
              <div style={{ textAlign: "center", padding: "8px 0 20px" }}>
                <div style={{ fontSize: "64px", marginBottom: "16px" }}>🎯</div>
                <h2 style={{ margin: "0 0 12px", fontSize: "22px", fontWeight: "800", color: "#1a1a1a" }}>Descubra sua meta real em 2 minutos</h2>
                <p style={{ margin: "0 0 24px", color: "#666", fontSize: "15px", lineHeight: 1.7 }}>Não é uma calculadora genérica. É um diagnóstico personalizado pro seu tipo de negócio — com insights, benchmarks e sugestões práticas.</p>
              </div>
              {[
                ["🎯", "Meta diária, semanal e mensal personalizada"],
                ["📊", "Diagnóstico comparado ao seu segmento"],
                ["💡", "Sugestões para melhorar seu resultado"],
                ["🔄", "Simulação de cenários alternativos"],
              ].map(([icon, text]) => (
                <div key={text} style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ fontSize: "20px" }}>{icon}</span>
                  <span style={{ fontSize: "14px", fontWeight: "600", color: "#333" }}>{text}</span>
                </div>
              ))}
              <button style={{ ...S.btn, marginTop: "24px" }} onClick={() => setStep(1)}>Começar diagnóstico →</button>
            </div>
          )}

          {/* STEP 1 — NICHO */}
          {step === 1 && (
            <div style={S.card}>
              <h2 style={{ margin: "0 0 6px", fontSize: "20px", fontWeight: "800", color: "#1a1a1a" }}>Qual é o seu negócio?</h2>
              <p style={{ margin: "0 0 20px", color: "#888", fontSize: "14px" }}>Isso personaliza os benchmarks e a linguagem do resultado.</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" }}>
                {NICHOS.map(n => (
                  <Tag key={n.id} active={nicho === n.id} onClick={() => setNicho(n.id)}>
                    {n.emoji} {n.label}
                  </Tag>
                ))}
              </div>
              <div style={{ marginBottom: "20px" }}>
                <label style={S.label}>Seu nome ou do negócio (opcional)</label>
                <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Studio da Ana" style={{ ...S.input, paddingLeft: "14px" }} />
              </div>
              <button style={{ ...S.btn, ...(nicho ? {} : S.btnOff) }} onClick={() => nicho && setStep(2)}>Continuar →</button>
              <button style={S.btnGhost} onClick={() => setStep(0)}>← Voltar</button>
            </div>
          )}

          {/* STEP 2 — DESPESAS */}
          {step === 2 && (
            <div style={S.card}>
              <h2 style={{ margin: "0 0 6px", fontSize: "20px", fontWeight: "800", color: "#1a1a1a" }}>Quanto você gasta por mês? 🏠</h2>
              <p style={{ margin: "0 0 20px", color: "#888", fontSize: "14px" }}>Some tudo: aluguel, salários, fornecedores, apps, contas fixas. Quanto sai todo mês independente de vender ou não.</p>
              <div style={{ position: "relative", marginBottom: "12px" }}>
                <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontWeight: "700", color: "#888", fontFamily: "'Space Grotesk', sans-serif" }}>R$</span>
                <input type="text" inputMode="numeric" value={despesas.display} onChange={despesas.handleChange} placeholder="0,00" style={S.input}
                  onFocus={e => e.target.style.borderColor = "#FF6B35"}
                  onBlur={e => e.target.style.borderColor = "#eee"} />
              </div>
              <div style={{ background: "#fffbeb", borderRadius: "12px", padding: "12px 14px", marginBottom: "20px" }}>
                <p style={{ margin: 0, fontSize: "12px", color: "#92400e", fontWeight: "600" }}>💡 Inclua todas as despesas fixas — aluguel, energia, internet, pró-labore, fornecedores mensais.</p>
              </div>
              <button style={{ ...S.btn, ...(despesas.value > 0 ? {} : S.btnOff) }} onClick={() => despesas.value > 0 && setStep(3)}>Continuar →</button>
              <button style={S.btnGhost} onClick={() => setStep(1)}>← Voltar</button>
            </div>
          )}

          {/* STEP 3 — TICKET */}
          {step === 3 && (
            <div style={S.card}>
              <h2 style={{ margin: "0 0 6px", fontSize: "20px", fontWeight: "800", color: "#1a1a1a" }}>Quanto você cobra por {nichoData.vendas === "vendas" ? "venda" : nichoData.vendas.slice(0, -1)}? 🛍️</h2>
              <p style={{ margin: "0 0 20px", color: "#888", fontSize: "14px" }}>O valor médio que você recebe por {nichoData.vendas === "atendimentos" ? "atendimento" : nichoData.vendas === "sessões" ? "sessão" : nichoData.vendas === "aulas" ? "aula" : "venda/serviço"}.</p>
              <div style={{ position: "relative", marginBottom: "12px" }}>
                <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontWeight: "700", color: "#888", fontFamily: "'Space Grotesk', sans-serif" }}>R$</span>
                <input type="text" inputMode="numeric" value={ticket.display} onChange={ticket.handleChange} placeholder="0,00" style={S.input}
                  onFocus={e => e.target.style.borderColor = "#FF6B35"}
                  onBlur={e => e.target.style.borderColor = "#eee"} />
              </div>
              <div style={{ background: "#f0f9ff", borderRadius: "12px", padding: "12px 14px", marginBottom: "20px" }}>
                <p style={{ margin: 0, fontSize: "12px", color: "#0369a1", fontWeight: "600" }}>📊 Referência para {nichoData.label}: ticket médio de <strong>{fmt(nichoData.ticketRef)}</strong> no mercado.</p>
              </div>
              <button style={{ ...S.btn, ...(ticket.value > 0 ? {} : S.btnOff) }} onClick={() => ticket.value > 0 && setStep(4)}>Continuar →</button>
              <button style={S.btnGhost} onClick={() => setStep(2)}>← Voltar</button>
            </div>
          )}

          {/* STEP 4 — MARGEM */}
          {step === 4 && (
            <div style={S.card}>
              <h2 style={{ margin: "0 0 6px", fontSize: "20px", fontWeight: "800", color: "#1a1a1a" }}>Qual lucro você quer ter? 📈</h2>
              <p style={{ margin: "0 0 20px", color: "#888", fontSize: "14px" }}>A margem que quer guardar depois de pagar tudo.</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
                {[10, 20, 30, 40, 50].map(m => (
                  <Tag key={m} active={margem === m} onClick={() => setMargem(m)}>{m}%</Tag>
                ))}
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
          {step === 6 && result && !showPro && (
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

              {/* Meta principal */}
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
                {result.ticketVsRef < -20 && <Insight icon="⚠️" type="warning" text={`Seu ticket de <strong>${fmt(ticket.value)}</strong> está <strong>${Math.abs(Math.round(result.ticketVsRef))}% abaixo</strong> da média de ${nichoData.label} (${fmt(nichoData.ticketRef)}). Aumentar o preço pode reduzir muito a carga de trabalho.`} />}
                {result.ticketVsRef >= 0 && <Insight icon="✅" type="success" text={`Seu ticket está <strong>${Math.round(result.ticketVsRef)}% acima</strong> da média do mercado. Boa precificação!`} />}
                {result.margemVsRef < -10 && <Insight icon="📉" type="warning" text={`Margem de <strong>${margem}%</strong> está abaixo da referência de ${nichoData.label} (<strong>${nichoData.margemRef}%</strong>). Revise seus custos ou reajuste preços.`} />}
                {result.margemVsRef >= 0 && <Insight icon="💚" type="success" text={`Margem de <strong>${margem}%</strong> está acima da média do segmento. Continue assim!`} />}
                {result.vendasDia > 6 && <Insight icon="🔴" type="danger" text={`<strong>${result.vendasDia} ${nichoData.vendas} por dia</strong> é uma carga muito alta. Considere aumentar o ticket ou reduzir despesas.`} />}
                {result.vendasDia <= 3 && <Insight icon="🎯" type="success" text={`Apenas <strong>${result.vendasDia} ${nichoData.vendas} por dia</strong>. Meta bastante alcançável!`} />}
              </div>

              {/* Cenários */}
              <div style={S.card}>
                <h3 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: "800", color: "#1a1a1a" }}>🔄 E se você mudasse algo?</h3>
                <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#888" }}>Veja como pequenas mudanças impactam sua meta:</p>
                <div style={{ background: "#f8f8f8", borderRadius: "14px", padding: "14px", marginBottom: "10px" }}>
                  <p style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: "700", color: "#333" }}>💰 Se aumentar o ticket em 20%</p>
                  <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>Ticket: {fmt(result.ticketPlus20)} → precisaria de apenas <strong style={{ color: "#FF6B35" }}>{result.vendasComTicketMaior} {nichoData.vendas}/mês</strong> ({result.economiaVendas} a menos)</p>
                </div>
                <div style={{ background: "#f8f8f8", borderRadius: "14px", padding: "14px" }}>
                  <p style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: "700", color: "#333" }}>📅 Se trabalhar +5 dias/mês</p>
                  <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>Com {result.diasPlus5} dias úteis → <strong style={{ color: "#FF6B35" }}>{result.vendasComMaisDias} {nichoData.vendas}/dia</strong> (vs {result.vendasDia} atual)</p>
                </div>
              </div>

              {/* CTA Pro */}
              <div style={S.card}>
                <div style={{ textAlign: "center", marginBottom: "16px" }}>
                  <p style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: "700", color: "#888" }}>Quer ir mais fundo?</p>
                  <h3 style={{ margin: "0 0 4px", fontSize: "18px", fontWeight: "800", color: "#1a1a1a" }}>Versão Completa 🚀</h3>
                  <p style={{ margin: 0, fontSize: "28px", fontWeight: "800", color: "#FF6B35", fontFamily: "'Space Grotesk', sans-serif" }}>R$47 <span style={{ fontSize: "14px", color: "#aaa", fontWeight: "500" }}>único</span></p>
                </div>
                {["📊 Compare até 3 cenários lado a lado", "💾 Salve e acesse seu histórico", "📄 Exporte relatório completo em PDF", "🎯 Calculadora de reajuste de preço", "📈 Projeção de crescimento em 6 meses", "🔔 Alerta de meta diária via WhatsApp"].map(f => (
                  <div key={f} style={{ fontSize: "13px", fontWeight: "600", color: "#333", marginBottom: "8px" }}>{f}</div>
                ))}
                <button style={{ ...S.btn, marginTop: "16px" }} onClick={() => setShowPro(true)}>Quero acesso completo →</button>
                <button style={S.btnGhost} onClick={() => setStep(1)}>Refazer com outros números</button>
              </div>
            </>
          )}

          {/* PRO PAGE */}
          {showPro && (
            <div style={S.card}>
              <div style={{ textAlign: "center", padding: "16px 0 24px" }}>
                <div style={{ fontSize: "56px", marginBottom: "12px" }}>🔓</div>
                <h2 style={{ margin: "0 0 8px", fontSize: "22px", fontWeight: "800", color: "#1a1a1a" }}>Acesso Vitalício</h2>
                <p style={{ margin: "0 0 4px", fontSize: "14px", color: "#888" }}>Pague uma vez, use para sempre</p>
                <p style={{ margin: "8px 0 0", fontSize: "48px", fontWeight: "800", color: "#FF6B35", fontFamily: "'Space Grotesk', sans-serif" }}>R$47</p>
              </div>
              <button style={S.btn} onClick={() => window.open('https://pay.kiwify.com.br/oi816Px', '_blank')}>Pagar com Pix ou Cartão</button>

              <button style={S.btnGhost} onClick={() => setShowPro(false)}>← Voltar ao resultado</button>
              <p style={{ textAlign: "center", fontSize: "11px", color: "#bbb", marginTop: "12px" }}>Pagamento seguro · Acesso imediato</p>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
