import type { Metadata } from 'next'
import Link from "next/link";

export const metadata: Metadata = {
  title: 'About',
  description: 'Chartered Accountant turned equity researcher. Learn about Aadith Santosh\'s background, valuation philosophy, and approach to independent research on Indian listed companies.',
  openGraph: {
    title: 'About Aadith Santosh',
    description: 'Chartered Accountant turned equity researcher. Valuation philosophy, research approach, and long-term goals in finance.',
  },
}



export default function AboutPage() {

  return (

    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-[54px] pb-[86px]">

      {/* Hero */}

      <section className="pb-[38px] border-b border-line max-w-[760px]">

        <p className="text-accent font-extrabold text-[0.78rem] tracking-[0.08em] uppercase mb-4">
          About
        </p>

        <div className="w-10 h-[3px] bg-accent rounded-full mb-5" />

        <h1 className="text-[clamp(1.9rem,3.5vw,2.8rem)] font-bold text-ink leading-[1.1] tracking-tight mb-5">
          Independent research shaped by financial analysis and real-world business exposure.
        </h1>

        <p className="text-[clamp(1rem,1.5vw,1.15rem)] text-[#34445e] leading-relaxed">
          I publish equity research reports focused on business quality, valuation discipline, and 12 to 18 month investment views.
        </p>

      </section>



      {/* Content grid */}

      <section className="grid lg:grid-cols-[1fr_320px] gap-[42px] pt-[42px] max-lg:grid-cols-1">

        <article className="max-w-[760px] text-justify">

          <h2 className="text-2xl font-bold text-ink mt-14 pt-10 mb-4 border-t border-line">Who I Am</h2>

          <p className="mb-4 leading-relaxed text-muted">

            I am Aadith Santosh, a Chartered Accountant based in Coimbatore with a deep interest in how businesses create, sustain, and unlock value. Finance has fascinated me for as long as I can remember  not just the numbers, but the stories behind them, the decisions that shape them, and the assumptions that drive them.

          </p>

          <p className="mb-4 leading-relaxed text-muted">

            My curiosity really took shape during my articleship. When you work closely with companies, you quickly realise that the surface rarely tells the full story. A client might say they are facing a revenue leakage, but two hours into discussions, patterns start emerging: cash flow mismatches, operational bottlenecks, and behavioural blind spots. I found myself forming hypotheses, connecting dots, and using professional judgement to understand what was really happening beneath the explanations. More often than not, those instincts were right.

          </p>

          <p className="mb-4 leading-relaxed text-muted">

            That experience made me want to explore the other side of the table  not just auditing numbers, but understanding how businesses are perceived, valued, and priced by the market. Equity research became the natural extension of that curiosity. It allows me to combine structured financial analysis with the intuition I have built from real-world exposure.

          </p>



          <h2 className="text-2xl font-bold text-ink mt-14 pt-10 mb-4 border-t border-line">Research Philosophy</h2>

          <p className="mb-4 leading-relaxed text-muted">

            Today, I focus on analysing companies across hospitality, technology, and manufacturing  sectors that are shaping India's next decade of growth. My goal is to build a body of work that reflects disciplined valuation thinking, clear communication, and a genuine interest in how businesses operate.

          </p>

          <p className="mb-4 leading-relaxed text-muted">

            This website is where I publish my independent research. It is a space for me to learn, refine my thinking, and share insights openly. Over time, I hope it becomes a meaningful archive of my journey in finance, one report at a time.

          </p>



          <h2 className="text-2xl font-bold text-ink mt-14 pt-10 mb-4 border-t border-line">Valuation Approach</h2>

          <p className="mb-4 leading-relaxed text-muted">

            Valuation, to me, is the intersection of numbers, judgement, and context. It is not just about arriving at a price. It is about understanding the story behind a business, the assumptions that drive its future, and the risks that shape its trajectory. My approach combines structured financial modelling with the intuition I built from working closely with companies during my articleship.

          </p>

          <p className="mb-4 leading-relaxed text-muted">

            Over time, I have developed a framework that balances intrinsic value, market expectations, and sector dynamics.

          </p>



          <div className="mt-8 space-y-4">
            {[
              {
                num: "01",
                title: "Cash-Flow Based Intrinsic Value",
                body: "I start with a discounted cash flow model because it forces me to think through the fundamentals: how the business generates cash, what drives margins, how sustainable growth is, and what risks deserve a higher discount rate. I use conservative assumptions, especially around WACC and terminal growth, because real businesses rarely move in straight lines.",
              },
              {
                num: "02",
                title: "Market-Based Valuation",
                body: "Markets do not price companies on intrinsic value alone. Sentiment, sector cycles, competitive positioning, and brand strength all influence how investors value a business. I complement DCF work with EV/EBITDA for capital-intensive sectors, P/E for stable earnings-driven businesses, EV/Sales for high-growth companies, and sector-specific metrics like RevPAR or ARPU when relevant.",
              },
              {
                num: "03",
                title: "Blended Valuation",
                body: "I rarely rely on a single method. Instead, I blend intrinsic and market-based valuations with weights that reflect the nature of the business — higher weight to EV/EBITDA for hotels, growth-adjusted multiples for technology, and a balance of DCF and earnings multiples for manufacturing.",
              },
              {
                num: "04",
                title: "Scenario Analysis",
                body: "Businesses do not operate in a single straight-line forecast. I test assumptions through bear, base, and bull cases so the valuation captures a range of outcomes rather than a single midpoint.",
              },
              {
                num: "05",
                title: "Professional Judgement & Real-World Context",
                body: "Numbers tell a story, but they do not tell the whole story. My experience working with companies taught me that management explanations can be incomplete and patterns reveal themselves when you listen carefully. That intuition shapes how I interpret data and refine assumptions.",
              },
              {
                num: "06",
                title: "Transparency and Consistency",
                body: "Every valuation I publish follows the same principles: clear assumptions, conservative bias, sector-aware multiples, transparent methodology, and balanced interpretation. My goal is not to predict stock prices — it is to understand businesses better and communicate that understanding clearly.",
              },
            ].map(({ num, title, body }) => (
              <div key={num} className="flex gap-5 p-5 rounded-lg border border-line bg-panel/60 hover:border-accent/40 transition-colors">
                <span className="text-[1.1rem] font-extrabold text-accent/60 tabular-nums shrink-0 mt-0.5">{num}</span>
                <div>
                  <h3 className="text-[1rem] font-bold text-ink mb-1.5">{title}</h3>
                  <p className="text-muted leading-relaxed text-[0.95rem]">{body}</p>
                </div>
              </div>
            ))}
          </div>



          <h2 className="text-2xl font-bold text-ink mt-14 pt-10 mb-4 border-t border-line">Long-Term Goal</h2>

          <p className="mb-4 leading-relaxed text-muted">

            My long-term goal is to build a career where I can work closely with businesses, understand their challenges, and contribute meaningfully to the decisions that shape their future. I have always been drawn to the intersection of strategy, finance, and real-world execution  the space where numbers meet judgement, and where the right insight at the right time can change the trajectory of an entire organisation.

          </p>

          <p className="mb-4 leading-relaxed text-muted">

            As a Chartered Accountant, I have had the opportunity to see how companies operate from the inside. Those experiences made me realise how much value there is in clear thinking, disciplined analysis, and the ability to interpret financial signals before they become visible outcomes. Over the years, I have become increasingly interested in roles that allow me to apply that kind of thinking at scale, whether it is evaluating investments, analysing industries, or helping businesses navigate complex decisions.

          </p>

          <p className="mb-4 leading-relaxed text-muted">

            In the long run, I want to deepen my expertise across sectors like hospitality, technology, and manufacturing, and build a body of work that reflects both analytical rigour and practical understanding. This website is one step in that direction  a place to document my research, refine my perspective, and grow as a professional in the world of finance.

          </p>

          <blockquote className="mt-8 pl-5 border-l-[3px] border-accent">
            <p className="text-ink font-semibold italic text-[1.05rem] leading-relaxed">
              "The space where numbers meet judgement — where the right insight at the right time can change the trajectory of an entire organisation."
            </p>
          </blockquote>

        </article>



        <aside className="border border-line rounded-lg bg-panel/70 shadow-[0_18px_50px_rgba(2,26,62,0.08)] p-6 self-start sticky top-[88px] max-lg:static">

          {/* Profile card */}
          <div className="flex items-center gap-4 pb-5 mb-5 border-b border-line">
            <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center shrink-0">
              <span className="text-paper font-extrabold text-lg leading-none">AS</span>
            </div>
            <div>
              <p className="font-bold text-ink text-[0.95rem] leading-tight">Aadith Santosh</p>
              <p className="text-muted text-[0.8rem] mt-0.5">Chartered Accountant</p>
              <p className="text-muted text-[0.8rem]">Coimbatore, India</p>
            </div>
          </div>

          <h2 className="text-lg font-bold text-ink mb-4">Research Lens</h2>

          <ul className="m-0 p-0 list-none">

            {["Business quality", "Industry structure", "Financial durability", "Valuation discipline", "Risk clarity"].map((item) => (

              <li key={item} className="flex items-center gap-3 py-[11px] border-b border-line text-muted last:border-0">
                <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                {item}
              </li>

            ))}

          </ul>

          <div className="mt-[22px] space-y-2">

            <Link

              href="/research"

              className="block w-full text-center min-h-[46px] leading-[46px] px-[18px] border border-ink bg-ink text-paper rounded-lg font-extrabold text-[0.95rem] hover:-translate-y-0.5 transition-all"

            >

              View Research

            </Link>

            <a

              href="mailto:aadithsantosh@outlook.com"

              className="block w-full text-center min-h-[46px] leading-[46px] px-[18px] border border-ink text-ink rounded-lg font-extrabold text-[0.95rem] hover:-translate-y-0.5 transition-all"

            >

              Email Aadith

            </a>

            <a

              href="https://www.linkedin.com/in/aadith-santosh-8b3b07204"

              target="_blank"

              rel="noopener noreferrer"

              className="block w-full text-center min-h-[46px] leading-[46px] px-[18px] border border-ink text-ink rounded-lg font-extrabold text-[0.95rem] hover:-translate-y-0.5 transition-all"

            >

              LinkedIn

            </a>

          </div>

        </aside>

      </section>

    </div>

  );

}






