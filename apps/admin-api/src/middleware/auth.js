// admin-api uses API key auth — not exposed to public
// in EKS this is also protected by NetworkPolicy (only internal traffic)
// API key comes from AWS Secrets Manager via ESO in production
 
const auth = (req, res, next) => {
  const apiKey = req.headers['x-admin-api-key'];
 
  if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized — invalid or missing API key' });
  }
 
  next();
};
 
module.exports = auth;
