/**
 * PayPal Ultra Monthly Plan Creator
 * Run this script to create the Ultra Monthly plan
 * 
 * Usage: node create-ultra-monthly-plan.mjs
 */

import fs from 'fs';

const PAYPAL_CLIENT_ID = "AeTOPbkHmblQBhLPBo5-4wWAVYgzV_9SsjRTskmcLwHdRZU_Zq3sGxjryrVP7bhtbTbsYbpsIJ73glwN";
const PAYPAL_CLIENT_SECRET = "EAHC2xSu3qk0nJM3lPrmRXkFF_rt6gSE_wFzyylTHj7yaz3h1g-aAtpsZaR39N2wdcnt1Z_bRCXsKFnH";
const PAYPAL_API_BASE = "https://api-m.sandbox.paypal.com";
const PRODUCT_ID = "PROD-68S78039YW4248729"; // Existing product ID

let logOutput = '';

function log(message) {
    console.log(message);
    logOutput += message + '\n';
}

// Get PayPal Access Token
async function getAccessToken() {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');

    const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(`Failed to get access token: ${JSON.stringify(data)}`);
    }

    return data.access_token;
}

// Create a Subscription Plan
async function createPlan(accessToken, productId, planName, price, interval) {
    const response = await fetch(`${PAYPAL_API_BASE}/v1/billing/plans`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            product_id: productId,
            name: planName,
            description: `${planName} subscription for Cinematic Voice AI`,
            status: 'ACTIVE',
            billing_cycles: [
                {
                    frequency: {
                        interval_unit: interval,
                        interval_count: 1
                    },
                    tenure_type: 'REGULAR',
                    sequence: 1,
                    total_cycles: 0,
                    pricing_scheme: {
                        fixed_price: {
                            value: price,
                            currency_code: 'USD'
                        }
                    }
                }
            ],
            payment_preferences: {
                auto_bill_outstanding: true,
                setup_fee: {
                    value: '0',
                    currency_code: 'USD'
                },
                setup_fee_failure_action: 'CONTINUE',
                payment_failure_threshold: 3
            }
        })
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(`Failed to create plan: ${JSON.stringify(data)}`);
    }

    log(`✅ Plan created: ${data.id} - ${planName}`);
    return data.id;
}

// Main function
async function main() {
    try {
        log('🚀 Creating Ultra Monthly Plan...\n');

        log('📝 Getting PayPal access token...');
        const accessToken = await getAccessToken();
        log('✅ Access token obtained\n');

        log('💳 Creating Ultra Monthly plan...\n');

        const ultraMonthlyId = await createPlan(
            accessToken,
            PRODUCT_ID,
            'Ultra Premium Monthly',
            '59.00',
            'MONTH'
        );

        log('\n✅ Plan created successfully!\n');
        log('📋 Add this to your .env file:\n');
        log(`VITE_PAYPAL_PLAN_ID_ULTRA_MONTHLY="${ultraMonthlyId}"`);
        log('\n🎉 Done! Update your .env file and restart your dev server.');

        fs.writeFileSync('ultra-monthly-plan-id.txt', logOutput);
        log('\n💾 Output saved to ultra-monthly-plan-id.txt');

    } catch (error) {
        log(`❌ Error: ${error.message}`);
        fs.writeFileSync('ultra-monthly-plan-id.txt', logOutput);
        process.exit(1);
    }
}

main();
