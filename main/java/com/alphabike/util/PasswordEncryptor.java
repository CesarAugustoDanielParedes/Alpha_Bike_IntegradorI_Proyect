package com.alphabike.util;

import com.google.common.hash.Hashing;
import java.nio.charset.StandardCharsets;

public class PasswordEncryptor {
    public static String hashPassword(String password) {
        return Hashing.sha256().hashString(password, StandardCharsets.UTF_8).toString();
    }
}


