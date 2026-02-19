function base64UrlEncode(obj) {
    const stringified = JSON.stringify(obj);
    const base64 = btoa(stringified);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function createToken(user) {
    const header = {
        "alg": "HS256",
        "typ": "JWT"
    };

    const payload = {
        "usr": user,
        "iat": Math.floor(Date.now() / 1000) // issued at
    };

    const encodedHeader = base64UrlEncode(header);
    const encodedPayload = base64UrlEncode(payload);
    const signature = "firma_secreta_simulada_xyz123";

    const jwt = `${encodedHeader}.${encodedPayload}.${signature}`;
    return jwt;
}
