const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGemini() {
    try {
        // You need to set your GEMINI_API_KEY in .env.local first
        const GEMINI_API_KEY = "YOUR_API_KEY_HERE"; // Replace with actual key for testing

        if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_API_KEY_HERE") {
            console.log("Please set your GEMINI_API_KEY in this script or .env.local");
            return;
        }

        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

        const prompt = `Eres un asistente especializado en recomendaciones de comida y lugares en La Habana, Cuba.

El usuario dice: "quiero una hamburguesa"

Tu tarea es:
1. Analizar qué tipo de comida o lugar está buscando el usuario
2. Extraer términos de búsqueda específicos para usar en nuestra API
3. Determinar si necesitas buscar información específica

IMPORTANTE: Responde ÚNICAMENTE con un objeto JSON válido, sin markdown, sin bloques de código, sin explicaciones adicionales.

Formato exacto:
{"searchQuery": "términos de búsqueda específicos", "needsSearch": true, "category": "tipo de establecimiento si es relevante", "location": "ubicación si es mencionada", "intent": "descripción breve de lo que busca el usuario"}`;

        console.log("Sending prompt to Gemini...");
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        console.log("\n=== RAW RESPONSE ===");
        console.log("Type:", typeof text);
        console.log("Length:", text.length);
        console.log("Content:", JSON.stringify(text));
        console.log("\n=== VISIBLE CONTENT ===");
        console.log(text);

        console.log("\n=== RESPONSE OBJECT STRUCTURE ===");
        console.log("result keys:", Object.keys(result));
        console.log("response keys:", Object.keys(response));

        // Try to parse as JSON
        try {
            const parsed = JSON.parse(text);
            console.log("\n=== SUCCESSFULLY PARSED JSON ===");
            console.log(parsed);
        } catch (e) {
            console.log("\n=== JSON PARSE ERROR ===");
            console.log("Error:", e.message);

            // Try cleaning the text
            let cleaned = text.trim();
            cleaned = cleaned.replace(/^```json\s*/i, '');
            cleaned = cleaned.replace(/^```\s*/i, '');
            cleaned = cleaned.replace(/\s*```$/i, '');

            console.log("\n=== CLEANED TEXT ===");
            console.log(JSON.stringify(cleaned));

            try {
                const parsedCleaned = JSON.parse(cleaned);
                console.log("\n=== SUCCESSFULLY PARSED CLEANED JSON ===");
                console.log(parsedCleaned);
            } catch (e2) {
                console.log("\n=== CLEANED JSON PARSE ERROR ===");
                console.log("Error:", e2.message);
            }
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

testGemini();
