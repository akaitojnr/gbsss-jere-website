import React, { createContext, useState, useEffect, useContext } from 'react';
import { API_BASE_URL } from '../config';

const ConfigContext = createContext();

const initialConfig = {
    name: "Government Boys Science Secondary School Jere",
    fullName: "Government Boys Science Secondary School Jere",
    motto: "The creative minds",
    principal: {
        name: "Mr Wuddivira Nakka Hussaini",
        welcomeTitle: "From the Principal's Desk",
        welcomeMessage: "Welcome to our great citadel of learning."
    },
    contact: {
        address: "Along Jere-Kagarko road, Jere, Kagarko LGA, Kaduna State, Nigeria",
        email: "info@gbsss.edu.ng",
        phone: "+234 7032562968",
        hours: "Mon - Fri, 8am - 4pm"
    },
    images: {
        logo: "/images/logo.png",
        hero: "/images/hero.jpg",
        principal: "/images/principal.png"
    },
    vision: "To be a model school for academic excellence and character development in Nigeria.",
    mission: "Providing quality education through dedicated teaching, discipline, and a conducive learning environment.",
    coreValues: [
        { title: "Discipline", desc: "We believe character is as important as learning." },
        { title: "Excellence", desc: "We strive for the best in all endeavors." },
        { title: "Integrity", desc: "Honesty and transparency are our watchwords." },
        { title: "Hard Work", desc: "Success is 99% perspiration." }
    ],
    academics: { sss: { science: ["Physics", "Chemistry", "Biology", "Further Maths"] }, calendar: [] },
    management: { vicePrincipals: [] },
    admissions: { formPrice: "₦2,000", requirements: { sss1: [] }, procedure: [] }
};

export const ConfigProvider = ({ children }) => {
    const [config, setConfig] = useState(initialConfig);
    const [loading, setLoading] = useState(true);


    const fetchConfig = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/config`);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();

            // Deep merge backend data with initialConfig to ensure all fields exist
            const mergeConfig = (target, source) => {
                const output = { ...target };
                if (source && typeof source === 'object') {
                    Object.keys(source).forEach(key => {
                        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                            if (!(key in target)) {
                                Object.assign(output, { [key]: source[key] });
                            } else {
                                output[key] = mergeConfig(target[key], source[key]);
                            }
                        } else if (source[key] !== undefined && source[key] !== null && source[key] !== '') {
                            Object.assign(output, { [key]: source[key] });
                        }
                    });
                }
                return output;
            };

            setConfig(mergeConfig(initialConfig, data));
        } catch (err) {
            console.error("Failed to fetch configuration from backend:", err);
            // Fallback to initialConfig is already set by useState
        } finally {
            setLoading(false);
        }
    };


    const updateConfig = async (newConfig) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/config`, {
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
