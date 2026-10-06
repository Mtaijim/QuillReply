package com.example.Email_writer.Config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class RateLimitInterceptor implements HandlerInterceptor {
    private static final long MINUTE = 60_000;
    private static final long DAY = 24 * 60 * MINUTE;

    @Value("${app.ratelimit.per-minute:5}")
    private int perMinuteLimit;


    @Value("${app.ratelimit.per-day:40}")
    private int perDayLimit;

    @Value("${app.ratelimit.global-per-minute:12}")
    private int globalPerMinuteLimit;

    private final Map<String, List<Long>> requestTimes = new HashMap<>();
    private final List<Long> globalTimes = new ArrayList<>();


    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {

        // Browsers send an OPTIONS request first (CORS check). Let it through.
        if (request.getMethod().equals("OPTIONS")) {
            return true;
        }

        String errorMessage = checkLimits(request.getRemoteAddr(), System.currentTimeMillis());

        if (errorMessage == null) {
            return true; // allowed
        }

        response.setStatus(429);
        response.setContentType("application/json");
        response.getWriter().write("{\"error\":\"" + errorMessage + "\"}");
        return false; // blocked
    }

}
