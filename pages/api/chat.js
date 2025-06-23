import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { userMessage } = req.body;

        if (!userMessage) {
            return res.status(400).json({ error: 'User message is required' });
        }

        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        if (!GEMINI_API_KEY) {
            return res.status(500).json({ error: 'Gemini API key not configured' });
        }

        // Initialize Gemini AI
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Step 1: Analyze user intent and extract search terms
        const intentPrompt = `Eres un asistente que analiza mensajes de usuarios para extraer información de búsqueda.

El usuario dice: "${userMessage}"

Tu tarea es SOLO extraer información EXPLÍCITA del mensaje:
1. Extraer términos de búsqueda mencionados por el usuario
2. Extraer ubicación SOLO si el usuario la menciona
3. NO agregues categorías o filtros que el usuario no mencionó explícitamente
4. NO inventes información

IMPORTANTE: Responde ÚNICAMENTE con un objeto JSON válido, sin markdown, sin explicaciones adicionales.

Formato exacto:
{"searchQuery": "solo lo que el usuario menciona", "needsSearch": true/false, "location": "solo si mencionada explícitamente", "intent": "descripción breve"}

Ejemplos:
- Usuario: "quiero una hamburguesa" → {"searchQuery": "hamburguesa", "needsSearch": true, "location": "", "intent": "buscar hamburguesa"}
- Usuario: "hola" → {"searchQuery": "", "needsSearch": false, "location": "", "intent": "saludo"}
- Usuario: "algo dulce en vedado" → {"searchQuery": "dulce", "needsSearch": true, "location": "vedado", "intent": "buscar algo dulce en vedado"}
- Usuario: "restaurantes en plaza" → {"searchQuery": "restaurantes", "needsSearch": true, "location": "plaza", "intent": "buscar restaurantes en plaza"}`;

        const intentResult = await model.generateContent(intentPrompt);
        const intentText = intentResult.response.text();

        // Debug: Log the raw response
        console.log('Raw Gemini response:', JSON.stringify(intentText));
        console.log('Response type:', typeof intentText);
        console.log('Response length:', intentText.length);

        let analysisData;
        try {
            // Clean the response text to extract JSON
            let cleanedText = intentText.trim();

            // Remove common markdown formatting
            cleanedText = cleanedText.replace(/^```json\s*/i, '');
            cleanedText = cleanedText.replace(/^```\s*/i, '');
            cleanedText = cleanedText.replace(/\s*```$/i, '');
            cleanedText = cleanedText.replace(/^\`+/g, '');
            cleanedText = cleanedText.replace(/\`+$/g, '');

            // Find JSON object in the text
            const jsonMatch = cleanedText.match(/\{.*\}/s);
            if (jsonMatch) {
                cleanedText = jsonMatch[0];
            }

            cleanedText = cleanedText.trim();
            console.log('Cleaned intent text:', JSON.stringify(cleanedText));

            analysisData = JSON.parse(cleanedText);
            console.log('Parsed analysis data:', analysisData);

        } catch (e) {
            console.error('Error parsing intent analysis:', e);
            console.error('Raw response:', intentText);
            console.error('Cleaned text:', cleanedText);

            // Fallback: create a basic analysis
            analysisData = {
                searchQuery: userMessage,
                needsSearch: true,
                location: "",
                intent: "búsqueda general"
            };
            console.log('Using fallback analysis:', analysisData);
        }

        // Step 2: If needs search, call our search API
        let searchResults = [];
        if (analysisData.needsSearch && analysisData.searchQuery) {
            try {
                const searchUrl = new URL('/api/search', req.headers.origin || 'http://localhost:3000');
                searchUrl.searchParams.append('query', analysisData.searchQuery);
                // Only add location if explicitly mentioned by user
                if (analysisData.location) searchUrl.searchParams.append('location', analysisData.location);

                const searchResponse = await fetch(searchUrl.toString());
                const searchData = await searchResponse.json();
                searchResults = searchData.products || [];
            } catch (searchError) {
                console.error('Error calling search API:', searchError);
                // Continue without search results
            }
        }

        // Step 3: Generate final recommendation using search results
        const recommendationPrompt = `
Eres un asistente amigable que ayuda a los usuarios con recomendaciones basadas ÚNICAMENTE en datos reales.

Usuario preguntó: "${userMessage}"

${searchResults.length > 0 ? `
DATOS ENCONTRADOS (usar SOLO esta información):
${searchResults.slice(0, 5).map(product => `
- ${product.product_name} en ${product.name}
  Precio: $${product.product_price}
  Ubicación: ${product.location}
  ${product.description ? `Descripción: ${product.description}` : ''}
  Teléfono: ${product.phone}
  ${product.delivery ? 'Con delivery' : ''} ${product.pickup ? 'Con pickup' : ''}
`).join('\n')}
` : 'NO se encontraron resultados en la búsqueda.'}

INSTRUCCIONES ESTRICTAS:
1. Responde en español de manera conversacional y amigable
2. USA ÚNICAMENTE la información de los datos encontrados arriba
3. NO inventes, no agregues, no supongas información que no esté en los datos
4. Si no hay resultados, di claramente que no se encontraron resultados para esa búsqueda
5. Si hay resultados, menciona SOLO lo que aparece en los datos (nombres, precios, ubicaciones)
6. Incluye precios exactos como aparecen en los datos
7. Menciona delivery/pickup solo si aparece en los datos
8. NO agregues consejos generales o información externa

Máximo 150 palabras. Sé directo y preciso.
`;

        const recommendationResult = await model.generateContent(recommendationPrompt);
        const recommendation = recommendationResult.response.text();

        res.status(200).json({
            message: recommendation,
            searchResults: searchResults.slice(0, 3), // Return top 3 results for reference
            analysis: analysisData
        });

    } catch (error) {
        console.error('Gemini API error:', error);
        res.status(500).json({
            error: 'Error generating recommendation',
            details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
}
