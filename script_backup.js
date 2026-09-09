// ============================================
// CHECK WHETHER LOCATION IS INSIDE SIKKIM
// ============================================

function isInsideSikkim(latitude, longitude) {

    // Sikkim approximate geographic limits
    const minLat = 27.05;
    const maxLat = 28.15;

    const minLon = 87.95;
    const maxLon = 88.95;

    return (
        latitude >= minLat &&
        latitude <= maxLat &&
        longitude >= minLon &&
        longitude <= maxLon
    );
}
// PREDICT LANDSLIDE RISK
// ============================================

async function predictRisk() {

    const result = document.getElementById("result");

    result.style.display = "block";
    result.innerHTML = "<h2>⏳ Predicting...</h2>";

    const data = {
        elevation: Number(document.getElementById("elevation").value),
        slope: Number(document.getElementById("slope").value),
        soil_moisture: Number(document.getElementById("soil_moisture").value),
        rainfall: Number(document.getElementById("rainfall").value),
        latitude: Number(document.getElementById("latitude").value),
        longitude: Number(document.getElementById("longitude").value)
    };

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/predict",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(data)
            }
        );

        if (!response.ok) {
            throw new Error(
                "Prediction backend error: " + response.status
            );
        }

       const resultData = await response.json();

result.innerHTML = `
    <h2>✅ Risk Result</h2>

    <p>
        <strong>Prediction:</strong>
        ${resultData.prediction}
    </p>

    <p>
        <strong>Landslide Probability:</strong>
        ${(resultData.landslide_probability * 100).toFixed(2)}%
    </p>

    <p>
        <strong>Risk Level:</strong>
        ${resultData.risk_level}
    </p>
`;

return resultData;

    } catch (error) {

        result.innerHTML = `
            <h2>❌ Error</h2>
            <p>${error.message}</p>
            <p>Make sure backend is running on port 8000.</p>
        `;
    }
}


// ============================================
// SIKKIM INTERACTIVE MAP
// ============================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const sikkimCenter = [
            27.5330,
            88.5122
        ];

        const map = L.map(
            "sikkimMap"
        ).setView(
            sikkimCenter,
            8
        );


        // OpenStreetMap

        L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                maxZoom: 18,

                attribution:
                    "&copy; OpenStreetMap contributors"
            }
        ).addTo(map);


        let selectedMarker = null;
        let riskMarker = null;

        // ========================================
        // MAP CLICK
        // ========================================

        map.on(
            "click",
            async function (e) {

                const latitude =
                    e.latlng.lat;

                const longitude =
                    e.latlng.lng;
                    // ========================================
// CHECK SIKKIM BOUNDARY
// ========================================

if (!isInsideSikkim(latitude, longitude)) {

    const result =
        document.getElementById("result");

    result.style.display = "block";

    result.innerHTML = `
        <h2>⚠️ Invalid Location</h2>

        <p>
            Please select a location
            <strong>within Sikkim</strong>.
        </p>

        <p>
            Landslide prediction is available
            only for the Sikkim study area.
        </p>
    `;

    return resultData;
}


                // ----------------------------------
                // UPDATE LATITUDE / LONGITUDE
                // ----------------------------------

                document.getElementById(
                    "latitude"
                ).value =
                    latitude.toFixed(6);

                document.getElementById(
                    "longitude"
                ).value =
                    longitude.toFixed(6);


                // ----------------------------------
                // MARKER
                // ----------------------------------

                if (selectedMarker) {

                    map.removeLayer(
                        selectedMarker
                    );
                }


                selectedMarker =
                    L.marker([
                        latitude,
                        longitude
                    ])
                    .addTo(map)
                    .bindPopup(
                        "<b>Selected Location</b><br>" +
                        "Latitude: " +
                        latitude.toFixed(6) +
                        "<br>" +
                        "Longitude: " +
                        longitude.toFixed(6)
                    )
                    .openPopup();


                // ----------------------------------
                // LOCATION TEXT
                // ----------------------------------

                const locationText =
                    document.getElementById(
                        "selectedLocation"
                    );

                if (locationText) {

                    locationText.innerHTML =
                        "📍 <b>Selected Location</b><br>" +
                        "Latitude: " +
                        latitude.toFixed(6) +
                        "<br>" +
                        "Longitude: " +
                        longitude.toFixed(6);
                }


                // ==================================
                // GET ENVIRONMENTAL DATA
                // ==================================

                const result =
                    document.getElementById(
                        "result"
                    );

                result.style.display = "block";

                result.innerHTML =
                    "<h2>🌍 Getting environmental data...</h2>" +
                    "<p>Please wait...</p>";


                try {

                    const environmentResponse =
                        await fetch(
                            "http://127.0.0.1:8000/environment",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({
                                    latitude:
                                        latitude,

                                    longitude:
                                        longitude
                                })
                            }
                        );


                    if (
                        !environmentResponse.ok
                    ) {

                        throw new Error(
                            "Environmental data error: " +
                            environmentResponse.status
                        );
                    }


                    const environment =
                        await environmentResponse.json();


                    // ==================================
                    // PUT REAL ENVIRONMENTAL VALUES
                    // INTO INPUT BOXES
                    // ==================================

                    document.getElementById(
                        "elevation"
                    ).value =
                        environment.elevation;

                    document.getElementById(
                        "slope"
                    ).value =
                        environment.slope;

                    document.getElementById(
                        "soil_moisture"
                    ).value =
                        environment.soil_moisture;

                    document.getElementById(
                        "rainfall"
                    ).value =
                        environment.rainfall;


                    // ==================================
                    // SHOW ENVIRONMENTAL DATA
                    // ==================================

                    result.innerHTML = `
                        <h2>🌍 Environmental Data</h2>

                        <p>
                            <strong>Elevation:</strong>
                            ${environment.elevation} m
                        </p>

                        <p>
                            <strong>Slope:</strong>
                            ${environment.slope}°
                        </p>

                        <p>
                            <strong>Soil Moisture:</strong>
                            ${environment.soil_moisture}
                        </p>

                        <p>
                            <strong>Rainfall:</strong>
                            ${environment.rainfall} mm
                        </p>

                        <p>🤖 Running AI prediction...</p>
                    `;


                    // ==================================
                    // AUTOMATIC AI PREDICTION
                    // ==================================

                     const predictionResult = await predictRisk();
                     // ==================================
// RISK VISUALIZATION ON MAP
// ==================================

if (riskMarker) {
    map.removeLayer(riskMarker);
}

let riskColor = "yellow";

if (predictionResult.risk_level === "LOW") {
    riskColor = "green";
}
else if (predictionResult.risk_level === "MEDIUM") {
    riskColor = "orange";
}
else if (predictionResult.risk_level === "HIGH") {
    riskColor = "red";
}

riskMarker = L.circleMarker(
    [latitude, longitude],
    {
        radius: 14,
        color: riskColor,
        fillColor: riskColor,
        fillOpacity: 0.7,
        weight: 4
    }
)
.addTo(map)
.bindPopup(
    "<b>🚨 Landslide Risk</b><br>" +
    "Risk Level: <b>" +
    predictionResult.risk_level +
    "</b><br>" +
    "Probability: <b>" +
    (predictionResult.landslide_probability * 100).toFixed(2) +
    "%</b>"
)
.openPopup();

                }


                catch (error) {

                    result.innerHTML = `
                        <h2>❌ Error</h2>

                        <p>
                            ${error.message}
                        </p>

                        <p>
                            Make sure the backend
                            is running on port 8000.
                        </p>
                    `;
                }

            }
        );

    }
);