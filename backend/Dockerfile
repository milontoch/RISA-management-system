# Use official PHP image
FROM php:8.1-cli

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Set working directory
WORKDIR /app

# Copy application files
COPY . .

# Create uploads directory if it doesn't exist
RUN mkdir -p uploads

# Set permissions
RUN chmod -R 755 public/
RUN chmod -R 755 uploads/

# Expose port
EXPOSE 8000

# Start PHP server
CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"] 