const { sql } = require('@vercel/postgres');
const PRINTFUL_API_URL = 'https://api.printful.com';
const API_KEY = process.env.PRINTFUL_API_KEY;
const MARKUP_RATE = parseFloat(process.env.MARKUP_RATE) || 2.5;

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { rows: cachedProducts } = await sql`SELECT * FROM printful_products LIMIT 1`;
        if (cachedProducts.length > 0) {
            const allProducts = await sql`SELECT * FROM printful_products ORDER BY product_type`;
            return res.status(200).json({ success: true, data: allProducts.rows });
        }
        const response = await fetch(`${PRINTFUL_API_URL}/store/products`, { headers: { 'Authorization': `Bearer ${API_KEY}` } });
        if (!response.ok) throw new Error('Printful API error');
        const result = await response.json();
        const products = result.result || [];
        for (const product of products) {
            for (const variant of product.variants) {
                const price = (parseFloat(variant.price) * MARKUP_RATE).toFixed(2);
                await sql`INSERT INTO printful_products (product_id, variant_id, product_name, product_type, price, image_url, in_stock) VALUES (${product.id}, ${variant.id}, ${product.name}, ${product.type}, ${price}, ${variant.image || ''}, ${variant.in_stock}) ON CONFLICT (variant_id) DO UPDATE SET price = ${price}, updated_at = NOW()`;
            }
        }
        const { rows: newProducts } = await sql`SELECT * FROM printful_products ORDER BY product_type`;
        return res.status(200).json({ success: true, data: newProducts });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
