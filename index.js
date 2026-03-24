require('dotenv').config();
const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public')); // Serve o arquivo HTML

// Configuração IA (Corrigi para gemini-1.5-flash que é estável)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Rota para processar a pergunta
app.post('/perguntar', async (req, res) => {
    const { pergunta } = req.body;

    try {
        const promptFinal = `Você é um pirata dos sete mares. Responda de forma técnica, mas com gírias de pirata: ${pergunta}`;
        const result = await model.generateContent(promptFinal);
        const resposta = result.response.text();

        // Gerar ID único para o PDF
        const id = Date.now();
        const nomeArquivo = `resposta_${id}.pdf`;
        const caminhoPDF = path.join(__dirname, 'public', nomeArquivo);

        // Criar o PDF
        const doc = new PDFDocument();
        doc.pipe(fs.createWriteStream(caminhoPDF));
        doc.fontSize(20).text("📜 DIÁRIO DO CAPITÃO GEMINI", { align: 'center' });
        doc.moveDown().fontSize(14).text(`Pergunta: ${pergunta}`);
        doc.moveDown().text(`Resposta: ${resposta}`);
        doc.end();

        res.json({ resposta, pdfUrl: nomeArquivo });

    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    }
});

app.listen(3000, () => {
    console.log("🏴‍☠️ Navio ancorado em http://localhost:3000");
});