// Enable strict mode for more rigorous error checking
'use strict';

// Import the updateWeather and error404 functions from app.js
import {updateWeather , error404} from "./app.js"

// Default location coordinates (London)
const defaultLoaction="#/weather?lat=51.5073219&lon=-0.1276474";

// Function to get an approximate location based on the user's IP address
const approximatelocation = async () => {
    try {
        // Fetch the user's IP address
        let ipResponse = await fetch("https://api.ipify.org/?format=json");
        let ipData = await ipResponse.json();
        let ip = ipData.ip;

        // Fetch location data based on the IP address
        let locationResponse = await fetch(`https://ipinfo.io/${ip}?token=c177813f87d9fa`);
        let locationData = await locationResponse.json();

        // Extract latitude and longitude from the location data
        const[latitude, longitude] = locationData.loc.split(",");

        // Update the weather based on the latitude and longitude
        updateWeather(`lat=${latitude}`,`lon=${longitude}`)

        // Update the hash part of the URL
        window.location.hash=`#/approximatelocation`;
    } catch (error) {
        console.error("Error fetching location data:", error);
    }
};

// Function to get the current location using the Geolocation API
const currentLoction = ()=>{
    window.navigator.geolocation.getCurrentPosition(res=>{
        const{latitude,longitude}=res.coords;
        updateWeather(`lat=${latitude}`,`lon=${longitude}`)
    },err=>{
        // If there's an error, get the approximate location
        approximatelocation()
    })
}

// Function to update the weather based on a search query
const searchedLoction = query=>updateWeather(...query.split("&"));

// Map of routes to functions
const routes = new Map([
    ["/current-location",currentLoction],
    ["/weather",searchedLoction],
    ["/approximatelocation",approximatelocation]
]);

// Function to check the hash part of the URL and call the appropriate function
const checkHash = ()=>{
    const requestURL = window.location.hash.slice(1);
    const [route , query] = requestURL.includes ? requestURL.split("?") : [requestURL];
    routes.get(route) ? routes.get(route)(query) : error404();
}

// Add event listeners for hashchange and load events
window.addEventListener("hashchange",checkHash)
window.addEventListener("load",()=>{
    if(!window.location.hash){
        navigator.permissions.query({ name: "geolocation" }).then((result) => {
            if (result.state === "granted") 
                window.location.hash="#/current-location";
            else
                approximatelocation()
        })
    }
    else
        checkHash();
})