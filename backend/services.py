import pandas as pd
from statsmodels.tsa.arima.model import ARIMA
import warnings
import os

# Suppress warnings from statsmodels for a cleaner output
warnings.filterwarnings("ignore")

# Make the path relative to the current file's location for robustness
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE_PATH = os.path.join(BASE_DIR, 'data', 'statestats.csv')

def get_aggregated_states_data():
    """
    Reads the CSV, standardizes column names, aggregates data by state,
    and returns the resulting pandas DataFrame.
    """
    if not os.path.exists(DATA_FILE_PATH):
        raise FileNotFoundError(f"Data file not found. Please place it at {DATA_FILE_PATH}")

    df = pd.read_csv(DATA_FILE_PATH)
    
    # Standardize column names to match the expected format
    df.rename(columns={
        'region': 'State',
        'activeCases': 'Active',
        'recovered': 'Recovered',
        'death': 'Deaths',
        'totalInfected': 'Confirmed'
    }, inplace=True)

    # Group data by the 'State' column and sum the numeric values
    agg_df = df.groupby('State')[['Confirmed', 'Recovered', 'Deaths', 'Active']].sum().reset_index()
    return agg_df

def get_arima_predictions(state_name):
    """
    Generates time-series predictions for a given state using an ARIMA model.
    """
    try:
        agg_df = get_aggregated_states_data()
        state_data = agg_df[agg_df['State'].str.lower() == state_name.lower()]

        if state_data.empty:
            return {"error": "State not found in the dataset"}

        current_stats = state_data.iloc[0]

        # --- SIMULATED HISTORICAL DATA FOR MODEL TRAINING ---
        # ARIMA requires a time series. Since we only have a single data point per state,
        # we simulate 30 days of historical data with a simple trend to train the model.
        history = {
            'confirmed': [int(current_stats['Confirmed'] * (1 - 0.02 * (30 - i))) for i in range(30)],
            'recovered': [int(current_stats['Recovered'] * (1 - 0.02 * (30 - i))) for i in range(30)],
            'deaths': [int(current_stats['Deaths'] * (1 - 0.01 * (30 - i))) for i in range(30)],
        }
        
        predictions = {}

        # Train a model and forecast for each key metric
        for metric in ['confirmed', 'recovered', 'deaths']:
            series = history[metric]
            
            # Fit ARIMA model. The (p,d,q) order is chosen for simplicity.
            model = ARIMA(series, order=(5, 1, 0))
            model_fit = model.fit()
            
            # Forecast for the next 20 days
            forecast = model_fit.forecast(steps=20)
            predictions[metric] = [round(val) for val in forecast]
            
        return predictions

    except Exception as e:
        return {"error": f"An error occurred during prediction: {str(e)}"}