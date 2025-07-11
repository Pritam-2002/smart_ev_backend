export const EnrichEVSationData=(rawlocations)=>{
if (!rawlocations) {
    throw new Error('Locations needed to enrich')
};

const ArrayRawLocations=Array.isArray(rawlocations)?rawlocations:Array.from(rawlocations);
return ArrayRawLocations.map((place)=>{
 const mockBatterySwappingAvailable = Math.random() < 0.5; 
    const mockSlotCount = Math.floor(Math.random() * 10) + 1; // 1 to 10 slots
return{
     place_id: place.place_id,
      name: place.name || "Unknown Station",
      address: place.address || place.vicinity || "No Address",
      location: place.location || place.geometry?.location || {},
      batterySwappingAvailable: mockBatterySwappingAvailable, // Boolean
      slotsAvailable: mockSlotCount,                     // Number
      type: place.type || "ev_station",
      source: "olamaps",
}
})
}