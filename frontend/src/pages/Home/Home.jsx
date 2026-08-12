import Header from "../../components/Header/Header";
import "./Home.css";

export default function Home() {
  return (
    <>
      <Header />

      <main>
        {/* HERO */}
        <section className="hero">
          <div className="hero__overlay" />
          <div className="container hero__content">
            <div className="hero__tags">
              <span className="hero__tag">Desde 2012</span>
              <span className="hero__tag">Centro do Rio</span>
            </div>

            <h1 className="hero__title">
              Boteco
              <span className="hero__title--accent">do Hudson</span>
            </h1>

            <p className="hero__subtitle">
              Churrasco na brasa, pagode alto e mesa que nunca fica vazia.
            </p>

            <div className="hero__actions">
              <a href="/reservar" className="btn btn--primary">
                Reservar minha mesa
              </a>
              <a href="/cardapio" className="btn btn--ghost">
                Ver cardápio
              </a>
            </div>
          </div>
        </section>

        {/* A CASA */}
        <section className="about container">
          <span className="eyebrow">A Casa</span>
          <h2 className="about__title">Uma história contada na brasa.</h2>
          <div className="about__grid">
            <p className="about__text">
              Hudson abriu a primeira porta com uma churrasqueira emprestada e
              uma caixa de som que só tocava samba. Treze anos depois, a
              receita não mudou muito: carne boa, cerveja gelada e uma roda
              que sempre acha lugar pra mais um.
            </p>
            <div className="about__stats">
              <div className="about__stat">
                <span className="about__stat-number">13</span>
                <span className="about__stat-label">anos de casa</span>
              </div>
              <div className="about__stat">
                <span className="about__stat-number">400+</span>
                <span className="about__stat-label">rodas de samba</span>
              </div>
              <div className="about__stat">
                <span className="about__stat-number">4.9</span>
                <span className="about__stat-label">nota da galera</span>
              </div>
            </div>
          </div>
        </section>

        {/* PRATO DO DIA */}
        <section className="teaser container">
          <div className="teaser__card teaser__card--dish">
            <span className="eyebrow">Prato do dia · Terça</span>
            <h3 className="teaser__title">Feijoada do Hudson</h3>
            <p className="teaser__text">
              Feijão preto, carnes defumadas, couve, laranja e farofa
              crocante.
            </p>
            <div className="teaser__footer">
              <span className="teaser__price">R$ 49,00</span>
              <a href="/cardapio" className="teaser__link">
                Ver cardápio completo →
              </a>
            </div>
          </div>

          <div className="teaser__card teaser__card--event">
            <span className="eyebrow">Evento especial · 22 de junho</span>
            <h3 className="teaser__title">Feijoada &amp; Batuque</h3>
            <p className="teaser__text">
              Uma tarde inteira para cantar, comer e esquecer da hora.
            </p>
            <div className="teaser__footer">
              <a href="/eventos" className="btn btn--primary btn--small">
                Comprar ingresso
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer__inner">
          <span className="footer__brand">Boteco do Hudson</span>
          <span className="footer__meta">Centro do Rio · Desde 2012</span>
        </div>
      </footer>
    </>
  );
}
