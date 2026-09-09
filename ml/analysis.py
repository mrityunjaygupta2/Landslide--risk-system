import pandas as pd
import matplotlib.pyplot as plt
import os


# ==========================================
# SIKKIM LANDSLIDE - 2025 RAINFALL ANALYSIS
# ==========================================

# CSV file path
CSV_PATH = "Sikkim_Landslide_Rainfall_2025.csv"

# Output folder
OUTPUT_DIR = os.path.join(
    os.path.dirname(__file__),
    "analysis_results"
)

os.makedirs(OUTPUT_DIR, exist_ok=True)


# ==========================================
# 1. LOAD DATA
# ==========================================

df = pd.read_csv(CSV_PATH)

print("\n===================================")
print("SIKKIM LANDSLIDE DATA ANALYSIS")
print("===================================\n")

print("Total records:", len(df))

print("\nColumns:")
print(df.columns.tolist())


# ==========================================
# 2. BASIC DATA CHECK
# ==========================================

print("\n===================================")
print("DATA QUALITY CHECK")
print("===================================\n")

print("Missing values:")
print(df.isnull().sum())


# ==========================================
# 3. RAINFALL STATISTICS
# ==========================================

# GEE exported rainfall band is stored as b1
df["rainfall_2025"] = pd.to_numeric(
    df["b1"],
    errors="coerce"
)

rainfall = df["rainfall_2025"]
print("\n===================================")
print("2025 RAINFALL STATISTICS")
print("===================================\n")

print("Minimum rainfall :", round(rainfall.min(), 2), "mm")
print("Maximum rainfall :", round(rainfall.max(), 2), "mm")
print("Average rainfall :", round(rainfall.mean(), 2), "mm")
print("Median rainfall  :", round(rainfall.median(), 2), "mm")

print(
    "25th percentile  :",
    round(rainfall.quantile(0.25), 2),
    "mm"
)

print(
    "75th percentile  :",
    round(rainfall.quantile(0.75), 2),
    "mm"
)


# ==========================================
# 4. SLOPE STATISTICS
# ==========================================

slope = df["Slope"]

print("\n===================================")
print("SLOPE STATISTICS")
print("===================================\n")

print("Minimum slope :", round(slope.min(), 2))
print("Maximum slope :", round(slope.max(), 2))
print("Average slope :", round(slope.mean(), 2))
print("Median slope  :", round(slope.median(), 2))


# ==========================================
# 5. ELEVATION STATISTICS
# ==========================================

elevation = df["Elevation"]

print("\n===================================")
print("ELEVATION STATISTICS")
print("===================================\n")

print("Minimum elevation :", round(elevation.min(), 2), "m")
print("Maximum elevation :", round(elevation.max(), 2), "m")
print("Average elevation :", round(elevation.mean(), 2), "m")
print("Median elevation  :", round(elevation.median(), 2), "m")


# ==========================================
# 6. HIGH RAINFALL LANDSLIDE LOCATIONS
# ==========================================

high_rainfall = df[
    df["rainfall_2025"] >= rainfall.quantile(0.75)
].copy()

print("\n===================================")
print("HIGH RAINFALL LANDSLIDE POINTS")
print("===================================\n")

print(
    "Number of high-rainfall points:",
    len(high_rainfall)
)

print(
    high_rainfall[
        [
            "Name",
            "Elevation",
            "Slope",
            "Geology",
            "rainfall_2025"
        ]
    ].head(20)
)


# Save high rainfall locations
high_rainfall.to_csv(
    os.path.join(
        OUTPUT_DIR,
        "high_rainfall_landslide_points.csv"
    ),
    index=False
)


# ==========================================
# 7. RAINFALL DISTRIBUTION
# ==========================================

plt.figure(figsize=(10, 6))

plt.hist(
    rainfall,
    bins=15,
    edgecolor="black"
)

plt.xlabel("2025 Rainfall (mm)")
plt.ylabel("Number of Landslide Points")
plt.title(
    "2025 Rainfall Distribution at Sikkim Landslide Points"
)

plt.tight_layout()

plt.savefig(
    os.path.join(
        OUTPUT_DIR,
        "rainfall_distribution.png"
    ),
    dpi=300
)

plt.close()


# ==========================================
# 8. SLOPE DISTRIBUTION
# ==========================================

plt.figure(figsize=(10, 6))

plt.hist(
    slope,
    bins=15,
    edgecolor="black"
)

plt.xlabel("Slope (degrees)")
plt.ylabel("Number of Landslide Points")
plt.title(
    "Slope Distribution at Sikkim Landslide Points"
)

plt.tight_layout()

plt.savefig(
    os.path.join(
        OUTPUT_DIR,
        "slope_distribution.png"
    ),
    dpi=300
)

plt.close()


# ==========================================
# 9. ELEVATION DISTRIBUTION
# ==========================================

plt.figure(figsize=(10, 6))

plt.hist(
    elevation,
    bins=15,
    edgecolor="black"
)

plt.xlabel("Elevation (m)")
plt.ylabel("Number of Landslide Points")
plt.title(
    "Elevation Distribution at Sikkim Landslide Points"
)

plt.tight_layout()

plt.savefig(
    os.path.join(
        OUTPUT_DIR,
        "elevation_distribution.png"
    ),
    dpi=300
)

plt.close()


# ==========================================
# 10. RAINFALL vs SLOPE
# ==========================================

plt.figure(figsize=(10, 6))

plt.scatter(
    rainfall,
    slope,
    alpha=0.7
)

plt.xlabel("2025 Rainfall (mm)")
plt.ylabel("Slope (degrees)")
plt.title(
    "Rainfall vs Slope at Landslide Locations"
)

plt.tight_layout()

plt.savefig(
    os.path.join(
        OUTPUT_DIR,
        "rainfall_vs_slope.png"
    ),
    dpi=300
)

plt.close()


# ==========================================
# 11. RAINFALL vs ELEVATION
# ==========================================

plt.figure(figsize=(10, 6))

plt.scatter(
    rainfall,
    elevation,
    alpha=0.7
)

plt.xlabel("2025 Rainfall (mm)")
plt.ylabel("Elevation (m)")
plt.title(
    "Rainfall vs Elevation at Landslide Locations"
)

plt.tight_layout()

plt.savefig(
    os.path.join(
        OUTPUT_DIR,
        "rainfall_vs_elevation.png"
    ),
    dpi=300
)

plt.close()


# ==========================================
# 12. CORRELATION
# ==========================================

print("\n===================================")
print("CORRELATION ANALYSIS")
print("===================================\n")

correlation = df[
    [
        "rainfall_2025",
        "Slope",
        "Elevation"
    ]
].corr()

print(correlation)


# Save correlation matrix
correlation.to_csv(
    os.path.join(
        OUTPUT_DIR,
        "correlation_matrix.csv"
    )
)


# ==========================================
# 13. FINAL MESSAGE
# ==========================================

print("\n===================================")
print("ANALYSIS COMPLETED SUCCESSFULLY")
print("===================================\n")

print(
    "Results saved in:"
)

print(OUTPUT_DIR)

print("\nGenerated files:")

for file in os.listdir(OUTPUT_DIR):
    print(" -", file)