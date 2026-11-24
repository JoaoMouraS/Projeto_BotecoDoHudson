/**
 * Reduz a foto no próprio celular antes de enviar (upload mais rápido no 4G) e
 * converte para JPEG. O backend re-processa de qualquer forma (segurança).
 */
export async function prepararImagem(arquivo, ladoMaximo = 1600) {
  if (!arquivo.type.startsWith("image/")) throw new Error("Escolha um arquivo de imagem.");
  const url = URL.createObjectURL(arquivo);
  try {
    const img = await new Promise((ok, falha) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = () => falha(new Error("Não foi possível ler essa imagem. Tente uma foto JPG ou PNG."));
      i.src = url;
    });
    const escala = Math.min(1, ladoMaximo / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * escala);
    canvas.height = Math.round(img.height * escala);
    canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((ok) => canvas.toBlob(ok, "image/jpeg", 0.88));
    return new File([blob], "foto.jpg", { type: "image/jpeg" });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function formDataComArquivo(arquivo) {
  const fd = new FormData();
  fd.append("arquivo", arquivo);
  return fd;
}
