package com.dmwl.guacamole.net.encryptedurl;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Arrays;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;

import org.apache.commons.codec.binary.Base64;
import org.codehaus.jackson.map.deser.ValueInstantiators.Base;

public class Security {

    private SecretKeySpec secretKey;
    byte[] key;

    public String getKey() {
        return Base64.encodeBase64String(key);
    }

    public Security(String sharedSecret) {
        try {
            // Generate 128-bit hash from this string
            MessageDigest sha = MessageDigest.getInstance("SHA-1");

            key = sha.digest(sharedSecret.getBytes());
            key = Arrays.copyOf(key, 16);

            this.secretKey = new SecretKeySpec(key, "AES");
        }
        catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
        }
    }

    public String encrypt(String input) {
        byte[] crypted = null;
        try {
            Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
            cipher.init(Cipher.ENCRYPT_MODE, this.secretKey);
            crypted = cipher.doFinal(input.getBytes());
        }
        catch (Exception e) {
            System.out.println(e.toString());
        }
        return new String(Base64.encodeBase64(crypted));
    }

    public String decrypt(String input) {
        byte[] output = null;
        try {
            Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
            cipher.init(Cipher.DECRYPT_MODE, this.secretKey);
            output = cipher.doFinal(Base64.decodeBase64(input));
        }
        catch (Exception e) {
            e.printStackTrace();
        }
        return new String(output);
    }
}
