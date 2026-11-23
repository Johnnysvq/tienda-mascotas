package com.tiendamascotas.auth;

import java.util.List;

public record CurrentUserResponse(String username, String firstName, List<String> roles) {
}