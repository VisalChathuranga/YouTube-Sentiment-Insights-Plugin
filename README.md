# 🎥 YouTube Sentiment Insights 🚀

Welcome to **YouTube Sentiment Insights**, an AI-powered Chrome
extension and backend system designed to analyze the sentiment of
YouTube video comments!\
This project leverages **Machine Learning, Data Versioning, and a
Scalable API** to provide real-time **sentiment analysis,
visualizations, and trends**.\
Built with ❤️ using **Python, Flask, MLflow, DVC, and a custom Chrome
extension.**

------------------------------------------------------------------------

## 🌟 Project Overview

This repository contains a complete pipeline for sentiment analysis of
YouTube comments, from **data ingestion to deployment**.

### 🔑 Key Components

-   🧹 **Preprocessing & EDA**: Data cleaning and exploratory analysis.\
-   🔬 **MLflow Experiments**: Experimentation with various algorithms
    and techniques.\
-   ⚙️ **ML Pipeline with DVC**: Versioned data and model workflows.\
-   🌐 **Flask API Backend**: A RESTful API for predictions and
    visualizations.\
-   🖥️ **Chrome Extension Frontend**: Interactive UI for real-time
    sentiment insights.

------------------------------------------------------------------------

## 🛠️ Getting Started

### ✅ Prerequisites

-   **Python 3.11** (Required)\
-   **Conda** (Recommended for environment management)

### 📦 Installation


# Create a new Conda environment
``` bash
conda create -n youtube_insights python=3.11 -y
```

# Activate the environment
``` bash
conda activate youtube_insights
```

# Install dependencies
``` bash
pip install -r requirements.txt
```

------------------------------------------------------------------------

## 📊 Preprocessing & EDA

-   **Data Ingestion**: Fetches YouTube comments.\
-   **Preprocessing**: NLTK-based lowercase conversion, stopword removal
    (with exceptions like *not*), and lemmatization.\
-   **EDA**: Comment distributions, sentiment patterns, and text
    statistics for model insights.

------------------------------------------------------------------------

## 🧪 MLflow Experiments

### 🔍 Experiments Conducted

-   🌲 **Random Forest Algorithm**: Baseline classifier for sentiments.\
-   📊 **BOW vs TF-IDF**: Compared unigram, bigram, and trigram
    settings.\
-   🔠 **Max Features Tuning**: Tested 500, 1000, 2000 features for
    TF-IDF.\
-   ⚖️ **Class Imbalance Handling**: Oversampling, undersampling, and
    class weights.\
-   🤖 **Other Models**: Logistic Regression, SVM, and LightGBM.\
-   🏆 **Stacking Ensemble**: Combined Random Forest + LightGBM for
    higher accuracy.

🔗 **Tracking**: All experiments logged with **MLflow** (metrics,
parameters, artifacts, confusion matrices).

------------------------------------------------------------------------

## 🔄 ML Pipeline with DVC

DVC ensures reproducibility and version control.


# Initialize DVC
``` bash
dvc init
```

# Run the pipeline
``` bash
dvc repro
```

# Visualize the DAG
``` bash
dvc dag
```

### 📌 Pipeline Stages

1.  **data_ingestion** → Loads and splits data\
2.  **data_preprocessing** → Cleans and normalizes text\
3.  **model_building** → Trains LightGBM with TF-IDF\
4.  **model_evaluation** → Logs metrics to MLflow\
5.  **model_registration** → Registers final model

------------------------------------------------------------------------

## 🌐 Flask API Backend

The backend is a **Flask-based REST API** (port **5000**) with multiple
endpoints:

### 📍 Endpoints

-   `POST /predict` → Predicts sentiment for input comments\
-   `POST /predict_with_timestamps` → Adds timestamps\
-   `GET /generate_chart` → Sentiment distribution pie chart\
-   `GET /generate_wordcloud` → Word cloud from comments\
-   `GET /generate_trend_graph` → Sentiment trends over time

#### Example (Postman)

``` json
POST http://localhost:5000/predict
{
  "comments": [
    "This video is awesome! I loved a lot",
    "Very bad explanation. poor video"
  ]
}
```

Response →

``` json
{
  "sentiments": [1, -1]
}
```

------------------------------------------------------------------------

## 🎨 YouTube Sentiment Analysis Frontend

-   🧩 **Chrome Extension** with interactive sentiment insights.\
-   📈 **Features**:
    -   Sentiment distribution charts\
    -   Word clouds\
    -   Trend graphs\
    -   Top comment analysis with timestamps

👉 Load the `yt-chrome-plugin-frontend` folder via
**chrome://extensions**

------------------------------------------------------------------------

## ☁️ AWS Deployment

-   **AWS CLI Configuration**\

``` bash
aws configure
```

-   Push Docker image to **ECR**\
-   Deploy via **EC2 Self-Hosted Runner**

------------------------------------------------------------------------

## 🚀 CI/CD with GitHub Actions

-   ⚡ **Automated Workflow**: Build → Push → Deploy\
-   🔑 **Secrets Required**:
    -   `AWS_ACCESS_KEY_ID`\
    -   `AWS_SECRET_ACCESS_KEY`\
    -   `AWS_DEFAULT_REGION`\
    -   `ECR_REPO`\
-   🚨 Triggered on `push` to `main` branch

------------------------------------------------------------------------

## 📝 Contributing

💡 Contributions are welcome! Fork the repo, submit issues, or open PRs.

------------------------------------------------------------------------

## 📜 License

🆓 MIT License -- Free to use and modify!

------------------------------------------------------------------------
