import { useEffect, useRef, useState } from "react";
import Header from "../../components/Header/Header";
import { listGalleryPhotos } from "../../services/gallery";
import "./Galeria.css";

export default function Galeria() {
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [galleryError, setGalleryError] = useState("");
  const [selfiePreview, setSelfiePreview] = useState(null);
  const [searching, setSearching] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    listGalleryPhotos()
      .then((data) => {
        if (mounted) setPhotos(data);
      })
      .catch(() => {
        if (mounted) setGalleryError("A galeria ainda não está disponível.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

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

  const filters = ["Todos", ...new Set(photos.map((photo) => photo.event))];
  const filteredPhotos =
    activeFilter === "Todos"
      ? photos
      : photos.filter((photo) => photo.event === activeFilter);

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
          {filters.map((filter) => (
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
          {loading && <p className="galeria__message">Carregando fotos...</p>}
          {!loading && galleryError && <p className="galeria__message">{galleryError}</p>}
          {!loading && !galleryError && filteredPhotos.length === 0 && (
            <p className="galeria__message">Nenhuma foto publicada ainda.</p>
          )}
          {filteredPhotos.map((photo) => (
            <figure key={photo.id} className="photo-card">
              <img src={photo.src} alt={photo.title} loading="lazy" />
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