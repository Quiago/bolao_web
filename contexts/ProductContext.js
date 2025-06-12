import { createContext, useContext, useState } from 'react';

const ProductContext = createContext();

export function ProductProvider({ children }) {
    const [searchResults, setSearchResults] = useState([]);
    const [lastSearch, setLastSearch] = useState({
        query: '',
        filters: {}
    });

    const getProductById = (id) => {
        return searchResults.find(product => product.id === id);
    };

    const value = {
        searchResults,
        setSearchResults,
        lastSearch,
        setLastSearch,
        getProductById
    };

    return (
        <ProductContext.Provider value={value}>
            {children}
        </ProductContext.Provider>
    );
}

export function useProducts() {
    const context = useContext(ProductContext);
    if (!context) {
        throw new Error('useProducts must be used within a ProductProvider');
    }
    return context;
}