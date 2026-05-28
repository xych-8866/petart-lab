// api/printify-catalog.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // 你的 Printify Token 和 Shop ID（已写死）
  const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzN2Q0YmQzMDM1ZmUxMWU5YTgwM2FiN2VlYjNjY2M5NyIsImp0aSI6Ijg0Y2FjNjc1OWYwMjQzODYzNDU4Njk5ZjE4YjU5Njc1YjhjOTBmY2NkODhjYjYwNDhiZDI0YTU3YTMxODk1ZGIwNWExMmI0ZDljMWJkNmRhIiwiaWF0IjoxNzc5OTY0OTQ5Ljg3MzI5OCwibmJmIjoxNzc5OTY0OTQ5Ljg3MzMsImV4cCI6MTgxMTUwMDk0OS44NjgyNjIsInN1YiI6IjI3NDI4NjEyIiwic2NvcGVzIjpbInNob3BzLm1hbmFnZSIsInNob3BzLnJlYWQiLCJjYXRhbG9nLnJlYWQiLCJvcmRlcnMucmVhZCIsIm9yZGVycy53cml0ZSIsInByb2R1Y3RzLnJlYWQiLCJwcm9kdWN0cy53cml0ZSIsIndlYmhvb2tzLnJlYWQiLCJ3ZWJob29rcy53cml0ZSIsInVwbG9hZHMucmVhZCIsInVwbG9hZHMud3JpdGUiLCJwcmludF9wcm92aWRlcnMucmVhZCIsInVzZXIuaW5mbyJdfQ.WxMLEe8esHxVZdEPKSQbYnZHDG_gRN76Db9iwuf2jJJdCCF7_7yGCEMn01jNfjg4AzOsaLQVKqR9wYQ60EiQ_t3ek1EXW8RuRm2ZaV_LWszm2lFS9HLz1y3veP1lhUr-8Se5Mpun-vxI7cvM5o0rvZtwJdqBtVRfnDb9xZFNf4UmFqvg_U1vAD80-LYAAtOBnf5LcG4JlO85MeugTRLEgWpdgYylae3AMvD1NqoF1qJF6o01rtZ-DPCQFjgyAi72uN-kEJd8uBxBt9YT7qGBlDLM1JmfxWeS8rUxa4dD_fPVaCFPjq0YuHkhMXjwg5FgQ8bNc5FsGZg25YpUtF9ZokGDRau8Lno2sPgJLzCh1j37WOdpZs-ALf1_Smzj7jFwkbgmrTk44IpnXybS05Rf5V5x4fRMB2TNoM_GQPaHJcx1UR5YksWxcTbl9RpnNPtRY_4ZtIZ441ETeCM3w4FGrqo9AHcIBUx5MDiZo0iFoK6tRRm0JH6CnzR55YWiX4oCCTTBDq80EIsW2x_UXL_s1lUCMqELUJNI-ty_yEO2dn4rdq4qnxUKK-oWv0sCXeDvGNUlfqlkOmtdOxssKg1kN2jFNFSCYVymBdxZrfVSKnwpfQ5H0oFnEcj1fnP3Wst2yAfRsccU76-uKsCvA18cCL2KCZTBGNJK68bgAU8GCzs';
  const shopId = '27712529';

  try {
    const response = await fetch(`https://api.printify.com/v1/shops/${shopId}/products.json`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ success: false, error: data });
    }

    const products = [];
    if (data.data && Array.isArray(data.data)) {
      for (const product of data.data) {
        if (product.variants && product.variants.length > 0) {
          for (const variant of product.variants) {
            products.push({
              product_name: product.title,
              variant_id: variant.id,
              price: variant.price
            });
          }
        }
      }
    }

    return res.status(200).json({ success: true, data: products });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
