package com.tiendamascotas.image;

public record ImageSignatureResponse(
    String cloudName,
    String apiKey,
    long timestamp,
    String folder,
    String allowedFormats,
    String signature) {

}
