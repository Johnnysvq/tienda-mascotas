package com.tiendamascotas.image;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.NotBlank;

@Validated
@ConfigurationProperties(prefix = "cloudinary")
public record CloudinaryProperties(
    @NotBlank String cloudName,
    @NotBlank String apiKey,
    @NotBlank String apiSecret) {
        // Evita que el secret salga en los logs, si alguien imprime este objeto
        @Override
        public String toString() {
            return "CloudinaryProperties[cloundName=" + cloudName + ", apiKey=***, apiSecret=***]"; 
        }
}
