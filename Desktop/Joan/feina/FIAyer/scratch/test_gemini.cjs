const { GoogleGenerativeAI } = require("@google/generative-ai");

async function checkModels() {
  const key = "AIzaSyDp4K9kqEFBcLDHwWDAJRK4NxdkYULBw74";
  console.log("Demanant llista de models permesos per la clau...");
  
  try {
    // Utilitzem el mètode fetch directament si l'SDK no ens deixa llistar
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await response.json();
    
    if (data.models) {
      console.log("Models disponibles per a tu:");
      data.models.forEach(m => console.log("- " + m.name));
    } else {
      console.log("Google no ens torna cap model. Error:", JSON.stringify(data));
    }
  } catch (err) {
    console.error("Error en la crida directa:", err.message);
  }
}

checkModels();
