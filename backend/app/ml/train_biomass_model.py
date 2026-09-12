import os
import json
import logging
from pathlib import Path
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
import joblib

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("train_biomass_ml")

FEATURE_NAMES = [
    "temperature",
    "ph",
    "dissolved_oxygen",
    "turbidity",
    "co2_concentration",
    "light_intensity",
    "previous_biomass",
    "water_level"
]

def train_and_export_model():
    base_dir = Path(__file__).resolve().parent.parent.parent
    data_path = base_dir / "data" / "raw" / "microalgae_biomass_zenodo_dataset.csv"
    model_export_path = Path(__file__).resolve().parent / "biomass_model.joblib"
    metrics_export_path = Path(__file__).resolve().parent / "model_evaluation.json"

    if not data_path.exists():
        raise FileNotFoundError(f"Zenodo training dataset not found at {data_path}")

    logger.info(f"Loading Zenodo microalgae biomass dataset from {data_path}...")
    df = pd.read_csv(data_path)

    X = df[FEATURE_NAMES]
    y = df["target_biomass"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, shuffle=True
    )

    logger.info(f"Training RandomForestRegressor on {len(X_train)} samples with 100 estimators...")
    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=12,
        min_samples_split=4,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train)

    # Predictions & evaluation
    y_pred = model.predict(X_test)
    r2 = float(r2_score(y_test, y_pred))
    rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
    mae = float(mean_absolute_error(y_test, y_pred))

    cv_scores = cross_val_score(model, X, y, cv=5, scoring="r2")
    cv_mean = float(cv_scores.mean())
    cv_std = float(cv_scores.std())

    feature_importances = {
        feat: round(float(imp), 4)
        for feat, imp in zip(FEATURE_NAMES, model.feature_importances_)
    }

    # Save model artifact
    joblib.dump(model, model_export_path)
    logger.info(f"Model saved to {model_export_path}")

    # Save metrics evaluation report
    eval_report = {
        "dataset_name": "Zenodo Microalgae (Chlorella vulgaris) Biomass Dataset",
        "total_samples": len(df),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "algorithm": "RandomForestRegressor",
        "parameters": {
            "n_estimators": 100,
            "max_depth": 12,
            "random_state": 42
        },
        "metrics": {
            "r2_score": round(r2, 4),
            "rmse": round(rmse, 4),
            "mae": round(mae, 4),
            "cv_5fold_r2_mean": round(cv_mean, 4),
            "cv_5fold_r2_std": round(cv_std, 4)
        },
        "feature_importances": feature_importances
    }

    with open(metrics_export_path, "w", encoding="utf-8") as f:
        json.dump(eval_report, f, indent=2)

    logger.info(f"Evaluation report saved to {metrics_export_path}")
    print("\n--- Model Training Summary ---")
    print(f"Dataset samples: {len(df)}")
    print(f"R² Score: {r2:.4f}")
    print(f"RMSE: {rmse:.4f} g/L")
    print(f"MAE: {mae:.4f} g/L")
    print(f"5-Fold CV R²: {cv_mean:.4f} (+/- {cv_std:.4f})")
    print("Feature Importances:")
    for f_name, imp in sorted(feature_importances.items(), key=lambda x: x[1], reverse=True):
        print(f"  {f_name:20s}: {imp:.4f}")

    return eval_report

if __name__ == "__main__":
    train_and_export_model()
