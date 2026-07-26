const os = require('os');

/**
 * Automatically detects the machine's local network IPv4 address (e.g. 192.168.x.x or 10.x.x.x)
 * so that QR codes scanned on mobile devices on the same Wi-Fi network can reach the web portal.
 */
const getLocalNetworkIp = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      // Skip internal 127.0.0.1 and non-IPv4 addresses
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return '127.0.0.1';
};

/**
 * Returns the base client URL depending on environment (Production domain vs Development local IP)
 */
const getClientBaseUrl = (req) => {
  // If production CLIENT_URL is explicitly set, use it
  if (process.env.NODE_ENV === 'production' && process.env.CLIENT_URL) {
    return process.env.CLIENT_URL;
  }

  // If request contains origin or host header (and is not localhost/127.0.0.1), use it
  if (req && req.headers) {
    const origin = req.headers.origin || req.headers.referer;
    if (origin && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
      const urlObj = new URL(origin);
      return `${urlObj.protocol}//${urlObj.host}`;
    }

    const host = req.headers.host;
    if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
      return `http://${host.split(':')[0]}:3000`;
    }
  }

  // Fallback to local network IP for development mobile devices on same Wi-Fi
  const localIp = getLocalNetworkIp();
  const frontendPort = process.env.FRONTEND_PORT || 3000;
  return `http://${localIp}:${frontendPort}`;
};

module.exports = {
  getLocalNetworkIp,
  getClientBaseUrl
};
