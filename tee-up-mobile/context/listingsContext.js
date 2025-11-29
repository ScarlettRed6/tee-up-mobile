import { createContext, useState, useEffect, useCallback } from "react";
import { fetchListings as fetchListingsApi } from "../api/listingsApi";

export const ListingsContext = createContext();

export function ListingsProvider({ children }){
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadListings = useCallback(async () => {
        setLoading(true);
        try{
            const result = await fetchListingsApi({ status: 'available' });
            setListings(Array.isArray(result) ? result : []);
        }catch(err){
            console.log("Error fetching listings:", err);
        }finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadListings();
    }, [loadListings]);

    return (
        <ListingsContext.Provider value={{ listings, loading, refreshListings: loadListings }}>
            {children}
        </ListingsContext.Provider>
    );

}
