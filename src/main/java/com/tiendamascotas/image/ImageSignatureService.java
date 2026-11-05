package com.tiendamascotas.image;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ImageSignatureService {

    // Fijos en el servidor: el cliente no los puede cambiar
    private static final String FOLDER = "products";
    private static final String ALLOWED_FORMATS = "jpg,png,webp";

    private final CloudinaryProperties props;

    public ImageSignatureResponse sign() {
        long timestamp = Instant.now().getEpochSecond();

        //Parametros en orden alfabetico + API secret al final
        String toSign = "allowed_formats=" + ALLOWED_FORMATS
                + "&folder=" + FOLDER
                + "&timestamp=" + timestamp;
        String signature = sha1Hex(toSign + props.apiSecret());

        return new ImageSignatureResponse(
            props.cloudName(), props.apiKey(), timestamp, FOLDER, ALLOWED_FORMATS, signature);
    }

    private static String sha1Hex(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-1");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
