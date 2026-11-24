import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import api from "../../services/api";
import "./Home.css";

export default function Home() {
  const [proximo, setProximo] = useState(null);

  useEffect(() => {
    api.get("/api/eventos").then(({ data }) => setProximo(data[0] ?? null)).catch(() => {});
  }, []);

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
              <Link to="/reservar" className="btn btn--primary">
                Reservar minha mesa
              </Link>
              <Link to="/eventos" className="btn btn--ghost">
                Ver agenda
              </Link>
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

        {/* RESERVA + PRÓXIMO EVENTO */}
        <section className="teaser container">
          <div className="teaser__card teaser__card--dish">
            <span className="eyebrow">Aniversário no boteco</span>
            <h3 className="teaser__title">Chama a roda pelo link</h3>
            <p className="teaser__text">
              Reserve a mesa, ganhe um convite com a sua foto e mande no grupo.
              Bateu a meta de confirmados, a mesa é sua.
            </p>
            <div className="teaser__footer">
              <Link to="/reservar" className="teaser__link">
                Como funciona a reserva →
              </Link>
            </div>
          </div>

          <div
            className="teaser__card teaser__card--event"
            style={proximo?.imagemUrl ? { backgroundImage: `linear-gradient(180deg, rgba(18,12,8,.35), rgba(18,12,8,.95)), url(${proximo.imagemUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
          >
            <span className="eyebrow">
              {proximo
                ? `Próximo evento · ${new Date(proximo.dataInicio).toLocaleDateString("pt-BR", { day: "numeric", month: "long" })}`
                : "Agenda"}
            </span>
            <h3 className="teaser__title">{proximo ? proximo.nome : "Agenda em breve"}</h3>
            <p className="teaser__text">
              {proximo ? "Garanta sua mesa antes que esgote." : "Fique de olho: logo tem samba novo na casa."}
            </p>
            <div className="teaser__footer">
              <Link to={proximo ? `/reservar?evento=${proximo.id}` : "/eventos"} className="btn btn--primary btn--small">
                {proximo ? "Reservar mesa" : "Ver eventos"}
              </Link>
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
