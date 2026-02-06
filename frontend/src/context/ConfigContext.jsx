import React, { createContext, useState, useEffect, useContext } from 'react';
import { API_BASE_URL } from '../config';

const ConfigContext = createContext();

const initialConfig = {
    name: "",
    fullName: "",
    motto: "",
    principal: { name: "", welcomeTitle: "", welcomeMessage: "" },
    contact: { address: "", email: "", phone: "", hours: "" },
    images: { logo: "", hero: "", principal: "" },
    vision: "",
    mission: "",
    coreValues: [],
    academics: { sss: { science: [] }, calendar: [] },
    management: { vicePrincipals: [] },
    admissions: { formPrice: "", requirements: { sss1: [] }, procedure: [] }
};

export const ConfigProvider = ({ children }) => {
    const [config, setConfig] = useState(initialConfig);
    const [loading, setLoading] = useState(true);


    const fetchConfig = async () => {
        try {
            const res = await fetch('${API_BASE_URL}/api/config');
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();
            setConfig(data);
        } catch (err) {
            console.error("Failed to fetch configuration from backend:", err);
            // Stay with empty object or previous config
        } finally {
            setLoading(false);
        }
    };


    const updateConfig = async (newConfig) => {
        try {
            const res = await fetch('${API_BASE_URL}/api/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newConfig)
            });
            const data = await res.json();
            if (data.success) {
                setConfig(data.config);
                return true;
            }
        } catch (err) {
            console.error("Failed to update configuration:", err);
        }
        return false;
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    return (
        <ConfigContext.Provider value={{ config, loading, updateConfig, refreshConfig: fetchConfig }}>
            {children}
        </ConfigContext.Provider>
    );
};

export const useConfig = () => {
    const context = useContext(ConfigContext);
    if (!context) {
        throw new Error("useConfig must be used within a ConfigProvider");
    }
    return context;
};
