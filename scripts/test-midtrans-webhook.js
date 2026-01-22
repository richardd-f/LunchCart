// Native fetch is available in Node 18+

async function testWebhook() {
    const url = 'http://localhost:3000/api/midtrans'; // Change port if needed

    // 1. Create a fake payload
    // WARNING: You must have an Order with 'midtransOrderId' = 'ORDER-TEST-123' in your DB 
    // OR change this ID to an existing one from your DB for a real test.
    // For safety, I will try to use a dummy ID first to see if it logs "Order not found".
    const payload = {
        order_id: "ORDER-TEST-123",
        transaction_status: "settlement",
        fraud_status: "accept",
        transaction_id: "TRANS-TEST-001",
        gross_amount: "10000.00",
        payment_type: "credit_card",
        transaction_time: "2023-10-01 12:00:00",
        status_code: "200"
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const status = response.status;
        const data = await response.json();

        console.log(`Response Status: ${status}`);
        console.log('Response Body:', data);
    } catch (error) {
        console.error('Error sending webhook:', error);
    }
}

testWebhook();
