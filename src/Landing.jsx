import { useNavigate } from "react-router-dom";

const Section = ({ children, bg = "#fff", id }) => (
  <section id={id} style={{ background: bg, padding: "60px 20px" }}>
    <div style={{ maxWidth: "680px", margin: "0 auto" }}>{children}</div>
  </section>
);

const CTA = ({ text = "Testar grátis agora →", onClick }) => (
  <button onClick={onClick} style={{
    width: "100%", maxWidth: "400px", padding: "18px 24px",
    background: "linear-gradient(135deg, #FF6B35, #ff8c42)", color: "#fff",
    border: "none", borderRadius: "16px", fontSize: "17px", fontWeight: "800",
    cursor: "pointer", fontFamily: "'Sora', sans-serif",
    boxShadow: "0 4px 24px rgba(255,107,53,0.4)",
    transition: "transform 0.2s",
    display: "block", margin: "0 auto"
  }}
    onMouseEnter={e => e.target.style.transform = "scale(1.03)"}
    onMouseLeave={e => e.target.style.transform = "scale(1)"}
  >{text}</button>
);

const Check = ({ children }) => (
  <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "16px" }}>
    <span style={{ fontSize: "20px", lineHeight: 1 }}>✅</span>
    <span style={{ fontSize: "15px", fontWeight: "600", color: "#333", lineHeight: 1.6 }}>{children}</span>
  </div>
);

