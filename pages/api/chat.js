import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { userMessage, searchMode = 'productos' } = req.body;

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
3. Determinar si busca PRODUCTOS (comidas, bebidas, artículos) o LUGARES (restaurantes, cafeterías, establecimientos)
4. NO agregues categorías o filtros que el usuario no mencionó explícitamente
5. NO inventes información

IMPORTANTE: Responde ÚNICAMENTE con un objeto JSON válido, sin markdown, sin explicaciones adicionales.
URGENTE: TU NOMBRE ES BOLAO Y NO RESPONDAS PREGUNTAS QUE NO TENGAN QUE VER CON BUSQUEDAS DE COMIDA, SI LA PREGUNTA NO ES SOBRE COMIDA O LUGARES, REDIRIGE LA PREGUNTA HACIA UNA BUSQUEDA DE COMIDA O REALIZA TU UNA SUGERENCIA DE UNA PREGUNTA COMO CON ESO NO TE PUEDO AYUDAR PERO QUE QUIERES COMER

Formato exacto:
{"searchQuery": "solo lo que el usuario menciona", "needsSearch": true/false, "location": "solo si mencionada explícitamente", "searchType": "productos/lugares", "intent": "descripción breve"}

Ejemplos:
- Usuario: "quiero una hamburguesa" → {"searchQuery": "hamburguesa", "needsSearch": true, "location": "", "searchType": "productos", "intent": "buscar hamburguesa"}
- Usuario: "restaurantes en vedado" → {"searchQuery": "restaurantes", "needsSearch": true, "location": "vedado", "searchType": "lugares", "intent": "buscar restaurantes en vedado"}
- Usuario: "hola" → {"searchQuery": "", "needsSearch": false, "location": "", "searchType": "productos", "intent": "saludo"}
- Usuario: "algo dulce en plaza" → {"searchQuery": "dulce", "needsSearch": true, "location": "plaza", "searchType": "productos", "intent": "buscar algo dulce en plaza"}
- Usuario: "cafeterías cerca" → {"searchQuery": "cafeterías", "needsSearch": true, "location": "", "searchType": "lugares", "intent": "buscar cafeterías"}`;

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
                searchType: searchMode === 'lugares' ? 'lugares' : 'productos',
                intent: "búsqueda general"
            };
            console.log('Using fallback analysis:', analysisData);
        }

        // Step 2: If needs search, call appropriate search API
        let searchResults = [];
        if (analysisData.needsSearch && analysisData.searchQuery) {
            try {
                const isPlacesSearch = analysisData.searchType === 'lugares';
                const searchUrl = new URL(
                    isPlacesSearch ? '/api/places/search' : '/api/search',
                    req.headers.origin || 'http://localhost:3000'
                );
                searchUrl.searchParams.append('query', analysisData.searchQuery);
                // Only add location if explicitly mentioned by user
                if (analysisData.location) searchUrl.searchParams.append('location', analysisData.location);

                const searchResponse = await fetch(searchUrl.toString());
                const searchData = await searchResponse.json();

                if (analysisData.searchType === 'lugares') {
                    searchResults = searchData.places || [];
                } else {
                    searchResults = searchData.products || [];
                }
            } catch (searchError) {
                console.error('Error calling search API:', searchError);
                // Continue without search results
            }
        }

        // Step 3: Generate final recommendation using search results
        const isPlacesSearch = analysisData.searchType === 'lugares';
        const recommendationPrompt = `
Eres un asistente amigable que ayuda a los usuarios con recomendaciones basadas ÚNICAMENTE en datos reales.

Usuario preguntó: "${userMessage}"

${searchResults.length > 0 ? `
DATOS ENCONTRADOS (usar SOLO esta información):
${searchResults.slice(0, 5).map(item => {
            if (isPlacesSearch) {
                return `
- ${item.name}
  Dirección: ${item.address || 'No especificada'}
  Tipo: ${item.type || 'No especificado'}
  Teléfono: ${item.phone || 'No disponible'}
  ${item.web ? `Web: ${item.web}` : ''}
  ${item.email ? `Email: ${item.email}` : ''}
`;
            } else {
                return `
- ${item.product_name} en ${item.name}
  Precio: $${item.product_price}
  Ubicación: ${item.location}
  ${item.description ? `Descripción: ${item.description}` : ''}
  Teléfono: ${item.phone}
  ${item.delivery ? 'Con delivery' : ''} ${item.pickup ? 'Con pickup' : ''}
`;
            }
        }).join('\n')}
` : 'NO se encontraron resultados en la búsqueda.'}

INSTRUCCIONES ESTRICTAS:
1. Responde en español de manera conversacional y amigable
2. USA ÚNICAMENTE la información de los datos encontrados arriba
3. NO inventes, no agregues, no supongas información que no esté en los datos
4. Si no hay resultados, di claramente que no se encontraron resultados para esa búsqueda
5. Si hay resultados, menciona SOLO lo que aparece en los datos
${isPlacesSearch ?
                '6. Para lugares: menciona nombre, dirección, tipo, teléfono, web o email si están disponibles' :
                '6. Para productos: incluye precios exactos como aparecen en los datos y menciona delivery/pickup solo si aparece en los datos'
            }
7. NO agregues consejos generales o información externa

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
