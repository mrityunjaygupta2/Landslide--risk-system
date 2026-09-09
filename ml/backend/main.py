from fastapi import FastAPI, HTTPException
from datetime import datetime, timezone, timedelta
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib
import os
import ee
# ============================================
# RISK GRID CACHE
# ============================================

risk_grid_cache = None


# ============================================
# CREATE FASTAPI APP
# ============================================

app = FastAPI(
    title="Sikkim Landslide Risk API",
    description="AI-Based Landslide Risk Prediction System",
    version="1.0"
)


# ============================================
# CORS
# ============================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================
# INITIALIZE GOOGLE EARTH ENGINE
# ============================================

try:

    ee.Initialize(
        project="cryptic-pipe-490705-k9"
    )

    print("Google Earth Engine initialized successfully!")

except Exception as e:

    print("Google Earth Engine initialization failed:")
    print(e)


# ============================================
# LOAD MODEL
# ============================================

MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "..",
    "landslide_model.pkl"
)

model = joblib.load(MODEL_PATH)

print("Landslide model loaded successfully!")


# ============================================
# INPUT DATA FOR PREDICTION
# ============================================

class LandslideInput(BaseModel):

    elevation: float
    slope: float
    soil_moisture: float
    rainfall: float
    latitude: float
    longitude: float


# ============================================
# LOCATION INPUT
# ============================================

class LocationInput(BaseModel):

    latitude: float
    longitude: float


# ============================================
# HOME
# ============================================

@app.get("/")
def home():

    return {
        "message": "Sikkim Landslide Risk API is running",
        "status": "OK"
    }


# ============================================
# GET ENVIRONMENTAL DATA
# ============================================

@app.post("/environment")
def get_environment(data: LocationInput):

    try:

        latitude = data.latitude
        longitude = data.longitude

        print(
            f"Getting environmental data for: "
            f"{latitude}, {longitude}"
        )


        # ----------------------------------------
        # LOCATION POINT
        # ----------------------------------------

        point = ee.Geometry.Point([
            longitude,
            latitude
        ])


        # ----------------------------------------
        # ELEVATION
        # ----------------------------------------

        dem = ee.Image(
            "USGS/SRTMGL1_003"
        ).select("elevation")


        elevation = dem.reduceRegion(
            reducer=ee.Reducer.first(),
            geometry=point,
            scale=30
        ).get("elevation")


        # ----------------------------------------
        # SLOPE
        # ----------------------------------------

        slope_image = ee.Terrain.slope(dem)


        slope = slope_image.reduceRegion(
            reducer=ee.Reducer.first(),
            geometry=point,
            scale=30
        ).get("slope")


        # ----------------------------------------
        # ERA5-LAND
        # 2021 DATA
        # ----------------------------------------

        era5 = ee.ImageCollection(
            "ECMWF/ERA5_LAND/MONTHLY_AGGR"
        ).filterDate(
            "2021-01-01",
            "2022-01-01"
        )


        # ----------------------------------------
        # SOIL MOISTURE
        # ----------------------------------------

        soil_moisture_image = era5.select(
            "volumetric_soil_water_layer_1"
        ).mean()


        soil_moisture = soil_moisture_image.reduceRegion(
            reducer=ee.Reducer.first(),
            geometry=point,
            scale=11132
        ).get(
            "volumetric_soil_water_layer_1"
        )


        # ----------------------------------------
        # RAINFALL
        # ----------------------------------------

        rainfall_image = era5.select(
            "total_precipitation_sum"
        ).sum()


        rainfall_meters = rainfall_image.reduceRegion(
            reducer=ee.Reducer.first(),
            geometry=point,
            scale=11132
        ).get(
            "total_precipitation_sum"
        )


        # Convert meters to millimeters

        rainfall_mm = ee.Number(
            rainfall_meters
        ).multiply(1000)


        # ----------------------------------------
        # GET ALL VALUES
        # ----------------------------------------

        values = ee.Dictionary({

            "elevation": elevation,

            "slope": slope,

            "soil_moisture": soil_moisture,

            "rainfall": rainfall_mm

        }).getInfo()


        # ----------------------------------------
        # RETURN DATA
        # ----------------------------------------

        result = {

            "latitude": latitude,

            "longitude": longitude,

            "elevation": round(
                float(values["elevation"]),
                2
            ),

            "slope": round(
                float(values["slope"]),
                2
            ),

            "soil_moisture": round(
                float(values["soil_moisture"]),
                4
            ),

            "rainfall": round(
                float(values["rainfall"]),
                2
            )

        }


        print("Environmental data:", result)

        return result


    except Exception as e:

        print("Environmental data error:")
        print(e)

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ============================================
# PREDICTION
# ============================================

