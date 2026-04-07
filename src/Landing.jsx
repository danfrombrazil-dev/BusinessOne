import { useNavigate } from "react-router-dom";
import { useState } from "react";

const C = { bg: "#0a0a0a", card: "#141414", accent: "#FF6B35", accent2: "#ff8c42", white: "#ffffff", gray: "#a0a0a0", green: "#22c55e", red: "#ef4444", yellow: "#eab308" };

function Section({ children, style }) {
  return <section style={{ padding: "80px 20px", maxWidth: 900, margin: "0 auto", ...style }}>{children}</section>;
}

function FAQ({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid #222", padding: "20px 0", cursor: "pointer" }} onClick={() => setOpen(!open)}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 17, fontWeight: 600, color: C.white }}>{q}</span>
        <span style={{ fontSize: 22, color: C.accent, transition: "transform .2s", transform: open ? "rotate(45deg)" : "rotate(0)" }}>+</span>
      </div>
      {open && <p style={{ marginTop: 12, color: C.gray, lineHeight: 1.7, fontSize: 15 }}>{a}</p>}
    </div>
  );
}

function Check({ children }) {
  return <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 14 }}><span style={{ color: C.green, fontSize: 20, flexShrink: 0 }}>✓</span><span style={{ color: C.gray, fontSize: 15, lineHeight: 1.6 }}>{children}</span></div>;
}

