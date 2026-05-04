package com.PPS.PPS.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Representa una red social procesada automáticamente.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RedSocialDto implements Serializable {
    private String plataforma;
    private String url;

    public static List<RedSocialDto> procesarUrls(List<String> urlsCrudas) {
        if (urlsCrudas == null || urlsCrudas.isEmpty()) return new ArrayList<>();

        return urlsCrudas.stream()
                .filter(url -> url != null && !url.trim().isEmpty())
                .map(url -> {
                    String urlLower = url.toLowerCase();
                    String plataforma = "OTRO";
                    if (urlLower.contains("instagram.com")) plataforma = "INSTAGRAM";
                    else if (urlLower.contains("facebook.com")) plataforma = "FACEBOOK";
                    else if (urlLower.contains("linkedin.com")) plataforma = "LINKEDIN";
                    else if (urlLower.contains("github.com")) plataforma = "GITHUB";
                    else if (urlLower.contains("tiktok.com")) plataforma = "TIKTOK";
                    else if (urlLower.contains("youtube.com") || urlLower.contains("youtu.be")) plataforma = "YOUTUBE";

                    return new RedSocialDto(plataforma, url.trim());
                })
                .collect(Collectors.toList());
    }
}
