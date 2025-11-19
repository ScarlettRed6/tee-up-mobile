import { createContext, useState, useEffect } from "react";
import api from "../api/axiosInstance";

export const ListingsContext = createContext();

export function ListingsProvider({ children }){
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchListings = async () => {
        setLoading(true);
        try{
            const res = await api.get("/listings");
            console.log(res.data);
            setListings(res.data.result);
        }catch(err){
            console.log("Error fetching listings:", err);
        }finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, []);

    return (
        <ListingsContext.Provider value={{ listings, loading, refreshListings: fetchListings }}>
            {children}
        </ListingsContext.Provider>
    );

}
