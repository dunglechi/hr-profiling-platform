# HR Profiling Platform

This project is a CV screening platform that uses GenAI to match CVs with job requirements, supplemented with numerology and DISC personality insights.

## Setup

### Backend

1.  **Create a virtual environment:**
    ```bash
    python -m venv .venv
    ```

2.  **Activate the virtual environment:**
    -   On Windows:
        ```bash
        .venv\Scripts\activate
        ```
    -   On macOS/Linux:
        ```bash
        source .venv/bin/activate
        ```

3.  **Install dependencies:**
    ```bash
    pip install -r backend/requirements.txt
    ```

4.  **Set up environment variables:**
    -   Copy `backend/.env.example` to `backend/.env`:
        ```bash
        cp backend/.env.example backend/.env
        ```
    -   Open `backend/.env` and fill in your credentials for `GEMINI_API_KEY`, `SUPABASE_URL`, and `SUPABASE_KEY`.

5.  **Run the development server:**
    ```bash
    python backend/src/app.py
    ```

### Frontend

(Instructions to be added)

### DISC CSV Upload Format

The `/api/disc/upload-csv` endpoint accepts a CSV file with the following columns:
- `candidate_id`: Unique identifier for the candidate.
- `name`: Full name of the candidate.
- `d_score`: Dominance score (1-10).
- `i_score`: Influence score (1-10).
- `s_score`: Steadiness score (1-10).
- `c_score`: Conscientiousness score (1-10).

The server will validate the headers and the score ranges.

### Supabase Integration

To store analysis results, the backend connects to a Supabase project. You need to provide the following environment variables in a `backend/.env` file:

- `SUPABASE_URL`: The URL of your Supabase project.
- `SUPABASE_KEY`: The `anon` public key for your Supabase project.

You can find these in your Supabase project's "Settings" > "API" section.
