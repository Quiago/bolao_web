import React from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';

/**
 * AnalyticsChart Component
 * Principio de Responsabilidad Única: Solo muestra gráficos de análisis
 * Nota: En el futuro se puede integrar con librerías como Chart.js o Recharts
 */
export const AnalyticsChart = () => {
  // Datos simulados para el gráfico
  const data = [
    { month: 'Ene', places: 5, products: 12 },
    { month: 'Feb', places: 8, products: 19 },
    { month: 'Mar', places: 12, products: 25 },
    { month: 'Abr', places: 15, products: 32 },
    { month: 'May', places: 18, products: 38 },
    { month: 'Jun', places: 22, products: 45 }
  ];

  const maxValue = Math.max(...data.map(d => Math.max(d.places, d.products)));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Lugares</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Productos</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-green-600">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm font-medium">+15%</span>
        </div>
      </div>

      <div className="h-64 flex items-end justify-between gap-2">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full flex flex-col items-center gap-1">
              {/* Barra de productos */}
              <div
                className="w-full bg-green-500 rounded-t-sm transition-all duration-300 hover:bg-green-600"
                style={{
                  height: `${(item.products / maxValue) * 200}px`,
                  minHeight: '4px'
                }}
                title={`${item.products} productos`}
              />
              {/* Barra de lugares */}
              <div
                className="w-full bg-blue-500 rounded-b-sm transition-all duration-300 hover:bg-blue-600"
                style={{
                  height: `${(item.places / maxValue) * 200}px`,
                  minHeight: '4px'
                }}
                title={`${item.places} lugares`}
              />
            </div>
            <span className="text-xs text-gray-500 font-medium">{item.month}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">22</div>
          <div className="text-sm text-gray-500">Total Lugares</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">45</div>
          <div className="text-sm text-gray-500">Total Productos</div>
        </div>
      </div>
    </div>
  );
}; 