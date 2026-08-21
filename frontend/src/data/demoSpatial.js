function ocean(id, lng, lat, temp, salinity, depth, oxygen, sensor, day) {
  return {
    _id: id,
    location: { type: "Point", coordinates: [lng, lat] },
    timestamp: `2024-11-${day}T06:00:00Z`,
    surfaceTemperature: temp,
    salinity,
    depth,
    dissolvedOxygen: oxygen,
    sensorId: sensor,
  };
}

export const DEMO_SPATIAL = {
  cached: false,
  demo: true,
  query: { center: { type: "Point", coordinates: [73, 15] }, radiusKm: 350 },
  counts: { ocean: 12, fisheries: 7, edna: 5 },
  data: {
    ocean: [
      ocean("o1", 72.9, 15.3, 28.4, 35.2, 12, 5.8, "ARGO-WIO-11", "02"),
      ocean("o2", 73.4, 14.6, 29.7, 35.6, 18, 5.1, "ARGO-WIO-12", "02"),
      ocean("o3", 74.1, 15.8, 27.1, 34.9, 22, 6.4, "INCOIS-BUOY-7", "03"),
      ocean("o4", 72.4, 16.2, 30.6, 36.1, 9, 4.6, "ARGO-WIO-14", "03"),
      ocean("o5", 73.8, 13.9, 26.2, 34.4, 31, 6.8, "INCOIS-BUOY-9", "04"),
      ocean("o6", 74.6, 14.9, 25.4, 34.1, 40, 7.1, "ARGO-WIO-18", "04"),
      ocean("o7", 73.15, 15.05, 28.9, 35.3, 14, 5.5, "INCOIS-GLIDER-2", "02"),
      ocean("o8", 72.7, 14.2, 27.8, 35.0, 20, 6.0, "ARGO-WIO-21", "05"),
      ocean("o9", 74.3, 16.4, 24.8, 33.9, 48, 7.4, "INCOIS-BUOY-11", "05"),
      ocean("o10", 73.55, 16.05, 31.1, 36.3, 8, 4.2, "ARGO-WIO-22", "06"),
      ocean("o11", 72.15, 15.7, 29.2, 35.7, 16, 5.0, "INCOIS-BUOY-3", "06"),
      ocean("o12", 74.85, 15.2, 23.6, 33.6, 55, 7.8, "ARGO-WIO-29", "07"),
    ],
    fisheries: [
      { _id: "f1", location: { type: "Point", coordinates: [73.1, 15.1] }, timestamp: "2024-11-02T14:00:00Z", species: "Mackerel", catchWeightKg: 126, vesselId: "IND-GOA-204", region: "Goa shelf" },
      { _id: "f2", location: { type: "Point", coordinates: [73.7, 14.4] }, timestamp: "2024-11-03T16:00:00Z", species: "Sardine", catchWeightKg: 84, vesselId: "IND-KAR-118", region: "Karnataka" },
      { _id: "f3", location: { type: "Point", coordinates: [72.6, 16.0] }, timestamp: "2024-11-03T12:00:00Z", species: "Tuna", catchWeightKg: 210, vesselId: "IND-MH-077", region: "Ratnagiri" },
      { _id: "f4", location: { type: "Point", coordinates: [74.2, 15.5] }, timestamp: "2024-11-04T10:00:00Z", species: "Pomfret", catchWeightKg: 41, vesselId: "IND-KAR-221", region: "Mangalore" },
      { _id: "f5", location: { type: "Point", coordinates: [73.3, 13.8] }, timestamp: "2024-11-04T18:00:00Z", species: "Anchovy", catchWeightKg: 63, vesselId: "IND-KER-054", region: "Kannur" },
      { _id: "f6", location: { type: "Point", coordinates: [72.35, 15.85] }, timestamp: "2024-11-05T11:00:00Z", species: "Hilsa", catchWeightKg: 97, vesselId: "IND-MH-141", region: "Mumbai coast" },
      { _id: "f7", location: { type: "Point", coordinates: [74.55, 14.75] }, timestamp: "2024-11-06T09:00:00Z", species: "Indian Prawn", catchWeightKg: 38, vesselId: "IND-KAR-309", region: "Udupi" },
    ],
    edna: [
      { _id: "e1", location: { type: "Point", coordinates: [73.05, 15.22] }, timestamp: "2024-11-02T09:00:00Z", sampleId: "eDNA-AS-019", sequenceHash: "8f21a", detectedSpecies: ["Mackerel", "Sardine"], markerType: "16S rRNA" },
      { _id: "e2", location: { type: "Point", coordinates: [72.7, 16.05] }, timestamp: "2024-11-03T09:30:00Z", sampleId: "eDNA-AS-027", sequenceHash: "b90c2", detectedSpecies: ["Tuna"], markerType: "16S rRNA" },
      { _id: "e3", location: { type: "Point", coordinates: [74.05, 15.55] }, timestamp: "2024-11-04T08:00:00Z", sampleId: "eDNA-AS-033", sequenceHash: "11ae4", detectedSpecies: ["Pomfret", "Indian Prawn"], markerType: "COI" },
      { _id: "e4", location: { type: "Point", coordinates: [73.6, 14.35] }, timestamp: "2024-11-04T11:00:00Z", sampleId: "eDNA-AS-041", sequenceHash: "c3d77", detectedSpecies: ["Sardine"], markerType: "16S rRNA" },
      { _id: "e5", location: { type: "Point", coordinates: [72.4, 15.75] }, timestamp: "2024-11-06T07:00:00Z", sampleId: "eDNA-AS-052", sequenceHash: "a91e0", detectedSpecies: ["Hilsa", "Mackerel"], markerType: "12S rRNA" },
    ],
  },
};
