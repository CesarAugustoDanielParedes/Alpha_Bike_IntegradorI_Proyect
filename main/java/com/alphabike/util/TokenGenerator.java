package com.alphabike.util;

import com.google.common.hash.Hashing;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
import java.security.SecureRandom;

public class TokenGenerator {

    public static String generateCodeShort(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        SecureRandom rnd = new SecureRandom();
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(rnd.nextInt(chars.length())));
        }
        return sb.toString();
    }

    public static String generateToken() {
        String uuid = UUID.randomUUID().toString();
        return Hashing.sha256()
                .hashString(uuid, StandardCharsets.UTF_8)
                .toString();
    }
}
