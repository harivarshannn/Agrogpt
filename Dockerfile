FROM python:3.11-slim

WORKDIR /app

# Upgrade pip
RUN pip install --no-cache-dir --upgrade pip

# Create a non-root user for security (Hugging Face Spaces requires this)
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

WORKDIR $HOME/app

# Copy requirement list to app folder
COPY --chown=user requirements.txt .

# Install PyTorch CPU first to massively save disk size, RAM, and image building time
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu

# Install the remaining dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy everything else with the correct permissions
COPY --chown=user . .

# Set default Environment variables that tell Flask where to bind
ENV HOST=0.0.0.0
ENV PORT=7860

# Expose port (7860 is the default Hugging Face Docker Space port)
EXPOSE 7860

# Start command
CMD ["python", "app.py"]
