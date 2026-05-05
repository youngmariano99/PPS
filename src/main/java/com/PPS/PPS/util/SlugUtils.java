package com.PPS.PPS.util;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

public class SlugUtils {

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    public static String makeSlug(String... inputs) {
        StringBuilder sb = new StringBuilder();
        for (String input : inputs) {
            if (input != null && !input.isBlank()) {
                if (sb.length() > 0) sb.append("-");
                sb.append(input);
            }
        }
        
        String nowhitespace = WHITESPACE.matcher(sb.toString()).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = NONLATIN.matcher(normalized).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH)
                .replaceAll("-{2,}", "-")
                .replaceAll("^-|-$", "");
    }
}
