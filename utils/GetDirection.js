// Function to call Ola Maps Directions API
import axios from "axios";

export const getOlaDirections = async (originLat, originLng, destinationLat, destinationLng, mode = 'driving') => {
    try {
        const origin = `${originLat},${originLng}`;
        const destination = `${destinationLat},${destinationLng}`;
        const api_key="iuGLoE5atdmsDxasjJxbfiHfv4WcZNh9CyNwtlT3"
        
        const response = await axios.post('https://api.olamaps.io/routing/v1/directions', null, {
            params: {
                origin,
                destination,
                mode,
                api_key,
               
            },
           
        });
        
        return response.data;
    } catch (error) {
        console.log("here is the eroor==>",error)
        throw new Error(`Ola Maps API Error: ${error.message}`);
    }
};
