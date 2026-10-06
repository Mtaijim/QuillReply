package com.example.Email_writer.Controller;

import com.example.Email_writer.modal.EmailRequest;
import com.example.Email_writer.service.EmailGeneratorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/email")
@RequiredArgsConstructor
public class EmailGeneratorController {
private final  EmailGeneratorService emailGeneratorService;

    @PostMapping("/generate")
    public ResponseEntity<List<String>> generate(@Valid @RequestBody EmailRequest request) {
        return ResponseEntity.ok(emailGeneratorService.generateReplies(request));
    }
}
