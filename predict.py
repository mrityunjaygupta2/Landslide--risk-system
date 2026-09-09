import joblib
import pandas as pd

# Load trained model
model = joblib.load("landslide_model.pkl")

# Test location environmental data
data = pd.DataFrame([{
    "elevation": 1800,
    "slope": 25,
    "soil_moisture": 0.25,
    "rainfall": 1500,
    "landcover": 5,
    "longitude": 88.5,
    "latitude": 27.5
}])

# Features must be in the same order used during training
features = [
    "elevation",
    "slope",
    "soil_moisture",
    "rainfall",
    "landcover",
    "longitude",
    "latitude"
]

# Prediction
prediction = model.predict(data[features])[0]

# Probability of landslide
probability = model.predict_proba(data[features])[0][1]

# Convert probability into risk level
if probability < 0.30:
    risk = "LOW"
elif probability < 0.60:
    risk = "MEDIUM"
else:
    risk = "HIGH"

print("\n==============================")
print("LANDSLIDE RISK PREDICTION")
print("==============================")

print(f"Landslide Prediction: {prediction}")
print(f"Landslide Probability: {probability:.2f}")
print(f"Risk Level: {risk}")