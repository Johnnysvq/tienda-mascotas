package com.tiendamascotas.config;

import java.io.IOException;

import org.springframework.http.HttpMethod;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

@Slf4j
final class RegistrationRateLimitFilter extends OncePerRequestFilter {

    private final LoginAttemptLimiter limiter;

    RegistrationRateLimitFilter(LoginAttemptLimiter limiter) {
        this.limiter = limiter;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !(HttpMethod.POST.matches(request.getMethod())
                && "/api/v1/auth/register".equals(request.getRequestURI()));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String key = "register:" + request.getRemoteAddr();
        if (limiter.isBlocked(key)) {
            log.warn("Registro bloqueado por exceso de intentos desde {}", request.getRemoteAddr());
            response.setHeader("Retry-After", String.valueOf(limiter.retryAfterSeconds(key)));
            response.setStatus(429);
            return;
        }
        limiter.recordFailure(key); // aqui cuenta cada intento, no solo los fallidos
        filterChain.doFilter(request, response);
    }

}
