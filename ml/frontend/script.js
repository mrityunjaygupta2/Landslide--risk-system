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

        console.log(
            "🤖 Prediction result:",
            resultData
        );


        // ==========================================
        // ADD RISK DATA TO TREND CHART
        // ==========================================

        if (riskTrendChart) {

            const now = new Date();

            const timeLabel = now.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
            });

            const probabilityPercent =
                resultData.landslide_probability * 100;

            riskTrendLabels.push(timeLabel);

            riskTrendValues.push(
                Number(probabilityPercent.toFixed(2))
            );

            // Keep only latest 20 readings
            if (riskTrendLabels.length > 20) {
                riskTrendLabels.shift();
                riskTrendValues.shift();
            }

            riskTrendChart.update();

            const trendStatus =
                document.getElementById("riskTrendStatus");

            if (trendStatus) {

                trendStatus.innerHTML = `
                    <p>
                        🕒 Last Updated:
                        <strong>${timeLabel}</strong>
                    </p>

                    <p>
                        📊 Current Probability:
                        <strong>
                            ${probabilityPercent.toFixed(2)}%
                        </strong>
                    </p>
                `;
            }
        }


        // ============================================
        // SMART AI + RAINFALL + SLOPE EARLY WARNING
        // ============================================

        const warningBox =
            document.getElementById("earlyWarning");

        if (warningBox) {

            const rainfall =
                parseFloat(
                    document.getElementById("currentRainfall").textContent
                ) || 0;

            const probability =
                resultData.landslide_probability;

            const slope =
                Number(
                    document.getElementById("slope").value
                ) || 0;

            const probabilityPercent =
                probability * 100;


            // ============================================
            // 🚨 EXTREME WARNING
            // HIGH AI + VERY HIGH RAINFALL + STEEP SLOPE
            // ============================================

            if (
                resultData.risk_level === "HIGH" &&
                rainfall >= 150 &&
                slope >= 30
            ) {

                warningBox.innerHTML = `
                    <div style="
                        padding: 18px;
                        border-radius: 12px;
                        background: #ffebee;
                        border: 3px solid red;
                    ">

                        <h2>🚨 EXTREME LANDSLIDE WARNING</h2>

                        <p>
                            <strong>AI Risk:</strong>
                            HIGH
                        </p>

                        <p>
                            <strong>24-Hour Rainfall:</strong>
                            ${rainfall.toFixed(2)} mm
                        </p>

                        <p>
                            <strong>Slope:</strong>
                            ${slope.toFixed(2)}°
                        </p>

                        <p>
                            <strong>Landslide Probability:</strong>
                            ${probabilityPercent.toFixed(2)}%
                        </p>

                        <p>
                            🚨 High AI risk combined with very high
                            rainfall and steep terrain.
                        </p>

                        <p>
                            ⚠️ Immediate monitoring and local
                            authority attention recommended.
                        </p>

                    </div>
                `;

            }


            // ============================================
            // 🚨 CRITICAL WARNING
            // HIGH AI + VERY HIGH RAINFALL
            // ============================================

            else if (
                resultData.risk_level === "HIGH" &&
                rainfall >= 150
            ) {

                warningBox.innerHTML = `
                    <div style="
                        padding: 18px;
                        border-radius: 12px;
                        background: #ffebee;
                        border: 3px solid red;
                    ">

                        <h2>🚨 CRITICAL LANDSLIDE WARNING</h2>

                        <p>
                            <strong>AI Risk:</strong>
                            HIGH
                        </p>

                        <p>
                            <strong>24-Hour Rainfall:</strong>
                            ${rainfall.toFixed(2)} mm
                        </p>

                        <p>
                            <strong>Slope:</strong>
                            ${slope.toFixed(2)}°
                        </p>

                        <p>
                            <strong>Landslide Probability:</strong>
                            ${probabilityPercent.toFixed(2)}%
                        </p>

                        <p>
                            🚨 Heavy rainfall combined with
                            high AI-predicted landslide risk.
                        </p>

                        <p>
                            ⚠️ Immediate monitoring recommended.
                        </p>

                    </div>
                `;

            }


            // ============================================
            // 🔴 HIGH RISK
            // ============================================

            else if (
                resultData.risk_level === "HIGH"
            ) {

                warningBox.innerHTML = `
                    <div style="
                        padding: 15px;
                        border-radius: 10px;
                        background: #ffebee;
                        border: 2px solid red;
                    ">

                        <h3>🚨 HIGH RISK WARNING</h3>

                        <p>
                            <strong>Landslide Probability:</strong>
                            ${probabilityPercent.toFixed(2)}%
                        </p>

                        <p>
                            <strong>Slope:</strong>
                            ${slope.toFixed(2)}°
                        </p>

                        <p>
                            🚨 Avoid unnecessary travel through
                            this area and monitor local
                            authorities' warnings.
                        </p>

                        <p>
                            <strong>Immediate Attention Required</strong>
                        </p>

                    </div>
                `;

            }


            // ============================================
            // 🟡 MEDIUM RISK
            // ============================================

            else if (
                resultData.risk_level === "MEDIUM"
            ) {

                warningBox.innerHTML = `
                    <div style="
                        padding: 15px;
                        border-radius: 10px;
                        background: #fff8e1;
                        border: 2px solid orange;
                    ">

                        <h3>⚠️ MEDIUM RISK</h3>

                        <p>
                            <strong>Landslide Probability:</strong>
                            ${probabilityPercent.toFixed(2)}%
                        </p>

                        <p>
                            <strong>24-Hour Rainfall:</strong>
                            ${rainfall.toFixed(2)} mm
                        </p>

                        <p>
                            ⚠️ Continue monitoring rainfall
                            and local conditions.
                        </p>

                    </div>
                `;

            }


            // ============================================
            // 🟢 LOW RISK
            // ============================================

            else {

                warningBox.innerHTML = `
                    <div style="
                        padding: 15px;
                        border-radius: 10px;
                        background: #e8f5e9;
                        border: 2px solid green;
                    ">

                        <h3>✅ LOW RISK</h3>

                        <p>
                            ✅ Normal monitoring recommended.
                        </p>

                        <p>
                            <strong>Landslide Probability:</strong>
                            ${probabilityPercent.toFixed(2)}%
                        </p>

                        <p>
                            <strong>24-Hour Rainfall:</strong>
                            ${rainfall.toFixed(2)} mm
                        </p>

                    </div>
                `;

            }

        }


        // ========================================
        // FINAL RISK RESULT
        // ========================================

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

            <p>
                ${error.message}
            </p>

            <p>
                Make sure backend is running on port 8000.
            </p>
        `;

        console.error(
            "❌ Prediction error:",
            error
        );
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
        
        // LOAD RISK FRID

       loadRiskGrid(map);
//loadHighRiskZones(map);
//loadRiskHeatmap(map);
loadRiskStatistics();
loadLandslidePoints(map);
loadAIRiskDashboard();
loadRiskChart();
        // ========================================
// RISK LEGEND
// ========================================

const riskLegend = L.control({
    position: "bottomright"
});

riskLegend.onAdd = function () {

    const div = L.DomUtil.create(
        "div",
        "risk-legend"
    );

    div.style.background = "white";
    div.style.padding = "12px";
    div.style.borderRadius = "10px";
    div.style.boxShadow =
        "0 2px 8px rgba(0,0,0,0.25)";

    div.style.lineHeight = "1.8";

    div.innerHTML = `
        <strong>🚨 Landslide Risk</strong><br>

        <span style="color:green; font-size:20px;">
            ●
        </span>
        LOW Risk<br>

        <span style="color:orange; font-size:20px;">
            ●
        </span>
        MEDIUM Risk<br>

        <span style="color:red; font-size:20px;">
            ●
        </span>
        HIGH Risk
    `;

    return div;
};

riskLegend.addTo(map);


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

    return;
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

const recentRainfall =
    await loadRecentRainfallCondition(
        latitude,
        longitude
    );
    const recentRainfallValue =
    recentRainfall ? recentRainfall.rainfall_24h_mm : 0;

document.getElementById("currentRainfall").textContent =
    recentRainfallValue;
const rainfallBox =
    document.getElementById("rainfallCondition");

if (rainfallBox) {

   const rainfall =
    recentRainfall
        ? recentRainfall.rainfall_24h_mm
        : 0;

    if (rainfall >= 6000) {

        rainfallBox.innerHTML = `
            <div style="
                padding: 15px;
                border-radius: 10px;
                background: #ffebee;
                border: 2px solid red;
            ">
                <h3>🌧️ HEAVY RAINFALL CONDITION</h3>
                <p>
                    Rainfall:
                    <strong>${rainfall.toFixed(2)} mm</strong>
                </p>
                <p>
                    🚨 Increased landslide monitoring recommended.
                </p>
            </div>
        `;

    }
    else if (rainfall >= 3000) {

        rainfallBox.innerHTML = `
            <div style="
                padding: 15px;
                border-radius: 10px;
                background: #fff8e1;
                border: 2px solid orange;
            ">
                <h3>⚠️ MODERATE RAINFALL CONDITION</h3>
                <p>
                    Rainfall:
                    <strong>${rainfall.toFixed(2)} mm</strong>
                </p>
                <p>
                    ⚠️ Continue monitoring local conditions.
                </p>
            </div>
        `;

    }
    else {

        rainfallBox.innerHTML = `
            <div style="
                padding: 15px;
                border-radius: 10px;
                background: #e8f5e9;
                border: 2px solid green;
            ">
                <h3>✅ NORMAL RAINFALL CONDITION</h3>
                <p>
                    Rainfall:
                    <strong>${rainfall.toFixed(2)} mm</strong>
                </p>
                <p>
                    Normal monitoring recommended.
                </p>
            </div>
        `;
    }
}
                        // ========================================
// UPDATE CURRENT LOCATION PANEL
// ========================================

document.getElementById(
    "currentLatitude"
).textContent = latitude.toFixed(6);

document.getElementById(
    "currentLongitude"
).textContent = longitude.toFixed(6);

document.getElementById(
    "currentElevation"
).textContent =
    environment.elevation;

document.getElementById(
    "currentSlope"
).textContent =
    environment.slope;

document.getElementById(
    "currentSoilMoisture"
).textContent =
    environment.soil_moisture;

document.getElementById(
    "currentRainfall"
).textContent =
    recentRainfallValue;


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
                     // ========================================
// UPDATE AI RISK IN LOCATION PANEL
// ========================================

document.getElementById(
    "currentProbability"
).textContent =
    (
        predictionResult.landslide_probability * 100
    ).toFixed(2) + "%";

document.getElementById(
    "currentRiskLevel"
).textContent =
    predictionResult.risk_level;
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
// ============================================
// LOAD SIKKIM RISK GRID
// ============================================

async function loadRiskGrid(map) {

    console.log("Loading Sikkim risk grid...");

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/risk-grid"
        );

        if (!response.ok) {

            throw new Error(
                "Risk grid backend error: " +
                response.status
            );
        }

        const data = await response.json();

        console.log(
            "Risk grid received:",
            data.total_points
        );

        // ----------------------------------------
        // CREATE RISK GRID LAYER
        // ----------------------------------------

        const riskGridLayer = L.layerGroup();

        // ----------------------------------------
        // ADD EACH RISK POINT
        // ----------------------------------------

        data.points.forEach(function (point) {

            let riskColor = "yellow";

            if (point.risk_level === "LOW") {
                riskColor = "green";
            }
            else if (point.risk_level === "MEDIUM") {
                riskColor = "orange";
            }
            else if (point.risk_level === "HIGH") {
                riskColor = "red";
            }

            const marker = L.circleMarker(
                [
                    point.latitude,
                    point.longitude
                ],
                {
                    radius: 7,

                    color: riskColor,

                    fillColor: riskColor,

                    fillOpacity: 0.55,

                    weight: 2
                  //  interactive: false
                }
            );
            // ========================================
// CLICK ON RISK GRID POINT
// ========================================

marker.on("click", function (e) {

    // Stop the grid marker from creating
    // a separate map click event
    L.DomEvent.stopPropagation(e);

    // Trigger the main map click logic
    map.fire("click", {
        latlng: e.latlng
    });

});

            marker.bindPopup(
                "<b>🚨 Sikkim Risk Grid</b><br><br>" +

                "<b>Risk Level:</b> " +
                point.risk_level +

                "<br>" +

                "<b>Probability:</b> " +
                (
                    point.probability * 100
                ).toFixed(2) +

                "%" +

                "<br><br>" +

                "<b>Latitude:</b> " +
                point.latitude.toFixed(4) +

                "<br>" +

                "<b>Longitude:</b> " +
                point.longitude.toFixed(4)
            );

            marker.addTo(
                riskGridLayer
            );
        });

        // ----------------------------------------
        // ADD GRID TO MAP
        // ----------------------------------------

        riskGridLayer.addTo(map);

        console.log(
            "✅ Risk grid displayed successfully."
        );

    }
    catch (error) {

        console.error(
            "❌ Risk grid error:",
            error
        );
    }
}
// ============================================
// LOAD REAL HISTORICAL LANDSLIDE POINTS
// ============================================

async function loadLandslidePoints(map) {

    console.log("Loading real landslide points...");

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/landslide-points"
        );

        if (!response.ok) {
            throw new Error(
                "Landslide points error: " +
                response.status
            );
        }

        const data = await response.json();

        console.log(
            "Real landslide points:",
            data.total_points
        );

        const landslideLayer = L.layerGroup();

        data.points.forEach(function(point) {

            const marker = L.circleMarker(
                [
                    point.latitude,
                    point.longitude
                ],
                {
                    radius: 5,
                    color: "black",
                    fillColor: "black",
                    fillOpacity: 0.9,
                    weight: 2
                }
            );
            marker.on("click", function (e) {

    // Stop black historical point from triggering
    // the map click twice
    L.DomEvent.stopPropagation(e);

    // Trigger the main map click logic
    map.fire("click", {
        latlng: e.latlng
    });

});

            marker.bindPopup(
                "<b>📍 Historical Landslide</b><br><br>" +
                "<b>Latitude:</b> " +
                point.latitude.toFixed(6) +
                "<br>" +
                "<b>Longitude:</b> " +
                point.longitude.toFixed(6)
            );

            marker.addTo(landslideLayer);

        });

        landslideLayer.addTo(map);

        console.log(
            "✅ Real landslide points displayed."
        );

    }
    catch (error) {

        console.error(
            "❌ Landslide points error:",
            error
        );

    }
}
// ============================================
// RISK STATISTICS
// ============================================

async function loadRiskStatistics() {

    console.log("Loading risk statistics...");

    const statistics =
        document.getElementById("riskStatistics");

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/risk-grid"
        );

        if (!response.ok) {

            throw new Error(
                "Risk statistics error: " +
                response.status
            );

        }

        const data = await response.json();

        let low = 0;
        let medium = 0;
        let high = 0;

        data.points.forEach(function(point) {

            if (point.risk_level === "LOW") {
                low++;
            }

            else if (point.risk_level === "MEDIUM") {
                medium++;
            }

            else if (point.risk_level === "HIGH") {
                high++;
            }

        });

        const total = data.total_points;

       statistics.innerHTML = `

    <div class="statistics-grid">

        <div class="stat-box total-stat">
            <div class="stat-icon">📍</div>
            <div class="stat-title">Total Points</div>
            <div class="stat-value">${total}</div>
        </div>

        <div class="stat-box low-stat">
            <div class="stat-icon">🟢</div>
            <div class="stat-title">LOW Risk</div>
            <div class="stat-value">${low}</div>
        </div>

        <div class="stat-box medium-stat">
            <div class="stat-icon">🟠</div>
            <div class="stat-title">MEDIUM Risk</div>
            <div class="stat-value">${medium}</div>
        </div>

        <div class="stat-box high-stat">
            <div class="stat-icon">🔴</div>
            <div class="stat-title">HIGH Risk</div>
            <div class="stat-value">${high}</div>
        </div>

    </div>

