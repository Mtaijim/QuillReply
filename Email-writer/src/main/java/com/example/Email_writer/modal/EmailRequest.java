package com.example.Email_writer.modal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class EmailRequest {

    @NotBlank
    @Size(max = 5000) private String emailContent;
    @Size(max = 30) private String tone = "professional";
    @Size(max = 30) private String length = "medium";
    @Size(max = 30) private String language = "English";
}
