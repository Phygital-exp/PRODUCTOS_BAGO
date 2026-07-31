const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const app = express();

const PORT = process.env.PORT;
const AUTH_HEADERS = {
    Authorization: "Token 9b7661d9292aab2c339b95bf251063791c2a62ff",
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (compatible; BagoProxy/1.0)",
    Accept: "application/json",
};

app.use(cors());

app.get("/api/Bago/productos", async (req, res) => {
    try {
        const apiUrl = "https://botai.smartdataautomation.com/api_backend_ai/dinamic-db/report/119/productos_bago";

        console.log(`Consultando API: ${apiUrl}`);

        const response = await fetch(apiUrl, { headers: AUTH_HEADERS });
        const rawBody = await response.text();

        let data;
        try {
            data = JSON.parse(rawBody);
        } catch (parseErr) {
            console.error(`El backend respondió ${response.status} con contenido no-JSON:`, rawBody.slice(0, 300));
            return res.status(502).json({ error: "El backend no devolvió JSON válido", status: response.status });
        }

        if (!response.ok) {
            console.error(`El backend respondió ${response.status}:`, data);
            return res.status(response.status).json(data);
        }

        console.log(`Backend OK (${response.status}), registros:`, Array.isArray(data) ? data.length : Array.isArray(data.result) ? data.result.length : 'formato inesperado');
        res.json(data);
    } catch (err) {
        console.error("Error en el proxy productos Bago:", err);
        res.status(500).json({ error: "Error al obtener datos de productos Bago" });
    }
});


app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
});
