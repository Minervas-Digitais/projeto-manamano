process.env.THROTTLE_GLOBAL_TTL_MS = '60000';
// Alto de propósito: o teto global não deve interferir nas demais suítes.
process.env.THROTTLE_LIMIT = '1000';
process.env.THROTTLE_LOGIN_TTL_MS = '60000';
process.env.THROTTLE_LOGIN_LIMIT = '5';
process.env.THROTTLE_REGISTER_TTL_MS = '600000';
process.env.THROTTLE_REGISTER_LIMIT = '5';
process.env.THROTTLE_PASSWORD_TTL_MS = '900000';
process.env.THROTTLE_PASSWORD_LIMIT = '5';
