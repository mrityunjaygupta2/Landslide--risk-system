import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix


# ============================================
# 1. LOAD DATASET
# ============================================

data_path = "../data/Sikkim_Real_Landslide_ML_Training_Data.csv"

df = pd.read_csv(data_path)

print("Dataset loaded successfully!")
print("Dataset shape:", df.shape)

print("\nColumns:")
print(df.columns.tolist())


# ============================================
# 2. SELECT FEATURES
# ============================================

features = [
    "elevation",
    "slope",
    "soil_moisture",
    "rainfall",
    "latitude",
    "longitude"
]

target = "landslide"

X = df[features]
y = df[target]


# ============================================
# 3. TRAIN / TEST SPLIT
# ============================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print("\nTraining samples:", len(X_train))
print("Testing samples:", len(X_test))


# ============================================
# 4. RANDOM FOREST MODEL
# ============================================

model = RandomForestClassifier(
    n_estimators=200,
    random_state=42,
    class_weight="balanced"
)

model.fit(X_train, y_train)


# ============================================
# 5. PREDICTION
# ============================================

y_pred = model.predict(X_test)


# ============================================
# 6. MODEL EVALUATION
# ============================================

accuracy = accuracy_score(y_test, y_pred)

print("\n================================")
print("MODEL RESULTS")
print("================================")

print("Accuracy:", round(accuracy, 4))

print("\nClassification Report:")
print(classification_report(y_test, y_pred))

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))


# ============================================
# 7. FEATURE IMPORTANCE
# ============================================

print("\n================================")
print("FEATURE IMPORTANCE")
print("================================")

importance = pd.DataFrame({
    "feature": features,
    "importance": model.feature_importances_
})

importance = importance.sort_values(
    by="importance",
    ascending=False
)

print(importance)


# ============================================
# 8. SAVE MODEL
# ============================================

model_path = "landslide_model.pkl"

joblib.dump(model, model_path)

print("\n================================")
print("MODEL SAVED SUCCESSFULLY")
print("================================")

print("Saved as:", model_path)