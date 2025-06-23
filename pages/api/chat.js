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
        const intentPrompt = `Eres un asistente especializado en recomendaciones de comida y lugares en La Habana, Cuba.

El usuario dice: "${userMessage}"

Tu tarea es:
1. Analizar qué tipo de comida o lugar está buscando el usuario
2. Extraer términos de búsqueda específicos para usar en nuestra API
3. Determinar si necesitas buscar información específica

IMPORTANTE: Responde ÚNICAMENTE con un objeto JSON válido, sin markdown ni **, sin bloques de código, sin explicaciones adicionales y no iventes información que no devuelva la api

Formato exacto:
{"searchQuery": "términos de búsqueda específicos", "needsSearch": true, "category": "tipo de establecimiento si es relevante", "location": "ubicación si es mencionada", "intent": "descripción breve de lo que busca el usuario"}

Ejemplos:
- Usuario: "quiero una hamburguesa rica" → {"searchQuery": "hamburguesa", "needsSearch": true, "category": "restaurantes", "location": "", "intent": "buscar hamburguesas"}
- Usuario: "hola" → {"searchQuery": "", "needsSearch": false, "category": "", "location": "", "intent": "saludo"}
- Usuario: "algo dulce en vedado" → {"searchQuery": "dulce", "needsSearch": true, "category": "dulcerias", "location": "Vedado", "intent": "buscar postres en Vedado"}`;

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
                category: "",
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
                if (analysisData.category) searchUrl.searchParams.append('type', analysisData.category);
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
Eres un asistente amigable especializado en recomendaciones de comida y lugares en La Habana, Cuba.

Usuario preguntó: "${userMessage}"
Análisis: ${analysisData.intent}

${searchResults.length > 0 ? `
Encontré estos productos/lugares relevantes:
${searchResults.slice(0, 5).map(product => `
- ${product.product_name} en ${product.name}
  Precio: $${product.product_price}
  Ubicación: ${product.location}
  ${product.description ? `Descripción: ${product.description}` : ''}
  Teléfono: ${product.phone}
  ${product.delivery ? 'Con delivery' : ''} ${product.pickup ? 'Con pickup' : ''}
`).join('\n')}
` : ''}

Instrucciones:
1. Responde de manera conversacional y amigable en español
2. ${searchResults.length > 0 ? 'Haz recomendaciones específicas basadas en los resultados encontrados' : 'Da recomendaciones generales sobre comida en La Habana'}
3. Incluye precios cuando sea relevante
4. Menciona opciones de delivery/pickup si están disponibles
5. Da consejos útiles sobre dónde encontrar lo que buscan
6. Mantén un tono casual y local
7. Si no encontraste resultados específicos, sugiere categorías similares o lugares populares en La Habana

Máximo 200 palabras.
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
