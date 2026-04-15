package com.PPS.PPS.dto.suscripcion;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class MpWebhookDto {
    private String action;
    private DataPayload data;
    private String date_created;
    private Long id;
    private Boolean live_mode;
    private String type;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class DataPayload {
        private String id;
    }
}
