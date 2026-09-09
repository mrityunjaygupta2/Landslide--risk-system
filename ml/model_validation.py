import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)

# ============================================
# 1. LOAD DATA
# ============================================

DATA_PATH = "Sikkim_Real_Landslide_ML_Training_Data.csv"
MODEL_PATH = "landslide_model.pkl"

data = pd.read_csv(DATA_PATH)

print("===================================")
print(" SIKKIM LANDSLIDE MODEL VALIDATION")
print("===================================")

print("\nTotal samples:", len(data))

# ============================================
# 2. FEATURES
# ============================================

features = [
    "elevation",
    "slope",
    "soil_moisture",
    "rainfall",
    "latitude",
    "longitude"
]

X = data[features]
y = data["landslide"]

print("\nFeatures used:")
print(features)

print("\nClass distribution:")
print(y.value_counts())

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
# 4. LOAD EXISTING MODEL
# ============================================

model = joblib.load(MODEL_PATH)

print("\n✅ Existing landslide model loaded.")

# ============================================
# 5. PREDICTION
# ============================================

y_pred = model.predict(X_test)

# ============================================
# 6. PERFORMANCE METRICS
# ============================================

accuracy = accuracy_score(y_test, y_pred)

precision = precision_score(
    y_test,
    y_pred,
    zero_division=0
)

recall = recall_score(
    y_test,
    y_pred,
    zero_division=0
)

f1 = f1_score(
    y_test,
    y_pred,
    zero_division=0
)

# ============================================
# 7. RESULTS
# ============================================

print("\n===================================")
print(" MODEL PERFORMANCE")
print("===================================")

print(f"\nAccuracy  : {accuracy * 100:.2f}%")
print(f"Precision : {precision * 100:.2f}%")
print(f"Recall    : {recall * 100:.2f}%")
print(f"F1 Score  : {f1 * 100:.2f}%")

# ============================================
# 8. CONFUSION MATRIX
# ============================================

cm = confusion_matrix(y_test, y_pred)

print("\n===================================")
print(" CONFUSION MATRIX")
print("===================================")

print(cm)

# ============================================
# 9. CLASSIFICATION REPORT
# ============================================

print("\n===================================")
print(" CLASSIFICATION REPORT")
print("===================================")

print(
    classification_report(
        y_test,
        y_pred,
        zero_division=0
    )
)

print("\n===================================")
print(" VALIDATION COMPLETE")
# ===================================
# SAVE VALIDATION RESULTS
# ===================================

results = {
    "Accuracy": accuracy * 100,
    "Precision": precision * 100,
    "Recall": recall * 100,
    "F1 Score": f1 * 100
}

results_df = pd.DataFrame(
    [results]
)

results_df.to_csv(
    "model_validation_results.csv",
    index=False
)

print("\nValidation results saved to:")
print("model_validation_results.csv")
print("===================================")