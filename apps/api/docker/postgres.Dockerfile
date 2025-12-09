FROM postgis/postgis:16-3.4

# Install build dependencies for pgvector (including clang-13 for LTO)
RUN apt-get update && apt-get install -y \
    git \
    build-essential \
    postgresql-server-dev-16 \
    clang-13 \
    llvm-13 \
    && rm -rf /var/lib/apt/lists/*

# Install pgvector
# Note: Using latest stable version, building without LTO to avoid clang dependency
RUN cd /tmp && \
    git clone https://github.com/pgvector/pgvector.git && \
    cd pgvector && \
    git checkout $(git describe --tags --abbrev=0) && \
    make && \
    make install && \
    cd / && \
    rm -rf /tmp/pgvector

# Clean up build dependencies to reduce image size
RUN apt-get purge -y git build-essential postgresql-server-dev-16 && \
    apt-get autoremove -y && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
