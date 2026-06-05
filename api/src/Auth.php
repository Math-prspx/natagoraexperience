<?php

declare(strict_types=1);

namespace Natagora\API;

/**
 * Stateless token-based authentication.
 *
 * Token format: base64url(payload_json) . "." . base64url(hmac_sha256(base64url(payload_json), secret))
 * Payload: {"u":"<username>","exp":<unix_timestamp>}
 */
class Auth
{
    private string $secret;
    private int $ttl;

    public function __construct(string $secret, int $ttl = 28800)
    {
        $this->secret = $secret;
        $this->ttl    = $ttl;
    }

    /**
     * Generate a signed token for the given username.
     */
    public function generateToken(string $username): string
    {
        $payload = $this->base64url(json_encode([
            'u'   => $username,
            'exp' => time() + $this->ttl,
        ], JSON_THROW_ON_ERROR));

        $sig = $this->base64url(hash_hmac('sha256', $payload, $this->secret, true));

        return $payload . '.' . $sig;
    }

    /**
     * Verify a token. Returns the username on success, null on failure.
     */
    public function verifyToken(string $token): ?string
    {
        $parts = explode('.', $token, 2);
        if (count($parts) !== 2) {
            return null;
        }

        [$payload, $sig] = $parts;

        // Constant-time comparison to prevent timing attacks
        $expected = $this->base64url(hash_hmac('sha256', $payload, $this->secret, true));
        if (!hash_equals($expected, $sig)) {
            return null;
        }

        $data = json_decode(base64_decode(strtr($payload, '-_', '+/')), true);
        if (!is_array($data) || !isset($data['u'], $data['exp'])) {
            return null;
        }

        if (time() > (int) $data['exp']) {
            return null;
        }

        return (string) $data['u'];
    }

    /**
     * Verify a plaintext password against a bcrypt hash.
     */
    public function checkPassword(string $plain, string $hash): bool
    {
        return password_verify($plain, $hash);
    }

    private function base64url(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
}
