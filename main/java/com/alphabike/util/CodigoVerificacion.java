package com.alphabike.util;

import com.google.common.io.BaseEncoding;
import java.security.SecureRandom;

public class CodigoVerificacion {
    public static String generarCodigo() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[4];
        random.nextBytes(bytes);
        return BaseEncoding.base32().omitPadding().encode(bytes);
    }
}
