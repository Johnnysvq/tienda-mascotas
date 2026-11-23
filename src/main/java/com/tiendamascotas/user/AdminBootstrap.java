package com.tiendamascotas.user;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
class AdminBootstrap implements ApplicationRunner {

    private final AppUserRepository repository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:}")
    private String email;

    @Value("${app.admin.password:}")
    private String password;

    @Override
    public void run(ApplicationArguments args) {
        
        if (repository.existsByRole(Role.ADMIN)) {
            return; // ya hay administrador: no se toca nada
        }
        if (email.isBlank() || password.length() < 10) {
            throw new IllegalStateException(
                    "No hay administrador. Define ADMIN_EMAIL y ADMIN_PASSWORD (mínimo 10 caracteres) para crearlo.");
        }

        AppUser admin = new AppUser();
        admin.setFirstName("Administrador");
        admin.setLastName("Tienda");
        admin.setEmail(UserService.normalizeEmail(email));
        admin.setPasswordHash(passwordEncoder.encode(password));
        admin.setRole(Role.ADMIN);
        repository.save(admin);
        log.info("Administrador inicial creado: {}", admin.getEmail());
    }


}
