<?php

/**
 * Usage example:
 *
 *  $security = new Security("my secret key");
 *  $encrypted = $security->encrypt($message);
 *  $decrypted = $security->decrypt($encrypted);
 */

class Security {

    protected $sharedSecret;
    protected $key;

    public function __construct($secret) {
        $this->sharedSecret = base64_decode($secret);
        $this->key = substr(sha1($secret, TRUE),0,16);
    }

    public function getKey() {
        return base64_encode($this->key);
    }

    public function encrypt($input) {
        $mode  = MCRYPT_MODE_ECB;
        $enc   = MCRYPT_RIJNDAEL_128;
        $size  = strlen($input);

        $input = str_pad($input,
            (16*(floor($size / 16) + ($size % 16 == 0 ? 2:1))),
            chr(16-($size %16)));
        $encrypted = mcrypt_encrypt($enc,
            $this->key,
            $input,
            $mode,
            mcrypt_create_iv(mcrypt_get_iv_size($enc, $mode),
            MCRYPT_DEV_URANDOM));

        return base64_encode($encrypted);
    }

    private static function pkcs5_pad ($text, $blocksize) {
        $pad = $blocksize - (strlen($text) % $blocksize);

        return $text . str_repeat(chr($pad), $pad);
    }

    public function decrypt($sStr) {
        $decrypted= mcrypt_decrypt(
            MCRYPT_RIJNDAEL_128,
            $this->key,
            base64_decode($sStr),
            MCRYPT_MODE_ECB
        );
        $dec_s = strlen($decrypted);
        $padding = ord($decrypted[$dec_s-1]);
        $decrypted = substr($decrypted, 0, -$padding);

        return $decrypted;
    }
}
?>
