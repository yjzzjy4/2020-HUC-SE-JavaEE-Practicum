package action.util;

import java.math.BigInteger;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class EncryptPasswordUtil {
    public static String encrypt(String pwd) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA");
            md.update(pwd.getBytes());
            return new BigInteger(1, md.digest()).toString(32);
        }
        catch(NoSuchAlgorithmException e) {
            return null;
        }
    }
}
