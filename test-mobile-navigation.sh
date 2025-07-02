#!/bin/bash

echo "==================================="
echo "Testing Mobile Navigation Labels"
echo "==================================="

echo "✅ Starting the application and testing mobile navigation..."

# Start the application
cd /home/quiala/Datos/Proyectos/bolao_web
npm start &
APP_PID=$!

# Wait for the app to start
echo "⏳ Waiting for application to start..."
sleep 5

# Check if the application is running
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Application is running on http://localhost:3000"
    
    # Check the main page HTML for navigation text labels
    echo ""
    echo "🔍 Checking navigation labels in HTML..."
    
    # Fetch the page content and check for navigation elements
    PAGE_CONTENT=$(curl -s http://localhost:3000)
    
    # Check for "Productos" text (should NOT be hidden on mobile)
    if echo "$PAGE_CONTENT" | grep -q '<span>Productos</span>'; then
        echo "✅ 'Productos' text label found (visible on mobile)"
    else
        echo "❌ 'Productos' text label not found or still hidden"
    fi
    
    # Check for "Lugares" text (should NOT be hidden on mobile)
    if echo "$PAGE_CONTENT" | grep -q '<span>Lugares</span>'; then
        echo "✅ 'Lugares' text label found (visible on mobile)"
    else
        echo "❌ 'Lugares' text label not found or still hidden"
    fi
    
    # Check for "Chat" text (should NOT be hidden on mobile)
    if echo "$PAGE_CONTENT" | grep -q '<span>Chat</span>'; then
        echo "✅ 'Chat' text label found (visible on mobile)"
    else
        echo "❌ 'Chat' text label not found or still hidden"
    fi
    
    # Check for "Contacto" text (should NOT be hidden on mobile)
    if echo "$PAGE_CONTENT" | grep -q '<span>Contacto</span>'; then
        echo "✅ 'Contacto' text label found (visible on mobile)"
    else
        echo "❌ 'Contacto' text label not found or still hidden"
    fi
    
    # Check that emoji fallbacks are removed
    echo ""
    echo "🔍 Checking that emoji fallbacks are removed..."
    
    if echo "$PAGE_CONTENT" | grep -q 'sm:hidden.*🛍️'; then
        echo "❌ 'Productos' emoji fallback still present"
    else
        echo "✅ 'Productos' emoji fallback removed"
    fi
    
    if echo "$PAGE_CONTENT" | grep -q 'sm:hidden.*📍'; then
        echo "❌ 'Lugares' emoji fallback still present"
    else
        echo "✅ 'Lugares' emoji fallback removed"
    fi
    
    if echo "$PAGE_CONTENT" | grep -q 'xs:hidden.*📞'; then
        echo "❌ 'Contacto' emoji fallback still present"
    else
        echo "✅ 'Contacto' emoji fallback removed"
    fi
    
    echo ""
    echo "🎯 Navigation Test Summary:"
    echo "- Text labels 'Productos', 'Lugares', 'Chat', and 'Contacto' should now be visible on all screen sizes"
    echo "- Emoji fallbacks should be removed"
    echo "- Icons are preserved alongside text labels"
    
else
    echo "❌ Application failed to start on http://localhost:3000"
fi

# Clean up
echo ""
echo "🧹 Cleaning up..."
kill $APP_PID 2>/dev/null

echo ""
echo "==================================="
echo "Mobile Navigation Test Complete"
echo "==================================="
