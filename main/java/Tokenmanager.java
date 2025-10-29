import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class Tokenmanager {

    private static final Map<String, String> ACTIVE_TOKENS = new HashMap<>();

    public static String createToken(String userId) {
        String token = UUID.randomUUID().toString();
        ACTIVE_TOKENS.put(token, userId);
        return token;
    }

    public static boolean isValid(String token) {
        return ACTIVE_TOKENS.containsKey(token);
    }

    public static void revoke(String token) {
        ACTIVE_TOKENS.remove(token);
    }
}