docker run -d \
  --name postgres_container2 \
  -p 5432:5432 \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=root \
  -e POSTGRES_DB=roomdb \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:latest
