const fs = require("fs");
const path = require("path");

let citiesData = null;

// Load cities data from JSON file
function loadCitiesData() {
  if (!citiesData) {
    const filePath = path.join(__dirname, "../data/indian-cities.json");
    try {
      const data = fs.readFileSync(filePath, "utf8");
      citiesData = JSON.parse(data);
    } catch (error) {
      console.error("Error loading cities data:", error);
      citiesData = [];
    }
  }
  return citiesData;
}

// Get coordinates for a city (case-insensitive, whitespace-trimmed)
function getCityCoordinates(cityName) {
  if (!cityName) return null;

  const cities = loadCitiesData();
  const normalizedCity = cityName.trim().toLowerCase();

  const city = cities.find((c) => c.city.toLowerCase() === normalizedCity);
  return city ? { latitude: city.latitude, longitude: city.longitude } : null;
}

// Haversine formula: Calculate distance between two lat/lng points (in km)
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance);
}

// Convert distance (km) to shipping charge (₹1 per 1km)
function distanceToShippingCharge(distanceKm) {
  if (distanceKm === 0) return 0; // Same city = free
  return Math.round(distanceKm); // ₹1 per 1km
}

// Main function: Get shipping charge from two city names
function getShippingChargeByDistance(buyerCity, sellerCity) {
  const buyerCoords = getCityCoordinates(buyerCity);
  const sellerCoords = getCityCoordinates(sellerCity);

  // Fallback to ₹99 if city not found
  if (!buyerCoords || !sellerCoords) {
    console.warn(`City not found - buyer: ${buyerCity}, seller: ${sellerCity}`);
    return 99;
  }

  const distance = calculateDistance(
    buyerCoords.latitude,
    buyerCoords.longitude,
    sellerCoords.latitude,
    sellerCoords.longitude,
  );

  return distanceToShippingCharge(distance);
}

// Get distance between two cities (for display)
function getDistanceBetweenCities(buyerCity, sellerCity) {
  const buyerCoords = getCityCoordinates(buyerCity);
  const sellerCoords = getCityCoordinates(sellerCity);

  if (!buyerCoords || !sellerCoords) return null;

  return calculateDistance(
    buyerCoords.latitude,
    buyerCoords.longitude,
    sellerCoords.latitude,
    sellerCoords.longitude,
  );
}

module.exports = {
  getCityCoordinates,
  calculateDistance,
  distanceToShippingCharge,
  getShippingChargeByDistance,
  getDistanceBetweenCities,
};
