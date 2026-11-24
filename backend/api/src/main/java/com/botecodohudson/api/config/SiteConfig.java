package com.botecodohudson.api.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

/**
 * Em produção o site React (frontend/dist) é empacotado dentro do jar em /static.
 * Assim site e API ficam no MESMO endereço (cookie de login funciona, sem CORS).
 * Qualquer rota que não seja arquivo nem /api devolve o index.html (rotas do React,
 * ex.: /convite/abc abrindo direto do WhatsApp não dão 404).
 */
@Configuration
public class SiteConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String caminho, Resource local) throws IOException {
                        Resource arquivo = local.createRelative(caminho);
                        if (arquivo.exists() && arquivo.isReadable()) return arquivo;
                        if (caminho.startsWith("api/") || caminho.contains(".")) return null;
                        Resource index = local.createRelative("index.html");
                        return index.exists() ? index : null;
                    }
                });
    }
}
