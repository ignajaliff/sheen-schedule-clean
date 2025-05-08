
import express from "express"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const port = process.env.PORT || 3000

// Servir la carpeta "dist" generada por Vite
app.use(express.static(path.join(__dirname, "dist")))

// Para todas las rutas, enviar index.html (SPA fallback)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"))
})

app.listen(port, () => {
  console.log(`Servidor funcionando en http://localhost:${port}`)
})