@app.post("/predict")
def predict(data: LandslideInput):

    input_data = pd.DataFrame([{

        "elevation": data.elevation,

        "slope": data.slope,

        "soil_moisture": data.soil_moisture,

        "rainfall": data.rainfall,

        "latitude": data.latitude,

        "longitude": data.longitude

    }])


    # ----------------------------------------
    # PREDICTION
    # ----------------------------------------

    prediction = int(
        model.predict(input_data)[0]
    )


    # ----------------------------------------
    # PROBABILITY
    # ----------------------------------------

    probability = float(
        model.predict_proba(input_data)[0][1]
    )


    # ----------------------------------------
    # RISK LEVEL
    # ----------------------------------------

    if probability < 0.30:

        risk_level = "LOW"

    elif probability < 0.60:

        risk_level = "MEDIUM"

    else:

        risk_level = "HIGH"


    # ----------------------------------------
    # RESPONSE
    # ----------------------------------------

    return {
        "prediction": prediction,

        "landslide_probability": round(
            probability,
            4
        ),

        "risk_level": risk_level
    }


@app.get("/risk-grid")
def get_risk_grid():

    try:
        print("Generating Sikkim risk grid...")

    # ============================================
    # USE CACHED RESULT
    # ============================================

   

   
        # --------------------------------------------------
        # 1. EXACT SIKKIM BOUNDARY
        # --------------------------------------------------

        states = ee.FeatureCollection(
            "FAO/GAUL/2015/level1"
        )

        sikkim = (
            states
            .filter(ee.Filter.eq("ADM0_NAME", "India"))
            .filter(ee.Filter.eq("ADM1_NAME", "Sikkim"))
            .geometry()
        )

        # --------------------------------------------------
        # 2. ENVIRONMENTAL DATA
        # --------------------------------------------------

        dem = ee.Image(
            "USGS/SRTMGL1_003"
        ).select("elevation")

        slope_image = ee.Terrain.slope(dem)

        # 2021 ERA5-Land
        era5 = ee.ImageCollection(
            "ECMWF/ERA5_LAND/MONTHLY_AGGR"
        ).filterDate(
            "2021-01-01",
            "2022-01-01"
        )

        soil_moisture_image = (
            era5
            .select("volumetric_soil_water_layer_1")
            .mean()
        )

        rainfall_image = (
            era5
            .select("total_precipitation_sum")
            .sum()
            .multiply(1000)
        )

        # --------------------------------------------------
        # 3. COMBINE ENVIRONMENTAL BANDS
        # --------------------------------------------------

        environment_image = ee.Image.cat([
            dem.rename("elevation"),
            slope_image.rename("slope"),
            soil_moisture_image.rename("soil_moisture"),
            rainfall_image.rename("rainfall")
        ])

        # --------------------------------------------------
        # 4. CREATE GRID POINTS
        # --------------------------------------------------

        grid = []

        min_lat = 27.05
        max_lat = 28.15

        min_lon = 87.95
        max_lon = 88.95

        step = 0.05

        lat = min_lat

        while lat <= max_lat:

            lon = min_lon

            while lon <= max_lon:

                grid.append(
                    ee.Feature(
                        ee.Geometry.Point(
                            [lon, lat]
                        ),
                        {
                            "latitude": lat,
                            "longitude": lon
                        }
                    )
                )

                lon += step

            lat += step

        grid_fc = ee.FeatureCollection(grid)

        # Keep only points inside Sikkim
        grid_fc = grid_fc.filterBounds(sikkim)

        print(
            "Grid points created:",
            len(grid)
        )

        # --------------------------------------------------
        # 5. SAMPLE ENVIRONMENT
        # --------------------------------------------------

        sampled = environment_image.reduceRegions(
            collection=grid_fc,
            reducer=ee.Reducer.first(),
            scale=11132
        )

        data = sampled.getInfo()

        # --------------------------------------------------
        # 6. PREPARE DATA FOR ML MODEL
        # --------------------------------------------------

        records = []

        for feature in data["features"]:

            props = feature["properties"]

            if (
                props.get("elevation") is None
                or props.get("slope") is None
                or props.get("soil_moisture") is None
                or props.get("rainfall") is None
            ):
                continue

            records.append(
                {
                    "elevation": float(
                        props["elevation"]
                    ),
                    "slope": float(
                        props["slope"]
                    ),
                    "soil_moisture": float(
                        props["soil_moisture"]
                    ),
                    "rainfall": float(
                        props["rainfall"]
                    ),
                    "latitude": float(
                        props["latitude"]
                    ),
                    "longitude": float(
                        props["longitude"]
                    )
                }
            )

        if len(records) == 0:

            raise Exception(
                "No environmental grid data available."
            )

        # --------------------------------------------------
        # 7. ML PREDICTION
        # --------------------------------------------------

        df = pd.DataFrame(records)

        predictions = model.predict(df)

        probabilities = model.predict_proba(df)[:, 1]

        # --------------------------------------------------
        # 8. RISK CLASSIFICATION
        # --------------------------------------------------

        results = []

        for i in range(len(df)):

            probability = float(
                probabilities[i]
            )

            if probability < 0.30:

                risk_level = "LOW"

            elif probability < 0.60:

                risk_level = "MEDIUM"

            else:

                risk_level = "HIGH"

            results.append(
                {
                    "latitude": float(
                        df.iloc[i]["latitude"]
                    ),
                    "longitude": float(
                        df.iloc[i]["longitude"]
                    ),
                    "probability": round(
                        probability,
                        4
                    ),
                    "risk_level": risk_level
                }
            )

     # --------------------------------------------------
        # 9. RESPONSE
        # --------------------------------------------------

        return {
            "status": "success",
            "total_points": len(results),
            "points": results
        }

    except Exception as e:

        print(
            "Risk grid error:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
        # ============================================
# REAL HISTORICAL LANDSLIDE POINTS
# ============================================

# ============================================
# REAL HISTORICAL LANDSLIDE POINTS
# ============================================

@app.get("/landslide-points")
def get_landslide_points():

    try:

        landslides = ee.FeatureCollection(
            "projects/cryptic-pipe-490705-k9/assets/Sikkim_Real_Landslide_Points_2021"
        )

        features = landslides.getInfo()["features"]

        points = []

        for feature in features:

            coordinates = feature["geometry"]["coordinates"]

            points.append({
                "latitude": coordinates[1],
                "longitude": coordinates[0]
            })

        return {
            "status": "success",
            "total_points": len(points),
            "points": points
        }

    except Exception as e:

        print(
            "Landslide points error:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
@app.get("/recent-rainfall")
def get_recent_rainfall(
    latitude: float,
    longitude: float
):
    try:

        point = ee.Geometry.Point([
            longitude,
            latitude
        ])

        now = ee.Date.now()
        start = now.advance(-24, "hour")

        rainfall_collection = (
            ee.ImageCollection(
                "NASA/GPM_L3/IMERG_V07"
            )
            .filterDate(start, now)
            .select("precipitation")
        )

        rainfall_image = rainfall_collection.sum()

        rainfall_value = rainfall_image.reduceRegion(
            reducer=ee.Reducer.mean(),
            geometry=point,
            scale=11132,
            bestEffort=True
        ).get("precipitation").getInfo()

        if rainfall_value is None:
            rainfall_value = 0

        return {
            "status": "success",
            "latitude": latitude,
            "longitude": longitude,
            "rainfall_24h": round(
                float(rainfall_value),
                2
            )
        }

    except Exception as e:

        print(
            "Recent rainfall error:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
@app.post("/recent-rainfall")
def get_recent_rainfall(data: LocationInput):
    try:
        point = ee.Geometry.Point([
            data.longitude,
            data.latitude
        ])

        now = datetime.now(timezone.utc)

        available_collection = (
            ee.ImageCollection(
                "NASA/GPM_L3/IMERG_V07"
            )
            .filterDate(
                (
                    now - timedelta(days=7)
                ).strftime("%Y-%m-%dT%H:%M:%S"),
                now.strftime("%Y-%m-%dT%H:%M:%S")
            )
            .select("precipitation")
        )

        image_count = available_collection.size().getInfo()

        if image_count == 0:
            return {
                "status": "success",
                "latitude": data.latitude,
                "longitude": data.longitude,
                "rainfall_24h_mm": 0,
                "data_source": "NASA GPM IMERG V07",
                "window": "No recent GPM data available"
            }

        latest_image = (
            available_collection
            .sort("system:time_start", False)
            .first()
        )

        latest_time = (
            ee.Date(
                latest_image.get("system:time_start")
            )
            .getInfo()
        )

        latest_datetime = datetime.fromtimestamp(
            latest_time["value"] / 1000,
            tz=timezone.utc
        )

        end_time = latest_datetime + timedelta(
            minutes=30
        )

        start_time = end_time - timedelta(
            hours=24
        )

        rainfall_collection = (
            ee.ImageCollection(
                "NASA/GPM_L3/IMERG_V07"
            )
            .filterDate(
                start_time.strftime(
                    "%Y-%m-%dT%H:%M:%S"
                ),
                end_time.strftime(
                    "%Y-%m-%dT%H:%M:%S"
                )
            )
            .select("precipitation")
        )

        rainfall_24h = (
            rainfall_collection
            .sum()
            .multiply(0.5)
            .reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=point,
                scale=11132,
                bestEffort=True
            )
            .get("precipitation")
            .getInfo()
        )

        if rainfall_24h is None:
            rainfall_24h = 0

        return {
            "status": "success",
            "latitude": data.latitude,
            "longitude": data.longitude,
            "rainfall_24h_mm": round(
                float(rainfall_24h),
                2
            ),
            "data_source": "NASA GPM IMERG V07",
            "window": "Last 24 hours"
        }

    except Exception as e:
        print(
            "Recent rainfall error:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )