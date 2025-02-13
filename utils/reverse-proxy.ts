import http from "http"
import httpProxy from "http-proxy"

const proxy = httpProxy.createProxyServer({})
const targetHosts: { [key: string]: number } = {}

const server = http.createServer((req, res) => {
  const targetUrl = req.url?.slice(1) // Remove the leading '/'
  if (!targetUrl) {
    res.writeHead(400, { "Content-Type": "text/plain" })
    res.end("Bad Request: Missing target URL")
    return
  }

  const targetHost = new URL(targetUrl).host
  const currentTime = Date.now()

  // Simple rate limiting
  if (targetHosts[targetHost] && currentTime - targetHosts[targetHost] < 1000) {
    res.writeHead(429, { "Content-Type": "text/plain" })
    res.end("Too Many Requests")
    return
  }

  targetHosts[targetHost] = currentTime

  proxy.web(req, res, { target: targetUrl }, (err) => {
    console.error("Proxy error:", err)
    res.writeHead(500, { "Content-Type": "text/plain" })
    res.end("Proxy Error")
  })
})

const PORT = 3001

server.listen(PORT, () => {
  console.log(`Reverse proxy server is running on http://localhost:${PORT}`)
})

