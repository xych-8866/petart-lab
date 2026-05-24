// /api/printful-webhook.js
import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const event = req.body;
        
        if (event.type === 'order.shipped') {
            const printfulOrderId = event.data.order.id;
            const trackingNumber = event.data.order.tracking_number;
            const trackingUrl = event.data.order.tracking_url;

            await sql`
                UPDATE orders 
                SET status = 'shipped', tracking_number = ${trackingNumber}, tracking_url = ${trackingUrl}, updated_at = NOW()
                WHERE printful_order_id = ${printfulOrderId}
            `;
            
            console.log(`Order ${printfulOrderId} shipped! Tracking: ${trackingNumber}`);
        }

        return res.status(200).json({ received: true });

    } catch (error) {
        console.error('Webhook error:', error);
        return res.status(500).json({ error: error.message });
    }
}
