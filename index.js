require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const readline = require('readline'); // Interface de usuário
const PDFDocument = require('pdfkit'); // Gerador de PDF
const fs = require('fs'); // Sistema de arquivos

// 1. Configuração da IA
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Usando modelo estável para evitar erro 404
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// 2. Configuração da Interface de Chat (Terminal)
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// 3. Função para Criar o PDF
function gerarPDF(pergunta, resposta, id) {
    const nomeArquivo = `resposta_pirata_${id}.pdf`;
    const doc = new PDFDocument();

    doc.pipe(fs.createWriteStream(nomeArquivo));

    // Estilização do PDF
    doc.fontSize(20).text("📜 DIÁRIO DE BORDO DO CAPITÃO GEMINI", { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).font('Helvetica-Bold').text("Pergunta do Marujo:");
    doc.fontSize(12).font('Helvetica').text(pergunta);
    doc.moveDown();
    doc.fontSize(14).font('Helvetica-Bold').text("Resposta da IA:");
    doc.fontSize(12).font('Helvetica').text(resposta);
    doc.moveDown();
    doc.fontSize(10).text(`Gerado em: ${new Date().toLocaleString()}`, { align: 'right' });

    doc.end();
    return nomeArquivo;
}

// 4. Função Principal (O Chat)
async function iniciarChat() {
    console.log("\n================================================");
    console.log("🏴‍☠️ BEM-VINDO AO NAVIO DO CAPITÃO GEMINI!");
    console.log("   (Digite sua pergunta ou 'sair' para fugir)");
    console.log("================================================\n");

    let contador = 1;

    const perguntar = () => {
        rl.question("👤 Marujo diz: ", async (input) => {
            if (input.toLowerCase() === 'sair') {
                console.log("\n🦜 Arrr! Até a próxima, terra à vista!");
                rl.close();
                return;
            }

            try {
                process.stdout.write("🤖 O Capitão está escrevendo com a pena... ");

                // Engenharia de Prompt (Persona Pirata aplicada a qualquer pergunta)
                const promptFinal = `Você é um pirata dos sete mares. Responda à seguinte pergunta de forma técnica, mas usando muitas gírias de pirata: ${input}`;

                const result = await model.generateContent(promptFinal);
                const resposta = result.response.text();

                // Limpa o aviso de "escrevendo" e mostra a resposta
                readline.cursorTo(process.stdout, 0);
                console.log(`\n\n🤖 [CAPITÃO]:\n${resposta}\n`);

                // Gera o PDF
                const pdfCriado = gerarPDF(input, resposta, contador);
                console.log(`✅ Documento selado e guardado: ${pdfCriado}\n`);
                
                contador++;

            } catch (erro) {
                console.error("\n❌ Tempestade à vista! Erro:", erro.message);
            }

            perguntar(); // Volta a perguntar
        });
    };

    perguntar();
}

iniciarChat();