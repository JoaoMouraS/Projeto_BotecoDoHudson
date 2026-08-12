import { useRef, useState } from "react";
import Header from "../../components/Header/Header";
import "./Galeria.css";

const FILTERS = ["Todos", "Pagode do Hudson", "18 Jun 2024"];

// Troque por dados reais vindos da API (ver services/gallery.js)
const PHOTOS = [
  { id: 1, event: "Pagode do Hudson", date: "18 Jun 2024", src: "/gallery/1.jpg" },
  { id: 2, event: "Pagode do Hudson", date: "18 Jun 2024", src: "/gallery/2.jpg" },
  { id: 3, event: "Feijoada & Batuque", date: "22 Jun 2024", src: "/gallery/3.jpg" },
  { id: 4, event: "Pagode do Hudson", date: "18 Jun 2024", src: "/gallery/4.jpg" },
  { id: 5, event: "Sexta no Terraço", date: "29 Jun 2024", src: "/gallery/5.jpg" },
  { id: 6, event: "Feijoada & Batuque", date: "22 Jun 2024", src: "/gallery/6.jpg" },
];

export default function Galeria() {
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [selfiePreview, setSelfiePreview] = useState(null);
  const [searching, setSearching] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleSelfieFile = (file) => {
    if (!file) return;
    setSelfiePreview(URL.createObjectURL(file));
    setSearching(true);

    // Aqui entra a chamada real pro backend de reconhecimento facial.
    // Ver explicação de arquitetura na resposta em texto.
    // Exemplo:
    // const formData = new FormData();
    // formData.append("selfie", file);
    // const res = await fetch("/api/gallery/search-by-face", { method: "POST", body: formData });
    // const matches = await res.json();

    setTimeout(() => setSearching(false), 1200); // placeholder de loading
  };

  const filteredPhotos =
    activeFilter === "Todos"
      ? PHOTOS
      : PHOTOS.filter((p) => p.event === activeFilter || p.date === activeFilter);

  return (
    <>
      <Header />

      <main className="galeria container">
        <span className="eyebrow">A noite em imagens</span>
        <h1 className="galeria__title">Procura seu sorriso.</h1>

        {/* BUSCA POR ROSTO */}
        <section className="face-search">
          <div className="face-search__text">
            <span className="eyebrow">Busca por rosto</span>
            <h2 className="face-search__title">Encontre suas fotos</h2>
            <p className="face-search__desc">
              Envie uma selfie ou use a câmera. Nosso fotógrafo digital
              procura você no meio da roda.
            </p>
            {searching && (
              <p className="face-search__status" role="status">
                Procurando seu rosto nas fotos da noite…
              </p>
            )}
          </div>

          <div className="face-search__actions">
            {selfiePreview ? (
              <img
                src={selfiePreview}
                alt="Sua selfie enviada"
                className="face-search__preview"
              />
            ) : (
              <>
                <button
                  className="face-search__btn"
                  aria-label="Enviar foto"
                  onClick={() => fileInputRef.current?.click()}
                >
                  ⬆
                </button>
                <button
                  className="face-search__btn"
                  aria-label="Usar câmera"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  📷
                </button>
              </>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => handleSelfieFile(e.target.files?.[0])}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="user"
              hidden
              onChange={(e) => handleSelfieFile(e.target.files?.[0])}
            />
          </div>
        </section>

        {/* FILTROS */}
        <div className="galeria__filters">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              className={`filter-pill ${
                activeFilter === filter ? "filter-pill--active" : ""
              }`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* GRID DE FOTOS */}
        <div className="galeria__grid">
          {filteredPhotos.map((photo) => (
            <figure key={photo.id} className="photo-card">
              <img src={photo.src} alt={`Foto de ${photo.event}`} loading="lazy" />
              <span className="photo-card__watermark">Boteco do Hudson</span>
            </figure>
          ))}
        </div>
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