function FeatureCard({ emoji, title, desc }) {
  return (
    <div style={{ background: C.card, borderRadius: 16, padding: 28, border: "1px solid #222", flex: "1 1 260px", minWidth: 260 }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>{emoji}</div>
      <h3 style={{ color: C.white, fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{title}</h3>
      <p style={{ color: C.gray, fontSize: 14, lineHeight: 1.6, margin: 0 }}>{desc}</p>
    </div>
  );
}

function PainPoint({ emoji, text, value }) {
  return (
    <div style={{ background: "#1a0a0a", border: "1px solid #331111", borderRadius: 14, padding: 22, display: "flex", gap: 14, alignItems: "center" }}>
      <span style={{ fontSize: 28 }}>{emoji}</span>
      <div>
        <p style={{ color: C.white, fontSize: 15, margin: 0, lineHeight: 1.5 }}>{text}</p>
        {value && <p style={{ color: C.red, fontSize: 14, margin: "6px 0 0", fontWeight: 600 }}>{value}</p>}
      </div>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const goApp = () => navigate("/app");
  const goPay = () => window.open("https://pay.kiwify.com.br/oi816Px", "_blank");

  const btnStyle = { background: `linear-gradient(135deg, ${C.accent}, ${C.accent2})`, color: "#fff", border: "none", borderRadius: 14, padding: "18px 40px", fontSize: 18, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 24px rgba(255,107,53,.25)", transition: "transform .15s", display: "inline-block" };
  const btnOutline = { ...btnStyle, background: "transparent", border: `2px solid ${C.accent}`, color: C.accent, boxShadow: "none" };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Space+Grotesk:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <div style={{ fontFamily: "'Sora',sans-serif", background: C.bg, color: C.white, minHeight: "100vh", overflowX: "hidden" }}>

        {/* HERO */}
        <Section style={{ paddingTop: 100, paddingBottom: 60, textAlign: "center" }}>
          <div style={{ display: "inline-block", background: "#1a1a1a", border: "1px solid #333", borderRadius: 100, padding: "8px 20px", fontSize: 13, color: C.accent, fontWeight: 600, marginBottom: 24 }}>🎯 Consultor financeiro digital para seu negócio</div>
          <h1 style={{ fontSize: "clamp(32px, 6vw, 56px)", fontWeight: 800, lineHeight: 1.15, marginBottom: 20, fontFamily: "'Space Grotesk',sans-serif" }}>
            Descubra quanto você <span style={{ color: C.accent }}>precisa vender por dia</span> — e quanto está <span style={{ color: C.red }}>deixando na mesa</span>
          </h1>
          <p style={{ fontSize: 18, color: C.gray, maxWidth: 620, margin: "0 auto 36px", lineHeight: 1.7 }}>
            Não é uma calculadora genérica. É um diagnóstico completo que mostra exatamente onde seu negócio está perdendo dinheiro — e te dá um plano pra resolver.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={goApp} style={btnStyle} onMouseEnter={e => e.target.style.transform = "scale(1.04)"} onMouseLeave={e => e.target.style.transform = "scale(1)"}>Fazer diagnóstico grátis</button>
          </div>
          <p style={{ color: C.gray, fontSize: 13, marginTop: 16 }}>✓ Gratuito ✓ 2 minutos ✓ Sem cadastro</p>
        </Section>

        {/* DOR */}
        <Section>
          <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: "center", marginBottom: 12, fontFamily: "'Space Grotesk',sans-serif" }}>Você reconhece alguma dessas situações?</h2>
          <p style={{ color: C.gray, textAlign: "center", marginBottom: 40, fontSize: 15 }}>A maioria dos empreendedores enfrenta isso — mas poucos sabem o impacto real no bolso.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 640, margin: "0 auto" }}>
            <PainPoint emoji="😰" text="Trabalha o mês inteiro e no final mal sobra dinheiro" value="Isso geralmente indica margem abaixo do saudável" />
            <PainPoint emoji="🤷" text="Não sabe se o preço que cobra está certo" value="Preço errado pode custar R$1.000+/mês sem você perceber" />
            <PainPoint emoji="📉" text="Não tem clareza de quantas vendas precisa por dia" value="Sem meta diária, você navega no escuro" />
            <PainPoint emoji="🏃" text="Sente que trabalha muito mas o negócio não cresce" value="Pode ser problema de ticket, margem ou ociosidade" />
            <PainPoint emoji="💸" text="Tem medo de aumentar o preço e perder clientes" value="Na maioria dos nichos, reajuste de 15% não afeta volume" />
          </div>
        </Section>

        {/* SOLUÇÃO */}
        <Section>
          <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: "center", marginBottom: 12, fontFamily: "'Space Grotesk',sans-serif" }}>O BusinessOne faz o que um consultor de R$2.000 faria</h2>
          <p style={{ color: C.gray, textAlign: "center", marginBottom: 40, fontSize: 15 }}>Só que em 2 minutos, por R$47 uma vez, e sem precisar explicar nada pra ninguém.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 18 }}>
            <FeatureCard emoji="🔍" title="Diagnóstico Inteligente" desc="Analisa seu nicho, ticket, margem e despesas. Compara com benchmarks reais e mostra onde você está perdendo dinheiro." />
            <FeatureCard emoji="💰" title="Quanto Está Deixando na Mesa" desc="Calcula em reais quanto você perde por mês por preço baixo, margem errada ou horários vagos. Dói ver — mas motiva." />
            <FeatureCard emoji="📋" title="Plano de Ação Semanal" desc="4 semanas de tarefas concretas e personalizadas pro seu nicho. Não é 'aumente seu preço' — é exatamente o que fazer, como e quando." />
            <FeatureCard emoji="🧮" title="Precificação Reversa" desc="Diz quanto quer ganhar e o app calcula o preço, quantidade de clientes e horas necessárias. Seu negócio ao contrário." />
            <FeatureCard emoji="⏰" title="Calculadora de Hora Real" desc="Descubra quanto você realmente ganha por hora trabalhada. A maioria se surpreende (negativamente)." />
            <FeatureCard emoji="📊" title="Dashboard de Saúde Financeira" desc="Score de 0 a 100, semáforos por área, evolução. Uma tela que você vai querer abrir toda semana." />
          </div>
        </Section>

        {/* MAIS FERRAMENTAS */}
        <Section>
          <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: "center", marginBottom: 40, fontFamily: "'Space Grotesk',sans-serif" }}>18 ferramentas em uma só plataforma</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 18 }}>
            <FeatureCard emoji="🆚" title="Comparador CLT vs Negócio" desc="Será que compensa ser empreendedor? Veja a comparação honesta com números reais." />
            <FeatureCard emoji="🏖️" title="Calculadora de Férias" desc="Quanto precisa faturar antes pra tirar férias sem culpa." />
            <FeatureCard emoji="👥" title="Simulador de Contratação" desc="Vale contratar? Quanto precisa vender a mais pra pagar um funcionário e ainda lucrar." />
            <FeatureCard emoji="🔄" title="Comparador de Cenários" desc="Compare até 3 cenários lado a lado. Veja qual combinação de preço e volume dá mais resultado." />
            <FeatureCard emoji="📈" title="Projeção 6 Meses" desc="Veja pra onde seu negócio está indo com crescimento projetado mês a mês." />
            <FeatureCard emoji="⚖️" title="Ponto de Equilíbrio" desc="Quantas vendas precisa pra cobrir todos os custos. Abaixo disso, prejuízo." />
            <FeatureCard emoji="📄" title="Relatório PDF Profissional" desc="Baixe um relatório completo pra mostrar pro sócio, contador ou investidor." />
            <FeatureCard emoji="📝" title="Proposta Comercial" desc="Gere uma proposta bonita em PDF pra enviar aos seus clientes. Profissionalismo que fecha venda." />
            <FeatureCard emoji="📲" title="Resumo Compartilhável" desc="Compartilhe seu diagnóstico no WhatsApp com um toque." />
          </div>
        </Section>

        {/* PREÇO */}
        <Section style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12, fontFamily: "'Space Grotesk',sans-serif" }}>Quanto custa?</h2>
          <p style={{ color: C.gray, marginBottom: 48, fontSize: 16 }}>Menos que um almoço de negócios. Mais valor que uma consultoria de R$2.000.</p>
          <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap", maxWidth: 700, margin: "0 auto" }}>
            {/* Free */}
            <div style={{ background: C.card, borderRadius: 20, padding: 36, border: "1px solid #222", flex: "1 1 280px", maxWidth: 320, textAlign: "left" }}>
              <p style={{ color: C.gray, fontSize: 14, fontWeight: 600, marginBottom: 8 }}>GRATUITO</p>
              <p style={{ fontSize: 40, fontWeight: 800, marginBottom: 4, fontFamily: "'Space Grotesk',sans-serif" }}>R$0</p>
              <p style={{ color: C.gray, fontSize: 14, marginBottom: 28 }}>pra sempre</p>
              <Check>Diagnóstico básico com meta diária</Check>
              <Check>Score financeiro de 0 a 100</Check>
              <Check>Benchmarks do seu nicho</Check>
              <Check>2 simulações de cenário</Check>
              <button onClick={goApp} style={{ ...btnOutline, width: "100%", marginTop: 12 }}>Começar grátis</button>
            </div>
            {/* Pro */}
            <div style={{ background: "linear-gradient(135deg, #1a1008, #1a1410)", borderRadius: 20, padding: 36, border: `2px solid ${C.accent}`, flex: "1 1 280px", maxWidth: 320, textAlign: "left", position: "relative" }}>
              <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: C.accent, color: "#fff", fontSize: 12, fontWeight: 700, padding: "5px 18px", borderRadius: 100 }}>MAIS VENDIDO</div>
              <p style={{ color: C.accent, fontSize: 14, fontWeight: 600, marginBottom: 8 }}>COMPLETO</p>
              <p style={{ fontSize: 40, fontWeight: 800, marginBottom: 4, fontFamily: "'Space Grotesk',sans-serif" }}>R$47</p>
              <p style={{ color: C.gray, fontSize: 14, marginBottom: 28 }}>pagamento único · acesso vitalício</p>
              <Check>Tudo do plano gratuito</Check>
              <Check>18 ferramentas completas</Check>
              <Check>Plano de ação de 30 dias personalizado</Check>
              <Check>Calculadora "quanto deixo na mesa"</Check>
              <Check>Proposta comercial em PDF</Check>
              <Check>Diagnóstico inteligente com receitas</Check>
              <Check>Atualizações futuras incluídas</Check>
              <button onClick={goPay} style={{ ...btnStyle, width: "100%", marginTop: 12 }}>Quero acesso completo</button>
            </div>
          </div>
        </Section>

        {/* GARANTIA */}
        <Section style={{ textAlign: "center" }}>
          <div style={{ background: "#0a1a0a", border: "1px solid #1a3a1a", borderRadius: 20, padding: 40, maxWidth: 600, margin: "0 auto" }}>
            <span style={{ fontSize: 48 }}>🛡️</span>
            <h3 style={{ fontSize: 22, fontWeight: 700, marginTop: 16, marginBottom: 12 }}>Garantia de 7 dias</h3>
            <p style={{ color: C.gray, fontSize: 15, lineHeight: 1.7 }}>Se em 7 dias você sentir que o BusinessOne não valeu cada centavo, devolvemos 100% do seu dinheiro. Sem perguntas, sem burocracia.</p>
          </div>
        </Section>

        {/* FAQ */}
        <Section>
          <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: "center", marginBottom: 40, fontFamily: "'Space Grotesk',sans-serif" }}>Perguntas frequentes</h2>
          <div style={{ maxWidth: 640, margin: "0 auto" }}>
            <FAQ q="Funciona pra qualquer tipo de negócio?" a="Sim. O BusinessOne tem benchmarks para 8 segmentos: beleza, saúde, educação, consultoria, alimentação, varejo, serviços e outros. O diagnóstico se adapta ao seu nicho." />
            <FAQ q="Preciso instalar alguma coisa?" a="Não. Funciona 100% no navegador, no celular ou computador. Basta acessar o link." />
            <FAQ q="O pagamento é mensal?" a="Não. É pagamento único de R$47. Você paga uma vez e tem acesso vitalício, incluindo atualizações futuras." />
            <FAQ q="Como recebo o acesso?" a="Imediatamente após o pagamento, você recebe um código de acesso por e-mail. Basta digitar o código no app e todas as ferramentas PRO são desbloqueadas na hora." />
            <FAQ q="E se eu não gostar?" a="Sem problema. Você tem 7 dias de garantia incondicional. Devolvemos 100% do valor sem perguntas." />
            <FAQ q="Consigo ver alguma coisa antes de pagar?" a="Sim! O diagnóstico básico é 100% gratuito. Você vê sua meta diária, score financeiro e benchmarks sem pagar nada. O plano completo desbloqueia as 18 ferramentas." />
          </div>
        </Section>

        {/* CTA FINAL */}
        <Section style={{ textAlign: "center", paddingBottom: 40 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16, fontFamily: "'Space Grotesk',sans-serif" }}>Pronto pra descobrir quanto seu negócio <span style={{ color: C.accent }}>realmente</span> precisa faturar?</h2>
          <p style={{ color: C.gray, fontSize: 16, marginBottom: 36, maxWidth: 500, margin: "0 auto 36px" }}>2 minutos. Sem cadastro. Diagnóstico na hora.</p>
          <button onClick={goApp} style={btnStyle} onMouseEnter={e => e.target.style.transform = "scale(1.04)"} onMouseLeave={e => e.target.style.transform = "scale(1)"}>Começar agora — é grátis</button>
        </Section>

        {/* FOOTER */}
        <footer style={{ borderTop: "1px solid #1a1a1a", padding: "30px 20px", textAlign: "center" }}>
          <p style={{ color: "#444", fontSize: 13 }}>BusinessOne © 2025 · Todos os direitos reservados</p>
        </footer>
      </div>
    </>
  );
}