`;

        console.log(
            "✅ Risk statistics loaded."
        );

    }

    catch (error) {

        statistics.innerHTML = `
            <p>❌ Unable to load risk statistics.</p>
        `;

        console.error(
            "Risk statistics error:",
            error
        );

    }
}
// ============================================
// LOAD SIKKIM RISK HEATMAP
// ============================================

async function loadRiskHeatmap(map) {

    console.log("Loading Sikkim risk heatmap...");

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/risk-grid"
        );

        if (!response.ok) {

            throw new Error(
                "Heatmap backend error: " +
                response.status
            );

        }

        const data = await response.json();

        const heatPoints = [];

        data.points.forEach(function(point) {

            const intensity =
                point.probability;

            heatPoints.push([
                point.latitude,
                point.longitude,
                intensity
            ]);

        });

        const heatmapLayer = L.heatLayer(
            heatPoints,
            {
                radius: 30,
                blur: 25,
                maxZoom: 10,
                max: 1.0
            }
        );

        heatmapLayer.addTo(map);

        console.log(
            "✅ Risk heatmap displayed."
        );

    }
    catch (error) {

        console.error(
            "❌ Risk heatmap error:",
            error
        );

    }
}
async function loadHighRiskZones(map) {

    console.log("Loading HIGH risk alert zones...");

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/risk-grid"
        );

        if (!response.ok) {
            throw new Error(
                "High risk zone error: " +
                response.status
            );
        }

        const data = await response.json();

        const highRiskLayer = L.layerGroup();

        data.points.forEach(function(point) {

            if (point.risk_level === "HIGH") {

                const zone = L.circle(
                    [point.latitude, point.longitude],
                    {
                        radius: 2500,
                        color: "red",
                        fillColor: "red",
                        fillOpacity: 0.08,
                        weight: 1
                    }
                );

                zone.bindPopup(
                    "<b>🚨 HIGH RISK ALERT ZONE</b><br><br>" +
                    "<b>Probability:</b> " +
                    (point.probability * 100).toFixed(2) +
                    "%<br><br>" +
                    "⚠️ Increased landslide monitoring recommended."
                );

                zone.addTo(highRiskLayer);
            }

        });

        highRiskLayer.addTo(map);

        console.log(
            "✅ HIGH risk alert zones displayed."
        );

    }
    catch (error) {

        console.error(
            "❌ High risk zone error:",
            error
        );

    }
}

async function loadAIRiskDashboard() {

    console.log("Loading AI Risk Dashboard...");

    const dashboard =
        document.getElementById("aiRiskDashboard");

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/risk-grid"
        );

        if (!response.ok) {

            throw new Error(
                "AI dashboard error: " +
                response.status
            );

        }

        const data = await response.json();

        let low = 0;
        let medium = 0;
        let high = 0;

        data.points.forEach(function(point) {

            if (point.risk_level === "LOW") {
                low++;
            }

            else if (point.risk_level === "MEDIUM") {
                medium++;
            }

            else if (point.risk_level === "HIGH") {
                high++;
            }

        });

        const total = data.total_points;

        const highPercentage =
            total > 0
                ? ((high / total) * 100).toFixed(2)
                : 0;

        dashboard.innerHTML = `

            <div style="
                display: grid;
                grid-template-columns:
                repeat(auto-fit, minmax(180px, 1fr));
                gap: 15px;
                margin-top: 15px;
            ">

                <div style="
                    padding: 20px;
                    border-radius: 12px;
                    background: #f5f5f5;
                    text-align: center;
                ">
                    <h3>📍</h3>
                    <h2>${total}</h2>
                    <p>Total Monitoring Points</p>
                </div>


                <div style="
                    padding: 20px;
                    border-radius: 12px;
                    background: #e8f5e9;
                    text-align: center;
                ">
                    <h3>🟢</h3>
                    <h2>${low}</h2>
                    <p>LOW Risk</p>
                </div>


                <div style="
                    padding: 20px;
                    border-radius: 12px;
                    background: #fff8e1;
                    text-align: center;
                ">
                    <h3>🟠</h3>
                    <h2>${medium}</h2>
                    <p>MEDIUM Risk</p>
                </div>


                <div style="
                    padding: 20px;
                    border-radius: 12px;
                    background: #ffebee;
                    text-align: center;
                ">
                    <h3>🔴</h3>
                    <h2>${high}</h2>
                    <p>HIGH Risk</p>
                </div>


                <div style="
                    padding: 20px;
                    border-radius: 12px;
                    background: #ffebee;
                    text-align: center;
                ">
                    <h3>🚨</h3>
                    <h2>${highPercentage}%</h2>
                    <p>HIGH Risk Area</p>
                </div>

            </div>

        `;

        console.log(
            "✅ AI Risk Dashboard loaded."
        );

    }

    catch (error) {

        dashboard.innerHTML = `
            <p>
                ❌ Unable to load AI Risk Dashboard.
            </p>
        `;

        console.error(
            "AI dashboard error:",
            error
        );

    }
}
async function loadRiskChart() {

    console.log("Loading Risk Distribution Chart...");

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/risk-grid"
        );

        if (!response.ok) {
            throw new Error(
                "Risk chart backend error: " +
                response.status
            );
        }

        const data = await response.json();

        let low = 0;
        let medium = 0;
        let high = 0;

        data.points.forEach(function(point) {

            if (point.risk_level === "LOW") {
                low++;
            }
            else if (point.risk_level === "MEDIUM") {
                medium++;
            }
            else if (point.risk_level === "HIGH") {
                high++;
            }

        });

        const chartElement =
            document.getElementById("riskChart");

        if (!chartElement) {
            console.error("❌ riskChart not found.");
            return;
        }

        new Chart(chartElement, {

            type: "doughnut",

            data: {
                labels: [
                    "LOW Risk",
                    "MEDIUM Risk",
                    "HIGH Risk"
                ],

                datasets: [{
                    data: [
                        low,
                        medium,
                        high
                    ]
                }]
            },

            options: {
                responsive: true,

                plugins: {
                    legend: {
                        position: "bottom"
                    }
                }
            }

        });

        console.log(
            "✅ Risk Distribution Chart loaded."
        );

    }
    catch (error) {

        console.error(
            "❌ Risk chart error:",
            error
        );

    }
}
async function loadRecentRainfallCondition(latitude, longitude) {

    console.log("Loading recent rainfall...");

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/recent-rainfall",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    latitude: latitude,
                    longitude: longitude
                })
            }
        );

        if (!response.ok) {
            throw new Error(
                "Recent rainfall error: " +
                response.status
            );
        }

        const data = await response.json();

        console.log(
            "✅ Recent rainfall data:",
            data
        );

      const rainfall =
    data.rainfall_24h_mm;

        const rainfallBox =
            document.getElementById("rainfallCondition");

        if (rainfallBox) {

            if (rainfall >= 150) {

                rainfallBox.innerHTML = `
                    <div style="
                        padding: 15px;
                        border-radius: 10px;
                        background: #ffebee;
                        border: 2px solid red;
                    ">
                        <h3>🚨 VERY HIGH RAINFALL</h3>

                        <p>
                            🌧️ <strong>Last 24-hour Rainfall:</strong>
                            ${rainfall.toFixed(2)} mm
                        </p>

                        <p>
                            🚨 Heavy rainfall detected.
                            Increased landslide monitoring recommended.
                        </p>
                    </div>
                `;

            }
            else if (rainfall >= 75) {

                rainfallBox.innerHTML = `
                    <div style="
                        padding: 15px;
                        border-radius: 10px;
                        background: #fff3e0;
                        border: 2px solid orange;
                    ">
                        <h3>⚠️ HIGH RAINFALL</h3>

                        <p>
                            🌧️ <strong>Last 24-hour Rainfall:</strong>
                            ${rainfall.toFixed(2)} mm
                        </p>

                        <p>
                            ⚠️ Continue monitoring local conditions.
                        </p>
                    </div>
                `;

            }
            else if (rainfall >= 25) {

                rainfallBox.innerHTML = `
                    <div style="
                        padding: 15px;
                        border-radius: 10px;
                        background: #fff8e1;
                        border: 2px solid orange;
                    ">
                        <h3>⚠️ MODERATE RAINFALL</h3>

                        <p>
                            🌧️ <strong>Last 24-hour Rainfall:</strong>
                            ${rainfall.toFixed(2)} mm
                        </p>

                        <p>
                            ⚠️ Continue monitoring local conditions.
                        </p>
                    </div>
                `;

            }
            else {

                rainfallBox.innerHTML = `
                    <div style="
                        padding: 15px;
                        border-radius: 10px;
                        background: #e8f5e9;
                        border: 2px solid green;
                    ">
                        <h3>✅ NORMAL RAINFALL</h3>

                        <p>
                            🌧️ <strong>Last 24-hour Rainfall:</strong>
                            ${rainfall.toFixed(2)} mm
                        </p>

                        <p>
                            Normal rainfall condition.
                        </p>
                    </div>
                `;
            }
        }

        // IMPORTANT: return data
        return data;

    }
    catch (error) {

        console.error(
            "❌ Recent rainfall error:",
            error
        );

        return null;
    }
}
// ==========================================
// AUTOMATIC MONITORING
// ==========================================

setInterval(function () {

    console.log("🔄 Automatic monitoring update...");

    loadRiskGrid(map);

    if (selectedLat !== null && selectedLon !== null) {
        map.fire("click", {
            latlng: L.latLng(selectedLat, selectedLon)
        });
    }

}, 10 * 60 * 1000); // Every 10 minutes
// ==========================================
// RISK TREND CHART
// ==========================================

let riskTrendChart = null;

let riskTrendLabels = [];
let riskTrendValues = [];

function initializeRiskTrendChart() {

    const canvas = document.getElementById("riskTrendChart");

    if (!canvas) {
        console.log("Risk trend canvas not found.");
        return;
    }

    const ctx = canvas.getContext("2d");

    riskTrendChart = new Chart(ctx, {
        type: "line",

        data: {
            labels: riskTrendLabels,

           datasets: [{
    label: "Landslide Risk Probability (%)",
    data: riskTrendValues,
    tension: 0.3,
    fill: false,
    borderWidth: 3,
    pointRadius: 3,
    pointHoverRadius: 5
}]
        },

        options: {
            responsive: true,

            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: "Probability (%)"
                    }
                },

                x: {
                    title: {
                        display: true,
                        text: "Monitoring Time"
                    }
                }
            }
        }
    });

    console.log("📈 Risk trend chart initialized.");
}

initializeRiskTrendChart();
function goToSikkimPrototype() {

    const sikkimMap = document.getElementById("sikkimMap");

    if (sikkimMap) {
        sikkimMap.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }

}