const FAQ = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid #eee", padding: "16px 0" }}>
      <div onClick={() => setOpen(!open)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
        <p style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#1a1a1a" }}>{q}</p>
        <span style={{ fontSize: "20px", color: "#FF6B35", transform: open ? "rotate(45deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>+</span>
      </div>
      {open && <p style={{ margin: "12px 0 0", fontSize: "14px", color: "#666", lineHeight: 1.7 }}>{a}</p>}
    </div>
  );
};

import { useState } from "react";

export default function Landing() {
  const navigate = useNavigate();
  const goApp = () => navigate("/app");

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Space+Grotesk:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <div style={{ fontFamily: "'Sora', sans-serif", color: "#1a1a1a" }}>

        {/* HERO */}
        <Section bg="linear-gradient(160deg, #0f0f0f 0%, #1a1205 100%)">
          <div style={{ textAlign: "center", padding: "40px 0 20px" }}>
            <p style={{ margin: "0 0 12px", fontSize: "13px", fontWeight: "700", color: "#FF6B35", letterSpacing: "0.12em", textTransform: "uppercase" }}>BusinessOne · Consultor Financeiro</p>
            <h1 style={{ margin: "0 0 20px", fontSize: "32px", fontWeight: "800", color: "#fff", lineHeight: 1.25 }}>
              Você sabe <span style={{ color: "#FF6B35" }}>exatamente</span> quanto precisa vender por dia?
            </h1>
            <p style={{ margin: "0 0 32px", fontSize: "16px", color: "rgba(255,255,255,0.7)", lineHeight: 1.7, maxWidth: "500px", marginLeft: "auto", marginRight: "auto" }}>
              A maioria dos empreendedores trabalha no escuro — sem saber se o esforço do dia está sendo suficiente. Descubra sua meta real em 2 minutos com um diagnóstico personalizado pro seu negócio.
            </p>
            <CTA text="Fazer meu diagnóstico grátis →" onClick={goApp} />
            <p style={{ margin: "16px 0 0", fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>Gratuito · Sem cadastro · Resultado imediato</p>
          </div>
        </Section>

        {/* PROBLEMA */}
        <Section bg="#fff">
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <p style={{ margin: "0 0 8px", fontSize: "12px", fontWeight: "700", color: "#ef4444", letterSpacing: "0.1em", textTransform: "uppercase" }}>O problema</p>
            <h2 style={{ margin: 0, fontSize: "26px", fontWeight: "800", color: "#1a1a1a", lineHeight: 1.3 }}>Você está trabalhando muito e lucrando pouco?</h2>
          </div>
          {[
            ["😰", "Não sabe se o faturamento do mês vai cobrir as contas"],
            ["📉", "Trabalha todos os dias mas o dinheiro nunca sobra"],
            ["🤷", "Não tem clareza de quantas vendas precisa fazer por dia"],
            ["💸", "Define preços no achismo, sem saber se está deixando dinheiro na mesa"],
            ["😓", "Sente que está se esforçando demais pra um resultado que não aparece"],
          ].map(([emoji, text]) => (
            <div key={text} style={{ display: "flex", gap: "14px", alignItems: "center", marginBottom: "16px", background: "#fef2f2", borderRadius: "14px", padding: "14px 16px" }}>
              <span style={{ fontSize: "24px" }}>{emoji}</span>
              <span style={{ fontSize: "14px", fontWeight: "600", color: "#333" }}>{text}</span>
            </div>
          ))}
          <p style={{ textAlign: "center", margin: "24px 0 0", fontSize: "15px", color: "#666", lineHeight: 1.7 }}>
            Se você se identificou com pelo menos uma dessas frases, o <strong>BusinessOne</strong> foi feito pra você.
          </p>
        </Section>

        {/* SOLUÇÃO */}
        <Section bg="#fafafa">
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <p style={{ margin: "0 0 8px", fontSize: "12px", fontWeight: "700", color: "#22c55e", letterSpacing: "0.1em", textTransform: "uppercase" }}>A solução</p>
            <h2 style={{ margin: 0, fontSize: "26px", fontWeight: "800", color: "#1a1a1a", lineHeight: 1.3 }}>Seu consultor financeiro de bolso</h2>
          </div>
          <p style={{ textAlign: "center", fontSize: "15px", color: "#666", lineHeight: 1.7, marginBottom: "32px" }}>
            O BusinessOne analisa seus números reais — despesas, ticket médio e margem — e te entrega um diagnóstico completo com metas claras e acionáveis.
          </p>
          {[
            ["🎯", "Meta diária, semanal e mensal", "Sabe exatamente quanto precisa vender cada dia pra pagar as contas E ter lucro."],
            ["📊", "Diagnóstico do seu segmento", "Compara seu ticket e margem com a média do mercado no seu nicho."],
            ["💡", "Insights personalizados", "Recebe alertas e sugestões baseados nos seus números reais."],
            ["🔄", "Simulação de cenários", "Veja o que acontece se aumentar o preço, trabalhar mais dias ou mudar a margem."],
          ].map(([emoji, title, desc]) => (
            <div key={title} style={{ background: "#fff", borderRadius: "16px", padding: "20px", marginBottom: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "24px" }}>{emoji}</span>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#1a1a1a" }}>{title}</h3>
              </div>
              <p style={{ margin: 0, fontSize: "14px", color: "#666", lineHeight: 1.6, paddingLeft: "36px" }}>{desc}</p>
            </div>
          ))}
          <div style={{ marginTop: "32px" }}>
            <CTA text="Quero descobrir minha meta →" onClick={goApp} />
          </div>
        </Section>

        {/* COMO FUNCIONA */}
        <Section bg="#fff">
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <p style={{ margin: "0 0 8px", fontSize: "12px", fontWeight: "700", color: "#3b82f6", letterSpacing: "0.1em", textTransform: "uppercase" }}>Como funciona</p>
            <h2 style={{ margin: 0, fontSize: "26px", fontWeight: "800", color: "#1a1a1a", lineHeight: 1.3 }}>3 passos, 2 minutos</h2>
          </div>
          {[
            ["1️⃣", "Escolha seu segmento", "Selecione o tipo do seu negócio. Isso personaliza os benchmarks e a linguagem do resultado."],
            ["2️⃣", "Informe seus números", "Despesas mensais, ticket médio e margem desejada. Simples e direto."],
            ["3️⃣", "Receba seu diagnóstico", "Meta diária, score financeiro, insights e simulações — tudo na hora."],
          ].map(([num, title, desc]) => (
            <div key={title} style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
              <span style={{ fontSize: "32px" }}>{num}</span>
              <div>
                <h3 style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: "800", color: "#1a1a1a" }}>{title}</h3>
                <p style={{ margin: 0, fontSize: "14px", color: "#666", lineHeight: 1.6 }}>{desc}</p>
              </div>
            </div>
          ))}
        </Section>

        {/* PRO FEATURES */}
        <Section bg="linear-gradient(160deg, #0f0f0f 0%, #1a1205 100%)">
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <span style={{ background: "linear-gradient(135deg, #FF6B35, #ff8c42)", color: "#fff", fontSize: "12px", fontWeight: "800", padding: "6px 14px", borderRadius: "8px", letterSpacing: "0.05em" }}>VERSÃO COMPLETA</span>
            <h2 style={{ margin: "16px 0 8px", fontSize: "26px", fontWeight: "800", color: "#fff", lineHeight: 1.3 }}>Vá além do diagnóstico básico</h2>
            <p style={{ margin: 0, fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>Ferramentas avançadas pra quem quer levar o negócio a sério.</p>
          </div>
          {[
            ["📊", "Comparador de cenários", "Teste até 3 cenários lado a lado — mude ticket, margem e dias úteis e veja o impacto na hora."],
            ["📄", "Relatório em PDF", "Baixe um relatório profissional com todos os dados do seu diagnóstico pra consultar ou mostrar pro sócio."],
            ["🎯", "Calculadora de reajuste", "Descubra exatamente quantas vendas a menos você precisa se aumentar o preço em 10%, 20%, 50%..."],
            ["📈", "Projeção de 6 meses", "Veja como um reajuste gradual de preço melhora sua vida mês a mês, reduzindo a carga de trabalho."],
            ["⚖️", "Ponto de equilíbrio", "Saiba o mínimo de vendas pra cobrir seus custos — e quantas vendas acima disso geram lucro puro."],
            ["📱", "Resumo compartilhável", "Gere um resumo pronto pra enviar por WhatsApp ou postar nas redes sociais."],
          ].map(([emoji, title, desc]) => (
            <div key={title} style={{ background: "rgba(255,255,255,0.05)", borderRadius: "16px", padding: "18px", marginBottom: "10px", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "6px" }}>
                <span style={{ fontSize: "22px" }}>{emoji}</span>
                <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#fff" }}>{title}</h3>
              </div>
              <p style={{ margin: 0, fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: 1.6, paddingLeft: "34px" }}>{desc}</p>
            </div>
          ))}
        </Section>

        {/* PREÇO */}
        <Section bg="#fff">
          <div style={{ textAlign: "center" }}>
            <p style={{ margin: "0 0 8px", fontSize: "12px", fontWeight: "700", color: "#FF6B35", letterSpacing: "0.1em", textTransform: "uppercase" }}>Investimento</p>
            <h2 style={{ margin: "0 0 24px", fontSize: "26px", fontWeight: "800", color: "#1a1a1a" }}>Quanto custa ter clareza financeira?</h2>
          </div>

          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
            {/* Free */}
            <div style={{ background: "#fafafa", borderRadius: "20px", padding: "24px", flex: "1 1 280px", maxWidth: "320px", border: "2px solid #eee" }}>
              <p style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: "700", color: "#888" }}>Versão Gratuita</p>
              <p style={{ margin: "0 0 16px", fontSize: "36px", fontWeight: "800", color: "#1a1a1a", fontFamily: "'Space Grotesk'" }}>R$0</p>
              <Check>Diagnóstico básico</Check>
              <Check>Meta diária e mensal</Check>
              <Check>Score financeiro</Check>
              <Check>2 simulações simples</Check>
              <button onClick={goApp} style={{
                width: "100%", padding: "14px", background: "transparent", color: "#333",
                border: "2px solid #ddd", borderRadius: "14px", fontSize: "14px",
                fontWeight: "700", cursor: "pointer", fontFamily: "'Sora', sans-serif", marginTop: "8px"
              }}>Começar grátis</button>
            </div>

            {/* Pro */}
            <div style={{ background: "#fff", borderRadius: "20px", padding: "24px", flex: "1 1 280px", maxWidth: "320px", border: "2px solid #FF6B35", position: "relative", boxShadow: "0 8px 40px rgba(255,107,53,0.15)" }}>
              <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg, #FF6B35, #ff8c42)", color: "#fff", fontSize: "11px", fontWeight: "800", padding: "4px 14px", borderRadius: "8px" }}>MAIS POPULAR</div>
              <p style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: "700", color: "#FF6B35" }}>Versão Completa</p>
              <p style={{ margin: "0 0 4px", fontSize: "36px", fontWeight: "800", color: "#1a1a1a", fontFamily: "'Space Grotesk'" }}>R$47</p>
              <p style={{ margin: "0 0 16px", fontSize: "12px", color: "#888" }}>Pagamento único · Acesso vitalício</p>
              <Check>Tudo da versão gratuita</Check>
              <Check>Comparador de 3 cenários</Check>
              <Check>Relatório PDF profissional</Check>
              <Check>Calculadora de reajuste</Check>
              <Check>Projeção de 6 meses</Check>
              <Check>Ponto de equilíbrio</Check>
              <Check>Resumo compartilhável</Check>
              <button onClick={() => window.open('https://pay.kiwify.com.br/oi816Px', '_blank')} style={{
                width: "100%", padding: "14px", background: "linear-gradient(135deg, #FF6B35, #ff8c42)", color: "#fff",
                border: "none", borderRadius: "14px", fontSize: "15px",
                fontWeight: "800", cursor: "pointer", fontFamily: "'Sora', sans-serif", marginTop: "8px",
                boxShadow: "0 4px 20px rgba(255,107,53,0.4)"
              }}>Quero acesso completo →</button>
            </div>
          </div>
        </Section>

        {/* FAQ */}
        <Section bg="#fafafa">
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <h2 style={{ margin: 0, fontSize: "26px", fontWeight: "800", color: "#1a1a1a" }}>Perguntas frequentes</h2>
          </div>
          <FAQ q="A calculadora é realmente gratuita?" a="Sim! O diagnóstico básico com meta diária, score financeiro e insights é 100% gratuito, sem cadastro. A versão completa com ferramentas avançadas é R$47 (pagamento único)." />
          <FAQ q="Funciona pra qualquer tipo de negócio?" a="Sim. Temos benchmarks personalizados pra 8 segmentos diferentes: beleza, saúde, educação, consultoria, alimentação, varejo, serviços gerais e outros. Se seu nicho não estiver na lista, use 'Outro segmento'." />
          <FAQ q="O que eu recebo ao pagar R$47?" a="Acesso vitalício a todas as ferramentas PRO: comparador de cenários, relatório PDF, calculadora de reajuste, projeção de 6 meses, ponto de equilíbrio e resumo compartilhável." />
          <FAQ q="Como funciona o acesso?" a="Após o pagamento, você recebe um código de acesso por email. Basta digitar o código na calculadora e todas as ferramentas PRO são desbloqueadas instantaneamente." />
          <FAQ q="O acesso expira?" a="Não. O pagamento é único e o acesso é vitalício. Use quantas vezes quiser, pra sempre." />
          <FAQ q="Posso usar no celular?" a="Sim! A ferramenta é totalmente responsiva e funciona perfeitamente no celular, tablet e computador." />
        </Section>

        {/* CTA FINAL */}
        <Section bg="linear-gradient(160deg, #0f0f0f 0%, #1a1205 100%)">
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <h2 style={{ margin: "0 0 12px", fontSize: "26px", fontWeight: "800", color: "#fff", lineHeight: 1.3 }}>Pare de trabalhar no escuro</h2>
            <p style={{ margin: "0 0 28px", fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>
              Descubra agora quanto você realmente precisa vender por dia. É grátis, leva 2 minutos e pode mudar a forma como você enxerga seu negócio.
            </p>
            <CTA text="Fazer meu diagnóstico grátis →" onClick={goApp} />
          </div>
        </Section>

        {/* FOOTER */}
        <footer style={{ background: "#0a0a0a", padding: "24px 20px", textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>© {new Date().getFullYear()} BusinessOne · Todos os direitos reservados</p>
        </footer>

      </div>
    </>
  );
}
