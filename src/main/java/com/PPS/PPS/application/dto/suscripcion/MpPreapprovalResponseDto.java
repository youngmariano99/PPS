package com.PPS.PPS.application.dto.suscripcion;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class MpPreapprovalResponseDto {
    private String id; // El preapproval_id
    private String init_point; 
    private String sandbox_init_point; 
    private String status;
    private String payer_email;
}

