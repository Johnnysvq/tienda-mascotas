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
final class LoginRateLimitFilter extends OncePerRequestFilter {

    private final LoginAttemptLimiter limiter;

    LoginRateLimitFilter(LoginAttemptLimiter limiter) {
        this.limiter = limiter;
    }

    // Solo actua sobre el POST del login
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !(HttpMethod.POST.matches(request.getMethod())
                && "/api/v1/auth/login".equals(request.getRequestURI()));
    }


    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String key = request.getRemoteAddr();
        if (limiter.isBlocked(key)) {
            log.warn("Login bloqueado por exceso de intentos fallidos: {}", key);
            response.setHeader("Retry-After", String.valueOf(limiter.retryAfterSeconds(key)));
            response.setStatus(429);
            return;
        }
        filterChain.doFilter(request, response);
    }

}
