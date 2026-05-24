const { sql } = require('@vercel/postgres');
const PRINTFUL_API_URL = 'https://api.printful.com';
const API_KEY = process.env.PRINTFUL_API_KEY;

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { imageUrl, variantId, shippingAddress, userEmail } = req.body;
        const orderNumber = `PA-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const { rows: productRows } = await sql`SELECT * FROM printful_products WHERE variant_id = ${variantId}`;
        if (productRows.length === 0) throw new Error('Product not found');
        const product = productRows[0];

        const response = await fetch(`${PRINTFUL_API_URL}/orders`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                external_id: orderNumber,
                shipping: 'STANDARD',
                recipient: shippingAddress,
                items: [{
                    variant_id: variantId,
                    quantity: 1,
                    files: [{ url: imageUrl, filename: `pet-art-${Date.now()}.jpg`, dpi: 300 }],
                    retail_price: product.price
                }]
            })
        });
        if (!response.ok) throw new Error('Printful order creation failed');
        const orderResult = await response.json();
        const printfulOrderId = orderResult.result.id;

        await sql`INSERT INTO orders (order_number, user_email, status, total_price, shipping_address, printful_order_id) VALUES (${orderNumber}, ${userEmail}, 'pending', ${product.price}, ${JSON.stringify(shippingAddress)}, ${printfulOrderId})`;
        const { rows: orderRows } = await sql`SELECT id FROM orders WHERE order_number = ${orderNumber}`;
        await sql`INSERT INTO order_items (order_id, printful_variant_id, product_name, price, image_url) VALUES (${orderRows[0].id}, ${variantId}, ${product.product_name}, ${product.price}, ${imageUrl})`;
        return res.status(200).json({ success: true, orderNumber, message: 'Order created!' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
