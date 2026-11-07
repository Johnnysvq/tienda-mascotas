package com.tiendamascotas.config;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

@Component
class LoginAttemptLimiter {
    private static final int MAX_FAILURES = 5;
    private static final Duration WINDOW = Duration.ofMinutes(15);
    private static final int CLEANUP_THRESHOLD = 10_000;
    
    private record Entry(int failures, Instant windowStart) {
        boolean expired(Instant now) {
            return windowStart.plus(WINDOW).isBefore(now);
        }
    }

    private final ConcurrentHashMap<String, Entry> attemps = new ConcurrentHashMap<>();

    boolean isBlocked(String key) {
        Entry entry = attemps.get(key);
        return entry != null && !entry.expired(Instant.now()) && entry.failures() >= MAX_FAILURES;
    }

    long retryAfterSeconds(String key) {
        Entry entry = attemps.get(key);
        if (entry == null) {
            return 0;
        }
        long seconds = Duration.between(Instant.now(), entry.windowStart().plus(WINDOW)).toSeconds();
        return Math.max(seconds, 1);
    }

    void recordFailure(String key) {
        Instant now = Instant.now();

        if (attemps.size() > CLEANUP_THRESHOLD) {
            attemps.values().removeIf(entry -> entry.expired(now));
        }
        attemps.compute(key, (k, entry) -> (entry == null || entry.expired(now))
                ? new Entry(1, now)
                : new Entry(entry.failures() + 1, entry.windowStart()));
    }

    void reset(String key) {
        attemps.remove(key);
    }
}
