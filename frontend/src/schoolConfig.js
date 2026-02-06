export const schoolConfig = {
    name: "Government Boys Science Secondary School Jere",
    images: {
        logo: "/images/logo.png.jpg",
        hero: "/images/hero.jpg",
        principal: "/images/principal.png",
    },
    fullName: "Government Boys Science Secondary School Jere",
    motto: "The creative minds",
    principal: {
        name: "Mr Wuddivira Nakka Hussaini",
        welcomeTitle: "From the Principal's Desk",
        welcomeMessage: `"Welcome to our great citadel of learning. At GBSSS JERE, we are committed to raising total children who are academically sound and morally upright. Our curriculum is robust, blending the Nigerian requirement with global best practices."`
    },
    contact: {
        address: "Along Jere-Kagarko road, Jere, Kagarko LGA, Kaduna State, Nigeria",
        email: "info@gbsss.edu.ng",
        phone: "+234 7032562968",
        hours: "Mon - Fri, 8am - 4pm"
    },
    establishmentYear: 2024,
    vision: "To be a model school for academic excellence and character development in Nigeria.",
    mission: "Providing quality education through dedicated teaching, discipline, and a conducive learning environment.",
    historyDate: 1995,
    coreValues: [
        { title: "Discipline", desc: "We believe character is as important as learning." },
        { title: "Excellence", desc: "We strive for the best in all endeavors." },
        { title: "Integrity", desc: "Honesty and transparency are our watchwords." },
        { title: "Hard Work", desc: "Success is 99% perspiration." }
    ],
    socials: {
        facebook: "https://facebook.com/gbsss",
        twitter: "https://twitter.com/gdss",
        instagram: "https://instagram.com/gbsss"
    },
    gallery: [
        { id: 1, title: 'Science Lab', url: 'https://via.placeholder.com/400x300?text=Science+Lab' },
        { id: 2, title: 'Computer Room', url: 'https://via.placeholder.com/400x300?text=Computer+Room' },
        { id: 3, title: 'Football Field', url: 'https://via.placeholder.com/400x300?text=Football+Field' },
        { id: 4, title: 'Main Auditorium', url: 'https://via.placeholder.com/400x300?text=Auditorium' },
        { id: 5, title: 'Library', url: 'https://via.placeholder.com/400x300?text=Library' },
        { id: 6, title: 'Awards Ceremony', url: 'https://via.placeholder.com/400x300?text=Awards' }
    ],
    academics: {
        sss: {
            science: ["Physics", "Chemistry", "Biology", "Further Maths", "Agricultural Science", "Geography", "Technical Drawing"]
        },
        calendar: [
            { term: "1st Term", start: "Sept 8, 2026", end: "Dec 12, 2026", activity: "Inter-house Sports" },
            { term: "2nd Term", start: "Jan 10, 2027", end: "Apr 5, 2027", activity: "Excursion / Career Day" },
            { term: "3rd Term", start: "May 2, 2027", end: "July 30, 2027", activity: "Promotion Exams" }
        ]
    },
    management: {
        vicePrincipals: [
            { name: "Mrs. Funke Ojo", role: "Vice Principal (Academic)", initials: "FO" },
            { name: "Mr. Ibrahim Ahmed", role: "Vice Principal (Admin)", initials: "IA" }
        ]
    },
    admissions: {
        formPrice: "₦2,000",
        requirements: {
            sss1: [
                "BECE / Junior WAEC Result",
                "Transfer Certificate (if applicable)",
                "2 Passport Photographs",
                "Birth Certificate"
            ]
        },
        procedure: [
            "Purchase the admission form from the school admin block (₦2,000).",
            "Fill the form and attach required documents.",
            "Submit to the Vice Principal (Admin).",
            "Wait for the entrance examination date communicating via SMS."
        ]
    }
};
