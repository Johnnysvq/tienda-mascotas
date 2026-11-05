package com.tiendamascotas.image;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;


import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/images")
@RequiredArgsConstructor 
public class ImageController {

    private final ImageSignatureService service;

    @PostMapping("/signature")
    public ImageSignatureResponse signature() {
        return service.sign();
    }
    
}
