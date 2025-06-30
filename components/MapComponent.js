import { useEffect, useRef, useState } from 'react';
import { logMapInteraction } from '../utils/analytics';

let L;

const MapComponent = ({ products = [], selectedProduct = null, onProductSelect = null, mapboxToken = null }) => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markersRef = useRef([]);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [mapError, setMapError] = useState(null);
    const [debugInfo, setDebugInfo] = useState({});

    // Cargar Leaflet
    useEffect(() => {
        const loadLeaflet = async () => {
            if (typeof window !== 'undefined' && !L) {
                try {
                    console.log('Loading Leaflet...');
                    const leaflet = await import('leaflet');
                    L = leaflet.default;

                    // Fix para los iconos de Leaflet
                    delete L.Icon.Default.prototype._getIconUrl;
                    L.Icon.Default.mergeOptions({
                        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
                        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
                        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
                    });

                    console.log('Leaflet loaded successfully');
                    initializeMap();
                } catch (error) {
                    console.error('Error loading Leaflet:', error);
                    setMapError(`Error loading Leaflet: ${error.message}`);
                    setDebugInfo(prev => ({ ...prev, leafletError: error.message }));
                }
            } else if (L) {
                initializeMap();
            }
        };

        loadLeaflet();

        return () => {
            if (mapInstance.current) {
                try {
                    mapInstance.current.remove();
                    mapInstance.current = null;
                } catch (error) {
                    console.warn('Error cleaning up map:', error);
                }
            }
        };
    }, []);

    const initializeMap = () => {
        if (!mapRef.current || mapInstance.current) {
            console.log('Map already initialized or ref not ready');
            return;
        }

        try {
            console.log('Initializing map...');

            // Crear el mapa
            mapInstance.current = L.map(mapRef.current, {
                center: [23.1136, -82.3666], // La Habana
                zoom: 12,
                zoomControl: true,
                attributionControl: true
            });

            console.log('Map instance created');

            // Agregar capa de tiles
            if (mapboxToken) {
                console.log('Using Mapbox tiles');
                L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`, {
                    attribution: '© <a href="https://www.mapbox.com/">Mapbox</a> © <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
                    tileSize: 512,
                    zoomOffset: -1,
                    maxZoom: 18
                }).addTo(mapInstance.current);
            } else {
                console.log('Using OpenStreetMap tiles');
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
                    maxZoom: 18
                }).addTo(mapInstance.current);
            }

            setMapLoaded(true);
            setMapError(null);
            console.log('Map initialized successfully');
        } catch (error) {
            console.error('Error initializing map:', error);
            setMapError(`Error initializing map: ${error.message}`);
            setDebugInfo(prev => ({ ...prev, initError: error.message }));
        }
    };

    // Actualizar marcadores cuando cambien los productos
    useEffect(() => {
        if (mapLoaded && mapInstance.current && L && products.length > 0) {
            console.log('Updating markers for', products.length, 'products');
            updateMarkers();
        }
    }, [mapLoaded, products, selectedProduct]);

    const parseCoordinates = (geo) => {
        try {
            if (!geo) {
                console.log('No geo data provided');
                return null;
            }

            let coords;

            // Si ya es un array, usarlo directamente
            if (Array.isArray(geo)) {
                coords = geo;
                console.log('Geo is already an array:', coords);
            }
            // Si es un string, parsearlo
            else if (typeof geo === 'string') {
                console.log('Parsing geo string:', geo);
                coords = JSON.parse(geo);
            }
            // Si es otro tipo, no es válido
            else {
                console.warn('Invalid geo type:', typeof geo, geo);
                return null;
            }

            // Validar que sea un array con dos números
            if (Array.isArray(coords) && coords.length === 2) {
                const [first, second] = coords;

                if (typeof first === 'number' && typeof second === 'number') {
                    let lat, lng;

                    // Auto-detect coordinate format based on typical ranges:
                    // Latitude: -90 to 90 (usually smaller absolute values for Cuba: ~20-25)
                    // Longitude: -180 to 180 (for Cuba: around -80 to -85)
                    if (Math.abs(first) > Math.abs(second)) {
                        // First value has larger absolute value, likely longitude
                        // Format: [lng, lat]
                        lng = first;
                        lat = second;
                        console.log('Detected [lng, lat] format:', { lng, lat });
                    } else {
                        // First value has smaller absolute value, likely latitude
                        // Format: [lat, lng] (common in our database)
                        lat = first;
                        lng = second;
                        console.log('Detected [lat, lng] format:', { lat, lng });
                    }

                    // Validate final coordinates
                    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                        console.log('✅ Valid coordinates parsed:', { lat, lng });
                        return { lat, lng };
                    } else {
                        console.warn('❌ Coordinates out of valid range:', { lat, lng });
                    }
                }
            }

            console.warn('Invalid coordinates format:', coords);
            return null;
        } catch (error) {
            console.error('Error parsing coordinates:', geo, error);
            return null;
        }
    };

    const formatPrice = (price) => {
        if (typeof price === 'number') {
            return price.toFixed(2);
        }
        return price;
    };

    const updateMarkers = () => {
        console.log('Updating markers...');

        // Limpiar marcadores existentes
        markersRef.current.forEach(marker => {
            mapInstance.current.removeLayer(marker);
        });
        markersRef.current = [];

        if (products.length === 0) {
            console.log('No products to display');
            return;
        }

        const bounds = L.latLngBounds();
        let hasValidCoordinates = false;
        let successCount = 0;
        let errorCount = 0;

        products.forEach((product, index) => {
            try {
                // Parsear coordenadas del campo geo
                const coordinates = parseCoordinates(product.geo);

                if (!coordinates) {
                    console.warn(`No valid coordinates for product ${index}:`, product.name);
                    errorCount++;
                    return;
                }

                const { lat, lng } = coordinates;

                // Crear marcador
                const marker = L.marker([lat, lng]).addTo(mapInstance.current);

                // Crear contenido del popup
                const popupContent = `
                    <div style="padding: 10px; min-width: 200px;">
                        <h3 style="font-weight: bold; margin-bottom: 5px;">${product.product_name}</h3>
                        <p style="color: #666; font-size: 14px; margin-bottom: 5px;">${product.name}</p>
                        <p style="color: #999; font-size: 12px; margin-bottom: 5px;">${product.location}</p>
                        ${product.address ? `<p style="color: #999; font-size: 12px; margin-bottom: 5px;">${product.address}</p>` : ''}
                        <p style="font-size: 18px; font-weight: bold; color: #f97316; margin-bottom: 5px;">$${formatPrice(product.product_price)}</p>
                        ${product.phone && product.phone !== '0' ? `<p style="font-size: 12px;">📞 ${product.phone}</p>` : ''}
                        ${product.delivery ? '<p style="font-size: 12px; color: #10b981;">🚚 Delivery disponible</p>' : ''}
                        ${product.pickup ? '<p style="font-size: 12px; color: #3b82f6;">🛍️ Pickup disponible</p>' : ''}
                    </div>
                `;

                marker.bindPopup(popupContent);

                // Abrir popup si es el producto seleccionado
                if (selectedProduct && selectedProduct.id === product.id) {
                    marker.openPopup();
                }

                // Analytics
                marker.on('popupopen', () => {
                    logMapInteraction('popup_open', product.product_name || product.name);
                });

                if (onProductSelect) {
                    marker.on('click', () => {
                        logMapInteraction('marker_click', product.product_name || product.name);
                        onProductSelect(product);
                    });
                }

                markersRef.current.push(marker);
                bounds.extend([lat, lng]);
                hasValidCoordinates = true;
                successCount++;
            } catch (error) {
                console.error(`Error processing product ${index}:`, product.name, error);
                errorCount++;
            }
        });

        console.log(`Markers update complete. Success: ${successCount}, Errors: ${errorCount}`);
        setDebugInfo(prev => ({ ...prev, markersSuccess: successCount, markersError: errorCount }));

        // Ajustar la vista del mapa
        if (hasValidCoordinates && bounds.isValid()) {
            if (markersRef.current.length === 1) {
                const marker = markersRef.current[0];
                const latlng = marker.getLatLng();
                mapInstance.current.setView(latlng, 16);
                console.log('Centered on single marker');
            } else {
                mapInstance.current.fitBounds(bounds, {
                    padding: [50, 50],
                    maxZoom: 15
                });
                console.log('Fitted bounds for multiple markers');
            }
        } else {
            console.warn('No valid coordinates found, keeping default view');
        }
    };

    // Mostrar información de debug en desarrollo
    const isDev = process.env.NODE_ENV === 'development';

    return (
        <div className="relative w-full h-full">
            <div
                ref={mapRef}
                className="w-full h-full"
                style={{ minHeight: '256px' }} // Asegurar altura mínima
            />

            {/* Loading state */}
            {!mapLoaded && !mapError && (
                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-2"></div>
                        <p className="text-gray-500">Cargando mapa...</p>
                    </div>
                </div>
            )}

            {/* Error state */}
            {mapError && (
                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center p-4">
                    <div className="text-center max-w-sm">
                        <p className="text-red-500 mb-2">⚠️ Error con el mapa</p>
                        <p className="text-gray-600 text-sm mb-2">{mapError}</p>
                        <p className="text-gray-500 text-xs">Verifica la consola para más detalles</p>
                    </div>
                </div>
            )}

            {/* Debug info (solo en desarrollo) */}
            {isDev && Object.keys(debugInfo).length > 0 && (
                <div className="absolute bottom-2 left-2 bg-white p-2 rounded shadow text-xs">
                    <div className="font-bold mb-1">Debug Info:</div>
                    {Object.entries(debugInfo).map(([key, value]) => (
                        <div key={key}>{key}: {value}</div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MapComponent;