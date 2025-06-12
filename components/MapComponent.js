import { useEffect, useRef, useState } from 'react';
import { logMapInteraction } from '../utils/analytics';

let L;

const MapComponent = ({ products = [], selectedProduct = null, onProductSelect = null, mapboxToken = null }) => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markersRef = useRef([]);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [mapError, setMapError] = useState(null);

    // Cargar Leaflet y inicializar mapa
    useEffect(() => {
        const loadLeaflet = async () => {
            if (typeof window !== 'undefined' && !L) {
                try {
                    const leaflet = await import('leaflet');
                    L = leaflet.default;

                    // Fix para los iconos de Leaflet
                    delete L.Icon.Default.prototype._getIconUrl;
                    L.Icon.Default.mergeOptions({
                        iconRetinaUrl: '/leaflet/marker-icon-2x.png',
                        iconUrl: '/leaflet/marker-icon.png',
                        shadowUrl: '/leaflet/marker-shadow.png',
                    });

                    initializeMap();
                } catch (error) {
                    console.error('Error loading Leaflet:', error);
                    setMapError('Error cargando el mapa');
                }
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
        if (!mapRef.current || mapInstance.current) return;

        try {
            // Coordenadas de La Habana como centro por defecto
            mapInstance.current = L.map(mapRef.current, {
                center: [23.1136, -82.3666],
                zoom: 11,
                zoomControl: true,
                attributionControl: true,
                preferCanvas: true // Better performance for many markers
            });

            // Usar Mapbox si el token está disponible, sino OpenStreetMap
            if (mapboxToken) {
                L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`, {
                    attribution: '© <a href="https://www.mapbox.com/">Mapbox</a> © <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
                    tileSize: 512,
                    zoomOffset: -1,
                    maxZoom: 18
                }).addTo(mapInstance.current);
            } else {
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
                    maxZoom: 18
                }).addTo(mapInstance.current);
            }

            setMapLoaded(true);
            setMapError(null);
        } catch (error) {
            console.error('Error initializing map:', error);
            setMapError('Error inicializando el mapa');
        }
    };

    // Actualizar marcadores cuando cambien los productos
    useEffect(() => {
        if (mapLoaded && mapInstance.current && L) {
            updateMarkers();
        }
    }, [mapLoaded, products, selectedProduct]);

    const parseCoordinates = (geoString) => {
        try {
            if (!geoString) return null;

            // Parse the geo string which should be in format: "[-82.33339919218133, 23.154970416175193]"
            const coords = JSON.parse(geoString);

            if (Array.isArray(coords) && coords.length === 2) {
                const [lng, lat] = coords;

                // Validate coordinates are within reasonable bounds
                if (
                    typeof lat === 'number' && typeof lng === 'number' &&
                    lat >= -90 && lat <= 90 &&
                    lng >= -180 && lng <= 180
                ) {
                    return { lat, lng };
                }
            }

            return null;
        } catch (error) {
            console.warn('Error parsing coordinates:', geoString, error);
            return null;
        }
    };

    // Simple geocoding function for Cuban addresses
    const geocodeAddress = (address, location) => {
        // Cuban locations mapping - you can expand this
        const cubanLocations = {
            'habana del este': { lat: 23.154970, lng: -82.333399 },
            'centro habana': { lat: 23.133, lng: -82.383 },
            'vedado': { lat: 23.133, lng: -82.383 },
            'miramar': { lat: 23.120, lng: -82.450 },
            'habana vieja': { lat: 23.135, lng: -82.359 },
            'playa': { lat: 23.140, lng: -82.450 },
            'arroyo naranjo': { lat: 23.047, lng: -82.373 },
            'boyeros': { lat: 23.007, lng: -82.397 },
            'plaza de la revolución': { lat: 23.131, lng: -82.383 },
            'cerro': { lat: 23.120, lng: -82.366 },
        };

        // Try to match location first
        if (location) {
            const locationKey = location.toLowerCase();
            for (const [key, coords] of Object.entries(cubanLocations)) {
                if (locationKey.includes(key)) {
                    // Add small random offset to avoid overlapping markers
                    return {
                        lat: coords.lat + (Math.random() - 0.5) * 0.01,
                        lng: coords.lng + (Math.random() - 0.5) * 0.01
                    };
                }
            }
        }

        // Try to match address
        if (address) {
            const addressKey = address.toLowerCase();
            for (const [key, coords] of Object.entries(cubanLocations)) {
                if (addressKey.includes(key)) {
                    return {
                        lat: coords.lat + (Math.random() - 0.5) * 0.01,
                        lng: coords.lng + (Math.random() - 0.5) * 0.01
                    };
                }
            }
        }

        // Default to central Havana with random offset
        return {
            lat: 23.1136 + (Math.random() - 0.5) * 0.05,
            lng: -82.3666 + (Math.random() - 0.5) * 0.05
        };
    };

    const formatPrice = (price) => {
        if (typeof price === 'number') {
            return price.toFixed(2);
        }
        if (typeof price === 'string') {
            const numPrice = parseFloat(price);
            return isNaN(numPrice) ? price : numPrice.toFixed(2);
        }
        return price;
    };

    const updateMarkers = async () => {
        // Limpiar marcadores existentes
        markersRef.current.forEach(marker => {
            mapInstance.current.removeLayer(marker);
        });
        markersRef.current = [];

        if (products.length === 0) return;

        const bounds = L.latLngBounds();
        let hasValidCoordinates = false;

        for (const product of products) {
            try {
                // Parse coordinates from the geo field
                let coordinates = parseCoordinates(product.geo);

                if (!coordinates) {
                    // Fallback to geocoding based on address and location
                    console.log(`Geocoding address for product ${product.name}: ${product.address || product.location}`);
                    coordinates = geocodeAddress(product.address, product.location);
                }

                const { lat, lng } = coordinates;

                const marker = L.marker([lat, lng]).addTo(mapInstance.current);

                // Create more detailed popup content
                const popupContent = `
          <div class="p-3 min-w-[200px]">
            <h3 class="font-semibold text-sm mb-1">${product.product_name || product.name}</h3>
            <p class="text-xs text-gray-600 mb-1">${product.name}</p>
            <p class="text-xs text-gray-500 mb-2">${product.location}</p>
            ${product.address ? `<p class="text-xs text-gray-500 mb-2">${product.address}</p>` : ''}
            <p class="text-sm font-bold text-orange-500 mb-2">$${formatPrice(product.product_price)}</p>
            ${product.phone ? `<p class="text-xs text-gray-600">📞 ${product.phone}</p>` : ''}
            ${product.delivery ? '<p class="text-xs text-green-600">🚚 Delivery disponible</p>' : ''}
            ${product.pickup ? '<p class="text-xs text-blue-600">🛍️ Pickup disponible</p>' : ''}
          </div>
        `;

                marker.bindPopup(popupContent, {
                    maxWidth: 250,
                    closeButton: true,
                    autoClose: false
                });

                // Add analytics tracking for popup open
                marker.on('popupopen', () => {
                    logMapInteraction('popup_open', product.product_name || product.name);
                });

                // Highlight selected product
                if (selectedProduct && selectedProduct.id === product.id) {
                    marker.openPopup();
                    // You could also change marker style here if needed
                }

                if (onProductSelect) {
                    marker.on('click', () => {
                        logMapInteraction('marker_click', product.product_name || product.name);
                        onProductSelect(product);
                    });
                }

                markersRef.current.push(marker);
                bounds.extend([lat, lng]);
                hasValidCoordinates = true;
            } catch (error) {
                console.warn('Error processing product:', product.name, error);
            }
        }

        // Ajustar la vista del mapa
        if (hasValidCoordinates && bounds.isValid()) {
            // If only one marker, center on it with a good zoom level
            if (markersRef.current.length === 1) {
                const marker = markersRef.current[0];
                const latlng = marker.getLatLng();
                mapInstance.current.setView(latlng, 15);
            } else {
                // Multiple markers, fit bounds with padding
                mapInstance.current.fitBounds(bounds, {
                    padding: [20, 20],
                    maxZoom: 15
                });
            }
        } else if (products.length > 0 && !hasValidCoordinates) {
            // If no valid coordinates but we have products, show default Havana view
            mapInstance.current.setView([23.1136, -82.3666], 12);
        }
    };

    return (
        <div className="relative w-full h-full">
            <div ref={mapRef} className="w-full h-full" />
            {!mapLoaded && !mapError && (
                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-2"></div>
                        <p className="text-gray-500">Cargando mapa...</p>
                    </div>
                </div>
            )}
            {mapError && (
                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-red-500 mb-2">⚠️ {mapError}</p>
                        <p className="text-gray-500 text-sm">Verifica tu conexión a internet</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MapComponent;