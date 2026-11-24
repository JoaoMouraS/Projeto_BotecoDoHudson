package com.botecodohudson.api.service;

import com.botecodohudson.api.model.ImagemModel;
import com.botecodohudson.api.repository.ImagemRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageInputStream;
import javax.imageio.stream.ImageOutputStream;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Iterator;
import java.util.UUID;

/**
 * Recebe fotos enviadas pelos usuários com segurança:
 *  - aceita só o que o Java consegue decodificar como imagem (JPEG/PNG/GIF/BMP);
 *  - recusa dimensões absurdas antes de decodificar (evita "bomba" de memória);
 *  - redimensiona e RE-CODIFICA em JPEG: some qualquer metadado (GPS, câmera) e
 *    qualquer conteúdo escondido no arquivo original.
 */
@Service
public class ImagemService {

    private static final int MAX_DIMENSAO_ENTRADA = 8000;

    private final ImagemRepository repo;

    public ImagemService(ImagemRepository repo) {
        this.repo = repo;
    }

    @Transactional
    public UUID salvar(MultipartFile arquivo, Long donoId, int ladoMaximo) {
        if (arquivo == null || arquivo.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Envie uma imagem.");
        }
        BufferedImage original;
        try {
            original = ler(arquivo.getBytes());
        } catch (IOException e) {
            original = null;
        }
        if (original == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Formato de imagem não suportado. Use JPG ou PNG.");
        }

        ImagemModel img = new ImagemModel();
        img.setId(UUID.randomUUID());
        img.setDonoId(donoId);
        img.setTipo("image/jpeg");
        img.setConteudo(paraJpeg(redimensionar(original, ladoMaximo)));
        repo.save(img);
        return img.getId();
    }

    @Transactional
    public void apagar(UUID id) {
        if (id != null) repo.deleteById(id);
    }

    private static BufferedImage ler(byte[] bytes) throws IOException {
        try (ImageInputStream in = ImageIO.createImageInputStream(new java.io.ByteArrayInputStream(bytes))) {
            if (in == null) return null;
            Iterator<ImageReader> readers = ImageIO.getImageReaders(in);
            if (!readers.hasNext()) return null;
            ImageReader reader = readers.next();
            try {
                reader.setInput(in, true, true); // ignora metadados
                if (reader.getWidth(0) > MAX_DIMENSAO_ENTRADA || reader.getHeight(0) > MAX_DIMENSAO_ENTRADA) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Imagem grande demais.");
                }
                return reader.read(0);
            } finally {
                reader.dispose();
            }
        }
    }

    private static BufferedImage redimensionar(BufferedImage src, int ladoMaximo) {
        int w = src.getWidth(), h = src.getHeight();
        double escala = Math.min(1.0, (double) ladoMaximo / Math.max(w, h));
        int nw = Math.max(1, (int) Math.round(w * escala)), nh = Math.max(1, (int) Math.round(h * escala));
        BufferedImage out = new BufferedImage(nw, nh, BufferedImage.TYPE_INT_RGB); // sem alfa (JPEG)
        Graphics2D g = out.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
        g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g.setColor(java.awt.Color.WHITE); // PNG transparente vira fundo branco
        g.fillRect(0, 0, nw, nh);
        g.drawImage(src, 0, 0, nw, nh, null);
        g.dispose();
        return out;
    }

    private static byte[] paraJpeg(BufferedImage img) {
        try (ByteArrayOutputStream bos = new ByteArrayOutputStream();
             ImageOutputStream out = ImageIO.createImageOutputStream(bos)) {
            ImageWriter writer = ImageIO.getImageWritersByFormatName("jpeg").next();
            ImageWriteParam param = writer.getDefaultWriteParam();
            param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
            param.setCompressionQuality(0.85f);
            writer.setOutput(out);
            writer.write(null, new IIOImage(img, null, null), param);
            writer.dispose();
            out.flush();
            return bos.toByteArray();
        } catch (IOException e) {
            throw new IllegalStateException("Falha ao processar imagem", e);
        }
    }
}
