// Usage: node generate-test-jwt.js
const jwt = require('jsonwebtoken');

const secret = 'pACqsJ3McEpKTA2QwzAPKRexbCV/BlhPI+zyF6/sqJlRzTrwpbz+pSCBLeN9Rgcsjpa/OWL05NmV0KhGgFKhNQ==';

const payload = {
  userId: '7a172414-a7fa-4039-820b-37746dbafd69',
  email: 'mosesmichael878@gmail.com',
  full_name: 'Moses Michael (Chipu)',
  role: 'student',
  avatar_url: 'https://lh3.googleusercontent.com/a/ACg8ocJBBINkc5ST75eQmyj60q5QD4Oqby4Ldc5gSeuQEXZlTjwO4w=s96-c',
  provider: 'google',
  google_id: '107525044161561757768',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
};

const token = jwt.sign(payload, secret, { algorithm: 'HS256' });

console.log('JWT for testing:');
console.log(token);
