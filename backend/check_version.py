from sqlalchemy import create_engine, text

# Adjust connection string as needed, usually it's in .env or config
# Assuming sqlite since I saw car_rental.db
engine = create_engine("sqlite:///car_rental.db")

with engine.connect() as conn:
    try:
        result = conn.execute(text("SELECT * FROM alembic_version"))
        print("Current version:", result.fetchall())
    except Exception as e:
        print("Error:", e)
