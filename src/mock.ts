// TODO
export const randomPoint = (): { lat: number; lng: number; heat: number }[] => {
    const result: { lat: number; lng: number; heat: number }[] = [];
    for (let i = 0; i < 1000; i++) {
        result.push({
            lat: Math.random() * 40,
            lng: Math.random() * 100,
            heat: Math.random() * 10
        });
    }
    return result;
};

export const randomGeoJsonPoint = (number = 1000) => {
    const geoJsonData: any = {
        type: "FeatureCollection",
        features: []
    };
    for (let i = 0; i < number; i++) {
        geoJsonData.features.push({
            type: "Feature",
            properties: {
                heat: Math.random() * 10
            },
            geometry: {
                type: "Point",
                coordinates: [Math.random() * 100, Math.random() * 40]
            }
        });
    }
    return geoJsonData;
};
