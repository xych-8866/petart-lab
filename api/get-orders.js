// /api/get-orders.js
import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

    const userEmail = req.query.email;
    if (!userEmail) return res.status(400).json({ error: 'Email is required' });

    try {
        const { rows } = await sql`
            SELECT o.*, oi.product_name, oi.image_url 
            FROM orders o 
            LEFT JOIN order_items oi ON o.id = oi.order_id 
            WHERE o.user_email = ${userEmail} 
            ORDER BY o.created_at DESC
        `;

        return res.status(200).json({ success: true, data: rows });

    } catch (error) {
        console.error('Query error:', error);
        return res.status(500).json({ error: error.message });
    }
}
