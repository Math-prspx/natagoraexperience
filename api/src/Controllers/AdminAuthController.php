<?php

declare(strict_types=1);

namespace Natagora\API\Controllers;

use Natagora\API\Auth;
use Natagora\API\Response;
use Natagora\API\Router;
use Natagora\API\Exceptions\ValidationException;

class AdminAuthController
{
    private Auth $auth;
    private string $username;
    private string $passwordHash;

    public function __construct(Auth $auth, string $username, string $passwordHash)
    {
        $this->auth         = $auth;
        $this->username     = $username;
        $this->passwordHash = $passwordHash;
    }

    public function login(): void
    {
        $payload = Router::getRequestJson();

        $username = trim((string) ($payload['username'] ?? ''));
        $password = (string) ($payload['password'] ?? '');

        if ($username === '' || $password === '') {
            throw new ValidationException('Identifiant et mot de passe requis.');
        }

        // Constant-time username check + always run password_verify to prevent timing attacks
        $usernameOk = hash_equals($this->username, $username);
        $passwordOk = $this->auth->checkPassword($password, $this->passwordHash);

        if (!$usernameOk || !$passwordOk) {
            // Generic message — do not reveal which field is wrong
            Response::json(['error' => 'Identifiants invalides.'], 401);
            return;
        }

        $token = $this->auth->generateToken($username);
        Response::json(['token' => $token]);
    }
}
