package com.PPS.PPS.dto.suscripcion;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class MpPaymentResponseDto {
    private Long id;
    private String status;
    
    @JsonProperty("external_reference")
    private String externalReference;
}
