package com.example.Email_writer.ExceptionHandler;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(WebClientResponseException.class)
    public ResponseEntity<Map<String,String>> upstream(WebClientResponseException e) {
        log.error("Gemini responded {}: {}", e.getStatusCode(), e.getResponseBodyAsString());
        int code = e.getStatusCode().value();
        int s = (code == 429 || code == 503) ? code : 502;
        String msg = switch (s) {
            case 429 -> "Too many requests, try again in a minute.";
            case 503 -> "The AI is busy right now, please try again in a moment.";
            default -> "AI service error.";

    };
        return ResponseEntity.status(s).body(Map.of("error", msg));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String,String>> invalid(MethodArgumentNotValidException e) {
        return ResponseEntity.badRequest().body(Map.of("error", "Email is required (max 5000 characters)."));
    }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> fallback(Exception e) {
        log.error("Unhandled error", e);
        return ResponseEntity.status(500).body(Map.of("error", "Something went wrong."));
    }
}
