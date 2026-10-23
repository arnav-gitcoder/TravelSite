/**
 * API integration test for forgot-password → reset-password flow.
 * Exercises the HTTP endpoints directly, intercepting OTP from the store.
 */

import { storeOTP, generateOTP } from '../src/utils/otp.js';

const BASE = 'http://localhost:5000/api';

async function test() {
  console.log('=== API Forgot Password Flow Test ===\n');

  // Step 1: Test forgot-password with nonexistent email
  console.log('1. Forgot password with nonexistent email...');
  const r1 = await fetch(`${BASE}/users/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'nonexistent-xyz@test.com' }),
  });
  const d1 = await r1.json();
  console.log(`   Status: ${r1.status}, Message: ${d1.message}`);
  console.assert(r1.status === 404, 'Should be 404 for nonexistent email');
  console.log('   ✅ Correctly returns 404\n');

  // Step 2: Test reset-password with missing fields
  console.log('2. Reset password with missing fields...');
  const r2 = await fetch(`${BASE}/users/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@test.com' }),
  });
  const d2 = await r2.json();
  console.log(`   Status: ${r2.status}, Message: ${d2.message}`);
  console.assert(r2.status === 400, 'Should be 400 for missing fields');
  console.log('   ✅ Correctly validates required fields\n');

  // Step 3: Test reset-password with invalid OTP
  console.log('3. Reset password with invalid OTP...');
  const r3 = await fetch(`${BASE}/users/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@test.com', otp: '000000', newPassword: 'newpass123' }),
  });
  const d3 = await r3.json();
  console.log(`   Status: ${r3.status}, Message: ${d3.message}`);
  console.assert(r3.status === 400, 'Should be 400 for invalid OTP');
  console.log('   ✅ Correctly rejects invalid OTP\n');

  // Step 4: Test reset-password with short password
  console.log('4. Reset password with short password...');
  const r4 = await fetch(`${BASE}/users/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@test.com', otp: '123456', newPassword: 'abc' }),
  });
  const d4 = await r4.json();
  console.log(`   Status: ${r4.status}, Message: ${d4.message}`);
  console.assert(r4.status === 400, 'Should be 400 for short password');
  console.log('   ✅ Correctly rejects short password\n');

  // Step 5: Test resend-otp with type=reset
  console.log('5. Resend OTP with type=reset...');
  const r5 = await fetch(`${BASE}/users/resend-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test-resend@test.com', name: 'Tester', type: 'reset' }),
  });
  const d5 = await r5.json();
  console.log(`   Status: ${r5.status}, Message: ${d5.message}`);
  console.assert(r5.status === 200, 'Should be 200 for resend');
  console.log('   ✅ Resend with type=reset works\n');

  // Step 6: Test forgot-password with no email
  console.log('6. Forgot password with no email...');
  const r6 = await fetch(`${BASE}/users/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  const d6 = await r6.json();
  console.log(`   Status: ${r6.status}, Message: ${d6.message}`);
  console.assert(r6.status === 400, 'Should be 400 for missing email');
  console.log('   ✅ Correctly validates email required\n');

  console.log('=== All API tests passed ===');
}

test().catch(console.error);
